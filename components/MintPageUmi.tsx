'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { fetchCandyMachine, mintV2, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { publicKey } from '@metaplex-foundation/umi';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import { transactionBuilder } from '@metaplex-foundation/umi';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

// TODO: Replace with your **mainnet test** Candy Machine V3 address
// from deployment-v3-mainnet.json (deploy-cm-v3-mainnet.mjs).
const CANDY_MACHINE_ID = 'FNGdN51cFFsCLMiiiySrWiggQB6ASkaMEc7Ud7p4YGNc';

export default function MintPageUmi() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [candyMachineData, setCandyMachineData] = useState<any>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<{ type: string; message: string } | null>(null);

  // Get balance
  useEffect(() => {
    if (wallet.publicKey) {
      connection.getBalance(wallet.publicKey).then((bal) => {
        setBalance(bal / LAMPORTS_PER_SOL);
      });
    }
  }, [wallet.publicKey, connection]);

  // Get Candy Machine info
  useEffect(() => {
    const fetchCM = async () => {
      try {
        const umi = createUmi(connection.rpcEndpoint).use(mplCandyMachine());
        const candyMachine = await fetchCandyMachine(umi, publicKey(CANDY_MACHINE_ID));
        console.log('Candy Machine (UMI):', candyMachine);
        setCandyMachineData(candyMachine);
      } catch (error) {
        console.error('Error fetching candy machine:', error);
      }
    };

    fetchCM();
  }, [connection]);

  const mintNFT = async (group?: string) => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      setMintStatus({ type: 'error', message: 'Please connect your wallet first!' });
      return;
    }

    setIsMinting(true);
    setMintStatus({ type: 'info', message: `Minting ${group ? 'Pre-Sale' : 'Regular'} NFT...` });

    try {
      const umi = createUmi(connection.rpcEndpoint)
        .use(mplCandyMachine())
        .use(walletAdapterIdentity(wallet));

      console.log('Candy Machine Data:', candyMachineData);
      
      // Fetch fresh candy machine data with UMI
      const candyMachineAccount = await fetchCandyMachine(umi, publicKey(CANDY_MACHINE_ID));
      console.log('Fresh CM Account:', candyMachineAccount);
      
      // Get candy guard address
      const candyGuardAddress = candyMachineAccount.mintAuthority;
      console.log('Candy Guard Address:', candyGuardAddress);
      
      const mintArgs: any = {
        candyMachine: publicKey(CANDY_MACHINE_ID),
        candyGuard: publicKey(candyGuardAddress),
        nftOwner: umi.identity.publicKey,
        collectionMint: publicKey(candyMachineAccount.collectionMint),
        collectionUpdateAuthority: publicKey(candyMachineAccount.authority),
        mintArgs: {}, // Empty guard args for now
      };

      if (group) {
        mintArgs.group = group;
      }
      
      console.log('Mint args:', mintArgs);
      
      let builder = transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .add(mintV2(umi, mintArgs));

      console.log('Sending transaction...');
      const result = await builder.sendAndConfirm(umi);
      
      console.log('Mint result:', result);
      
      setMintStatus({
        type: 'success',
        message: `✅ Success! Transaction: ${result.signature}`,
      });

      // Refresh balance
      if (wallet.publicKey) {
        const bal = await connection.getBalance(wallet.publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      }

      // Refresh CM data
      const updatedCM = await fetchCandyMachine(umi, publicKey(CANDY_MACHINE_ID));
      setCandyMachineData(updatedCM);

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
      }
      
      setMintStatus({ type: 'error', message: `❌ Mint failed: ${errorMsg}` });
    } finally {
      setIsMinting(false);
    }
  };

  const itemsRedeemed = Number(candyMachineData?.itemsRedeemed || 0);
  const itemsAvailable = Number(candyMachineData?.data?.itemsAvailable || 100);
  const remaining = itemsAvailable - itemsRedeemed;
  const presaleRedeemed = Math.min(itemsRedeemed, 10);
  const presaleRemaining = Math.max(0, 10 - presaleRedeemed);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.badge}>🚨 MAINNET TEST - UMI SDK</span>
        </div>

        <h1 style={styles.title}>🎮 Pawnz NFT</h1>
        <p style={styles.subtitle}>Test Mint - Pre-Sale & Regular (UMI)</p>

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
            </div>
          )}
        </div>

        {wallet.connected && candyMachineData && (
          <>
            <div style={styles.mintCard}>
              <div style={styles.mintHeader}>
                <div style={styles.mintTitle}>🎁 Pre-Sale (Mainnet Test)</div>
                <div style={styles.mintPrice}>0.001 SOL</div>
              </div>
              <div style={styles.mintDetails}>
                Early access group. Limited to first 10 mints. Price enforced by Candy Guard at 0.001 SOL.
              </div>
              <div style={styles.mintStats}>
                <div>
                  <strong>Available:</strong> {presaleRemaining} / 10
                </div>
              </div>
              <button
                onClick={() => mintNFT('presale')}
                disabled={isMinting || presaleRemaining === 0}
                style={{
                  ...styles.button,
                  ...styles.buttonPresale,
                  ...(isMinting || presaleRemaining === 0 ? styles.buttonDisabled : {}),
                }}
              >
                {presaleRemaining === 0 ? 'Pre-Sale Sold Out' : isMinting ? 'Minting...' : 'Mint Pre-Sale (0.001 SOL)'}
              </button>
            </div>

            <div style={styles.mintCard}>
              <div style={styles.mintHeader}>
                <div style={styles.mintTitle}>⚡ Regular Mint (Mainnet Test)</div>
                <div style={styles.mintPrice}>0.001 SOL</div>
              </div>
              <div style={styles.mintDetails}>
                Standard minting at regular price. Price enforced by Candy Guard at 0.001 SOL.
              </div>
              <div style={styles.mintStats}>
                <div>
                  <strong>Available:</strong> {remaining} / {itemsAvailable}
                </div>
              </div>
              <button
                onClick={() => mintNFT()}
                disabled={isMinting}
                style={{
                  ...styles.button,
                  ...styles.buttonRegular,
                  ...(isMinting ? styles.buttonDisabled : {}),
                }}
              >
                {isMinting ? 'Minting...' : 'Mint Regular (0.001 SOL)'}
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
    background: '#10b981',
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
