'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { Metaplex, walletAdapterIdentity as metaplexWalletAdapter } from '@metaplex-foundation/js';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { hasPresalePass, createMintPresalePassTransaction, createBurnPresalePassTransaction, PRESALE_PASS_MINT, MINT_AUTHORITY } from '@/lib/presalePass';
import { createMintNFTFromCMv2Transaction } from '@/lib/mintCMv2';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { fetchCandyMachine, mint, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { publicKey as umiPublicKey, generateSigner, some, none } from '@metaplex-foundation/umi';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const CANDY_MACHINE_ID = 'EUNaHjFghfqhXd1jDbRJF3PuZrobhfLcQT2WfwbxQPG5'; // CM v2 - no guards!
const CANDY_MACHINE_CREATOR = '8qkJCjT3DgHzmTE3JsjBsutXpia7paPfuUDKsiFczDbq'; // From cache-new.json
const COLLECTION_MINT = '4K74nmy4E7KprxmDTp9hkWkC4RkBHtkdzvVrDhMHY47C'; // From cache.json
const COLLECTION_UPDATE_AUTHORITY = 'D2nUJVgRMHgeAH8Zw3gCMjhgRZin9xmjSuStSZjtqkC2'; // Your wallet

export default function MintPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [candyMachineInfo, setCandyMachineInfo] = useState<any>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<{ type: string; message: string } | null>(null);
  const [presalePassBalance, setPresalePassBalance] = useState<number>(0);
  const [isCheckingPass, setIsCheckingPass] = useState(false);

  // Get balance
  useEffect(() => {
    if (wallet.publicKey) {
      connection.getBalance(wallet.publicKey).then((bal) => {
        setBalance(bal / LAMPORTS_PER_SOL);
      });
    }
  }, [wallet.publicKey, connection]);

  // Check for presale pass
  useEffect(() => {
    const checkPresalePass = async () => {
      if (!wallet.publicKey) {
        setPresalePassBalance(0);
        return;
      }

      setIsCheckingPass(true);
      try {
        const passInfo = await hasPresalePass(connection, wallet.publicKey);
        setPresalePassBalance(passInfo.balance);
        console.log('Presale pass balance:', passInfo.balance);
      } catch (error) {
        console.error('Error checking presale pass:', error);
        setPresalePassBalance(0);
      } finally {
        setIsCheckingPass(false);
      }
    };

    checkPresalePass();
  }, [wallet.publicKey, connection]);

  // Get Candy Machine info
  useEffect(() => {
    const fetchCandyMachine = async () => {
      try {
        const metaplex = Metaplex.make(connection);
        const candyMachine = await metaplex.candyMachines().findByAddress({
          address: new PublicKey(CANDY_MACHINE_ID),
        });
        console.log('Candy Machine loaded:', candyMachine);
        setCandyMachineInfo(candyMachine);
      } catch (error) {
        console.error('Error fetching candy machine:', error);
      }
    };

    fetchCandyMachine();
  }, [connection]);

  // Buy presale pass
  const buyPresalePass = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setMintStatus({ type: 'error', message: 'Please connect your wallet first!' });
      return;
    }

    setIsMinting(true);
    setMintStatus({ type: 'info', message: 'Purchasing presale pass...' });

    try {
      // Create payment transaction
      const transaction = await createMintPresalePassTransaction(
        connection,
        wallet.publicKey,
        MINT_AUTHORITY
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign and send transaction
      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      
      setMintStatus({ type: 'info', message: 'Confirming payment...' });
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });

      // Call API to mint presale pass token
      setMintStatus({ type: 'info', message: 'Minting presale pass token...' });
      const response = await fetch('/api/mint-presale-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPublicKey: wallet.publicKey.toString(),
          paymentSignature: signature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mint presale pass');
      }

      setMintStatus({
        type: 'success',
        message: `✅ Presale pass purchased! Signature: ${data.signature}`,
      });

      // Refresh balances
      const bal = await connection.getBalance(wallet.publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
      
      const passInfo = await hasPresalePass(connection, wallet.publicKey);
      setPresalePassBalance(passInfo.balance);

    } catch (error: any) {
      console.error('Buy presale pass error:', error);
      setMintStatus({ type: 'error', message: `❌ Failed: ${error.message}` });
    } finally {
      setIsMinting(false);
    }
  };

  // Mint NFT with presale pass burn
  const mintWithPassBurn = async () => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      setMintStatus({ type: 'error', message: 'Please connect your wallet first!' });
      return;
    }

    if (presalePassBalance === 0) {
      setMintStatus({ type: 'error', message: 'You need a presale pass to use this option!' });
      return;
    }

    setIsMinting(true);
    setMintStatus({ type: 'info', message: 'Burning presale pass and minting NFT...' });

    try {
      // 1. Burn presale pass
      const burnTransaction = await createBurnPresalePassTransaction(connection, wallet.publicKey);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      burnTransaction.recentBlockhash = blockhash;
      burnTransaction.feePayer = wallet.publicKey;

      const signedBurn = await wallet.signTransaction(burnTransaction);
      const burnSig = await connection.sendRawTransaction(signedBurn.serialize());
      
      setMintStatus({ type: 'info', message: 'Presale pass burned, minting NFT...' });
      await connection.confirmTransaction({ signature: burnSig, blockhash, lastValidBlockHeight });

      // 2. Mint NFT (free, since pass was burned)
      const walletAdapter = {
        publicKey: wallet.publicKey,
        signTransaction: async (transaction: any) => {
          if (!wallet.signTransaction) throw new Error('Wallet does not support signing');
          return await wallet.signTransaction(transaction);
        },
        signAllTransactions: async (transactions: any[]) => {
          if (!wallet.signAllTransactions) throw new Error('Wallet does not support signing multiple transactions');
          return await wallet.signAllTransactions(transactions);
        },
      };

      // 2. Mint NFT from CM v2 using Metaplex JS SDK (no guards!)
      const metaplex = Metaplex.make(connection).use(metaplexWalletAdapter(walletAdapter));

      console.log('Minting from CM v2:', CANDY_MACHINE_ID);
      console.log('Minting as:', wallet.publicKey.toString());

      const candyMachineAddress = new PublicKey(CANDY_MACHINE_ID);
      
      // Load the candy machine first
      const candyMachine = await metaplex.candyMachines().findByAddress({ address: candyMachineAddress });
      
      console.log('CM loaded, items remaining:', candyMachine.itemsRemaining.toString());
      
      // Mint from CM v2 - no guards, just direct mint
      const { nft } = await metaplex.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: wallet.publicKey,
      });

      console.log('NFT minted:', nft.address.toString());

      setMintStatus({
        type: 'success',
        message: `✅ Success! NFT Minted with presale pass: ${nft.address.toString()}`,
      });

      // Refresh balances
      const bal = await connection.getBalance(wallet.publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
      
      const passInfo = await hasPresalePass(connection, wallet.publicKey);
      setPresalePassBalance(passInfo.balance);

      // Refresh CM info
      const refreshedCM = await metaplex.candyMachines().findByAddress({ address: candyMachineAddress });
      setCandyMachineInfo(refreshedCM);

    } catch (error: any) {
      console.error('Mint with pass burn error:', error);
      setMintStatus({ type: 'error', message: `❌ Failed: ${error.message}` });
    } finally {
      setIsMinting(false);
    }
  };

  const mintNFT = async (group?: string) => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      setMintStatus({ type: 'error', message: 'Please connect your wallet first!' });
      return;
    }

    setIsMinting(true);
    setMintStatus({ type: 'info', message: `Minting ${group ? 'Pre-Sale' : 'Regular'} NFT...` });

    try {
      // Create wallet adapter for Metaplex
      const walletAdapter = {
        publicKey: wallet.publicKey,
        signTransaction: async (transaction: any) => {
          if (!wallet.signTransaction) throw new Error('Wallet does not support signing');
          return await wallet.signTransaction(transaction);
        },
        signAllTransactions: async (transactions: any[]) => {
          if (!wallet.signAllTransactions) throw new Error('Wallet does not support signing multiple transactions');
          return await wallet.signAllTransactions(transactions);
        },
      };

      const metaplex = Metaplex.make(connection).use(metaplexWalletAdapter(walletAdapter));

      const mintParams: any = {
        candyMachine: new PublicKey(CANDY_MACHINE_ID),
      };

      if (group) {
        mintParams.group = group;
      }

      console.log('Minting with params:', mintParams);
      console.log('Wallet public key:', wallet.publicKey?.toString());
      const { nft } = await metaplex.candyMachines().mint(mintParams);

      setMintStatus({
        type: 'success',
        message: `✅ Success! NFT Minted: ${nft.address.toString()}`,
      });

      // Refresh balance and CM info
      if (wallet.publicKey) {
        const bal = await connection.getBalance(wallet.publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      }

      const candyMachine = await metaplex.candyMachines().findByAddress({
        address: new PublicKey(CANDY_MACHINE_ID),
      });
      setCandyMachineInfo(candyMachine);

    } catch (error: any) {
      console.error('Mint error:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        cause: error?.cause,
        logs: error?.logs,
      });
      
      let errorMsg = error?.message || error?.toString() || 'Unknown error';
      
      if (errorMsg.includes('0x1775')) {
        errorMsg = 'Pre-sale is sold out! Please use regular mint.';
      } else if (errorMsg.includes('insufficient')) {
        errorMsg = 'Insufficient SOL balance.';
      } else if (errorMsg.includes('toBuffer')) {
        errorMsg = 'Wallet connection issue. Please disconnect and reconnect your wallet.';
      }
      
      setMintStatus({ type: 'error', message: `❌ Mint failed: ${errorMsg}` });
    } finally {
      setIsMinting(false);
    }
  };

  const itemsRedeemed = candyMachineInfo?.itemsRedeemed?.toNumber() || 0;
  const itemsAvailable = candyMachineInfo?.itemsAvailable?.toNumber() || 100;
  const remaining = itemsAvailable - itemsRedeemed;
  const presaleRedeemed = Math.min(itemsRedeemed, 10);
  const presaleRemaining = Math.max(0, 10 - presaleRedeemed);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.badge}>🚀 MAINNET TEST</span>
        </div>

        <h1 style={styles.title}>🎮 Pawnz NFT</h1>
        <p style={styles.subtitle}>Presale Pass System - Mainnet Test</p>

        <div style={styles.infoBox}>
          <strong>Candy Machine:</strong><br />
          <code style={styles.code}>{CANDY_MACHINE_ID}</code>
        </div>

        <div style={styles.walletSection}>
          <WalletMultiButtonDynamic />
          
          {wallet.connected && (
            <div style={styles.walletInfo}>
              <div style={styles.infoRow}>
                <strong>Wallet:</strong>
                <span>{wallet.publicKey?.toString().slice(0, 8)}...{wallet.publicKey?.toString().slice(-8)}</span>
              </div>
              <div style={styles.infoRow}>
                <strong>Balance:</strong>
                <span style={styles.balance}>{balance?.toFixed(2)} SOL</span>
              </div>
              <div style={styles.infoRow}>
                <strong>Presale Passes:</strong>
                <span style={styles.passBalance}>{presalePassBalance} 🎫</span>
              </div>
            </div>
          )}
        </div>

        {wallet.connected && (
          <>
            <div style={styles.mintCard}>
              <div style={styles.mintHeader}>
                <div style={styles.mintTitle}>🎫 Buy Presale Pass</div>
                <div style={styles.mintPrice}>0.001 SOL</div>
              </div>
              <div style={styles.mintDetails}>
                Purchase a presale pass token for 0.001 SOL. Use it later to mint an NFT for free!
              </div>
              <div style={styles.mintStats}>
                <div>
                  <strong>Your Passes:</strong> {presalePassBalance} 🎫
                </div>
              </div>
              <button
                onClick={buyPresalePass}
                disabled={isMinting}
                style={{
                  ...styles.button,
                  ...styles.buttonPresale,
                  ...(isMinting ? styles.buttonDisabled : {}),
                }}
              >
                {isMinting ? 'Processing...' : 'Buy Presale Pass (0.001 SOL)'}
              </button>
            </div>

            <div style={styles.mintCard}>
              <div style={styles.mintHeader}>
                <div style={styles.mintTitle}>⚡ Mint with Pass</div>
                <div style={styles.mintPrice}>{presalePassBalance > 0 ? 'FREE (Burns 1 Pass)' : '0.001 SOL'}</div>
              </div>
              <div style={styles.mintDetails}>
                {presalePassBalance > 0 
                  ? 'Burn 1 presale pass to mint an NFT for free!' 
                  : 'You need a presale pass to use this option. Buy one above!'}
              </div>
              <div style={styles.mintStats}>
                <div>
                  <strong>Available:</strong> {remaining} / {itemsAvailable}
                </div>
              </div>
              <button
                onClick={mintWithPassBurn}
                disabled={isMinting || presalePassBalance === 0}
                style={{
                  ...styles.button,
                  ...styles.buttonRegular,
                  ...(isMinting || presalePassBalance === 0 ? styles.buttonDisabled : {}),
                }}
              >
                {presalePassBalance === 0 ? 'Need Presale Pass' : isMinting ? 'Minting...' : 'Mint with Pass (FREE)'}
              </button>
            </div>
          </>
        )}

        {mintStatus && (
          <div style={{
            ...styles.status,
            ...(mintStatus.type === 'success' ? styles.statusSuccess :
                mintStatus.type === 'error' ? styles.statusError : styles.statusInfo)
          }}>
            {mintStatus.message}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  badge: {
    display: 'inline-block',
    background: '#f59e0b',
    color: 'white',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '10px',
    fontSize: '2.5rem',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px',
    fontSize: '1rem',
  },
  infoBox: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '0.85rem',
    color: '#666',
  },
  code: {
    fontFamily: 'monospace',
    wordBreak: 'break-all',
    fontSize: '0.8rem',
  },
  walletSection: {
    marginBottom: '30px',
  },
  walletInfo: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px',
    marginTop: '15px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  balance: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#667eea',
  },
  passBalance: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  mintCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '20px',
  },
  mintHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  mintTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
  },
  mintPrice: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#667eea',
  },
  mintDetails: {
    color: '#666',
    marginBottom: '15px',
    lineHeight: '1.6',
  },
  mintStats: {
    marginBottom: '15px',
    fontSize: '0.9rem',
    color: '#666',
  },
  button: {
    width: '100%',
    padding: '15px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  buttonPresale: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
  },
  buttonRegular: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  status: {
    marginTop: '20px',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '0.95rem',
  },
  statusSuccess: {
    background: '#d1fae5',
    color: '#065f46',
    border: '1px solid #6ee7b7',
  },
  statusError: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
  },
  statusInfo: {
    background: '#dbeafe',
    color: '#1e40af',
    border: '1px solid #93c5fd',
  },
};
