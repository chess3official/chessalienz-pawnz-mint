'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { mintNFT, getNextNFTMetadata } from '@/lib/mintNFT';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

interface EligibilityResponse {
  eligible: boolean;
  hasPass: boolean;
  hasRedeemed: boolean;
  passBalance: number;
  redeemedCount: number;
  remainingRedeems: number;
  price: number;
  mintPhase: string;
  reason?: string;
}

export default function MintPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [balance, setBalance] = useState<number | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<{ type: string; message: string } | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [mintCount, setMintCount] = useState(0);
  const [totalSupply] = useState(5000); // Total NFTs in collection (4000 public + 1000 presale)
  const [mintedCount, setMintedCount] = useState(0); // How many have been minted so far
  const [presaleRedeemed, setPresaleRedeemed] = useState(0); // Presale pass redemptions
  const [publicMints, setPublicMints] = useState(0); // Public mints
  
  // Presale pass tracking
  const [presalePassSupply] = useState(1000); // Total presale passes available
  const [presalePassesSold, setPresalePassesSold] = useState(0); // How many passes have been sold

  // Get balance
  useEffect(() => {
    if (wallet.publicKey) {
      connection.getBalance(wallet.publicKey).then((bal) => {
        setBalance(bal / LAMPORTS_PER_SOL);
      });
    }
  }, [wallet.publicKey, connection]);

  // Fetch presale pass stats
  const fetchPresaleStats = async () => {
    try {
      const response = await fetch('/api/presale-stats');
      if (response.ok) {
        const data = await response.json();
        setPresalePassesSold(data.totalDistributed);
        console.log('Presale stats:', data);
      }
    } catch (error) {
      console.error('Error fetching presale stats:', error);
    }
  };

  // Load presale stats on mount
  useEffect(() => {
    fetchPresaleStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPresaleStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check eligibility
  const checkEligibility = async () => {
    if (!wallet.publicKey) return;

    setIsCheckingEligibility(true);
    try {
      const response = await fetch('/api/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: wallet.publicKey.toString() }),
      });

      const data = await response.json();
      setEligibility(data);
    } catch (error) {
      console.error('Error checking eligibility:', error);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  // Check eligibility when wallet connects
  useEffect(() => {
    if (wallet.publicKey) {
      checkEligibility();
    } else {
      setEligibility(null);
    }
  }, [wallet.publicKey]);

  // Mint NFT
  const handleMint = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setMintStatus({ type: 'error', message: 'Please connect your wallet' });
      return;
    }

    if (!eligibility?.eligible) {
      setMintStatus({ type: 'error', message: eligibility?.reason || 'Not eligible to mint' });
      return;
    }

    setIsMinting(true);
    setMintStatus(null);

    try {
      // Create Metaplex instance
      const metaplex = Metaplex.make(connection).use(
        walletAdapterIdentity({
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
          signAllTransactions: wallet.signAllTransactions,
        })
      );

      console.log('Minting NFT...');
      console.log('Phase:', eligibility.mintPhase);
      console.log('Price:', eligibility.price, 'SOL');

      // Get metadata for next NFT
      const metadata = getNextNFTMetadata(mintCount);
      console.log('Metadata:', metadata);

      // Mint the NFT
      const { nft, signature } = await mintNFT(metaplex, metadata);

      console.log('NFT minted:', nft.address.toString());
      console.log('Signature:', signature);

      // Track if this was a presale or public mint
      const wasPresaleMint = eligibility.hasPass && !eligibility.hasRedeemed && eligibility.price === 0;

      // If presale pass holder, mark as redeemed
      if (wasPresaleMint) {
        try {
          const response = await fetch('/api/mark-redeemed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wallet: wallet.publicKey.toString(),
              passTokenAccount: '', // We can get this if needed
              passBalance: eligibility.passBalance,
              nftMint: nft.address.toString(),
              txSignature: signature,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Redemption marked:', data);
            setPresaleRedeemed(presaleRedeemed + 1);
          } else {
            const error = await response.json();
            console.error('Failed to mark redeemed:', error);
          }
        } catch (error) {
          console.error('Error marking redeemed:', error);
          // Don't fail the mint if this fails
        }
      } else {
        setPublicMints(publicMints + 1);
      }

      setMintStatus({
        type: 'success',
        message: `✅ Success! NFT Minted: ${nft.address.toString()}`,
      });

      setMintCount(mintCount + 1);
      setMintedCount(mintedCount + 1); // Increment minted count

      // Refresh balance and eligibility - this should update the UI
      const bal = await connection.getBalance(wallet.publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
      
      // Force a fresh eligibility check
      console.log('Refreshing eligibility...');
      await checkEligibility();

    } catch (error: any) {
      console.error('Mint error:', error);
      setMintStatus({ type: 'error', message: `❌ Failed: ${error.message}` });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: '#0a0a0a',
        position: 'relative'
      }}
    >
      {/* Animated gradient overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}
      />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 
            className="text-5xl font-bold mb-4" 
            style={{ 
              color: '#ffffff',
              textShadow: '0 0 40px rgba(139, 92, 246, 0.4)'
            }}
          >
            Chessalienz: Pawnz
          </h1>
          <p className="text-xl" style={{ color: '#a0a0a0' }}>
            Genesis Collection
          </p>
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Wallet Connection & Info - Inline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Wallet Connection */}
              <div 
                className="rounded-xl p-6 border transition-all duration-300"
                style={{
                  background: 'rgba(139, 92, 246, 0.05)',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <h2 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>Wallet Connection</h2>
                <div className="flex flex-col items-center">
                  <WalletMultiButtonDynamic />
                  {wallet.publicKey && (
                    <div className="mt-4 text-center">
                      <p className="text-green-400 font-bold">✅ Connected</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {wallet.publicKey.toString().slice(0, 8)}...{wallet.publicKey.toString().slice(-8)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Wallet Info */}
              {wallet.publicKey && (
                <div 
                  className="rounded-xl p-6 border transition-all duration-300"
                  style={{
                    background: 'rgba(139, 92, 246, 0.05)',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <h2 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>Wallet Info</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span style={{ color: '#a0a0a0' }}>Balance:</span>
                      <span className="font-bold" style={{ color: '#ffffff' }}>{balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: '#a0a0a0' }}>Presale Passes:</span>
                      <span className={eligibility?.hasPass ? 'font-bold' : ''} style={{ color: eligibility?.hasPass ? '#10B981' : '#6b7280' }}>
                        {eligibility?.passBalance || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mint Status */}
            {wallet.publicKey && eligibility && (
              <div 
                className="rounded-xl p-6 border transition-all duration-300"
                style={{
                  background: 'rgba(139, 92, 246, 0.05)',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#ffffff' }}>Mint Status</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#a0a0a0' }}>Phase:</span>
                    <span className="font-bold text-yellow-400">{eligibility.mintPhase}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#a0a0a0' }}>Passes Redeemed:</span>
                    <span className="font-bold text-purple-400">
                      {eligibility.redeemedCount || 0} / {eligibility.passBalance || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#a0a0a0' }}>Remaining Free Mints:</span>
                    <span className={eligibility.remainingRedeems > 0 ? 'text-green-400 font-bold' : 'text-gray-400'}>
                      {eligibility.remainingRedeems || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#a0a0a0' }}>Mint Price:</span>
                    <span className="font-bold text-2xl text-green-400">
                      {eligibility.price === 0 ? 'FREE' : `${eligibility.price} SOL`}
                    </span>
                  </div>
                  <div className="border-t border-gray-600 pt-3 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: '#a0a0a0' }}>Total Presale Redeemed:</span>
                      <span className="font-bold text-purple-400">{presaleRedeemed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: '#a0a0a0' }}>Total Public Mints:</span>
                      <span className="font-bold text-blue-400">{publicMints}</span>
                    </div>
                  </div>
                  {!eligibility.eligible && eligibility.reason && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                      <p className="text-red-300 text-sm">{eligibility.reason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Presale Pass Progress */}
            <div 
              className="rounded-xl p-6 border transition-all duration-300"
              style={{
                background: 'rgba(255, 193, 7, 0.05)',
                borderColor: 'rgba(255, 193, 7, 0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-yellow-400">🎫 Presale Passes</h2>
                <span className="text-2xl font-bold text-yellow-400">
                  {presalePassesSold} / {presalePassSupply}
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full transition-all duration-500 ease-out flex items-center justify-center text-sm font-bold"
                  style={{ width: `${(presalePassesSold / presalePassSupply) * 100}%` }}
                >
                  {presalePassesSold > 0 && `${Math.round((presalePassesSold / presalePassSupply) * 100)}%`}
                </div>
              </div>
              
              <div className="mt-3 text-center text-sm text-yellow-200">
                {presalePassesSold === 0 && "Presale passes not yet distributed"}
                {presalePassesSold > 0 && presalePassesSold < presalePassSupply && `${presalePassSupply - presalePassesSold} passes remaining`}
                {presalePassesSold === presalePassSupply && "🎉 All Passes Sold Out!"}
              </div>
              
              {/* Buy Presale Pass Button */}
              <div className="mt-4">
                <button
                  disabled={presalePassesSold >= presalePassSupply}
                  className="w-full font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                  style={{
                    background: presalePassesSold >= presalePassSupply 
                      ? 'rgba(255, 193, 7, 0.2)' 
                      : 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
                    color: presalePassesSold >= presalePassSupply ? '#a0a0a0' : '#000000',
                    border: presalePassesSold >= presalePassSupply ? '2px solid rgba(255, 193, 7, 0.3)' : 'none',
                    boxShadow: presalePassesSold >= presalePassSupply ? 'none' : '0 10px 40px rgba(255, 193, 7, 0.3)',
                    opacity: presalePassesSold >= presalePassSupply ? 0.5 : 1
                  }}
                >
                  {presalePassesSold >= presalePassSupply ? '🎫 Presale Pass (Sold Out)' : '🎫 Buy Presale Pass'}
                </button>
              </div>
            </div>

            {/* Public Mint Progress */}
            <div 
              className="rounded-xl p-6 border transition-all duration-300"
              style={{
                background: 'rgba(16, 185, 129, 0.05)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold" style={{ color: '#10B981' }}>🚀 Public Mint</h2>
                <span className="text-2xl font-bold" style={{ color: '#10B981' }}>
                  {mintedCount} / {totalSupply}
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-500 ease-out flex items-center justify-center text-sm font-bold"
                  style={{ width: `${(mintedCount / totalSupply) * 100}%` }}
                >
                  {mintedCount > 0 && `${Math.round((mintedCount / totalSupply) * 100)}%`}
                </div>
              </div>
              
              <div className="mt-3 text-center text-sm" style={{ color: '#a0a0a0' }}>
                {mintedCount === 0 && "No NFTs minted yet"}
                {mintedCount > 0 && mintedCount < totalSupply && `${totalSupply - mintedCount} remaining`}
                {mintedCount === totalSupply && "🎉 Collection Sold Out!"}
              </div>
            </div>

            {/* Mint Buttons */}
            {wallet.publicKey && (
              <div className="grid grid-cols-2 gap-4">
                {/* Free Mint Button (Pass Holders) */}
                <button
                  onClick={handleMint}
                  disabled={eligibility?.mintPhase === 'CLOSED' || isMinting || !eligibility?.eligible || eligibility?.price !== 0}
                  className="font-bold py-6 px-6 rounded-lg text-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                  style={{
                    background: (eligibility?.mintPhase === 'CLOSED' || isMinting || !eligibility?.eligible || eligibility?.price !== 0) 
                      ? 'rgba(107, 114, 128, 0.3)' 
                      : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: (eligibility?.mintPhase === 'CLOSED' || isMinting || !eligibility?.eligible || eligibility?.price !== 0) 
                      ? '#6b7280' 
                      : '#ffffff',
                    boxShadow: (eligibility?.mintPhase === 'CLOSED' || isMinting || !eligibility?.eligible || eligibility?.price !== 0) 
                      ? 'none' 
                      : '0 10px 40px rgba(16, 185, 129, 0.3)',
                    border: 'none'
                  }}
                >
                  {isMinting && eligibility?.price === 0 ? 'Minting...' : '🎁 Free Mint'}
                </button>

                {/* Public Mint Button */}
                <button
                  onClick={handleMint}
                  disabled={eligibility?.mintPhase === 'CLOSED' || isMinting || !eligibility?.eligible || eligibility?.price === 0}
                  className="font-bold py-6 px-6 rounded-lg text-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                  style={{
                    background: (eligibility?.mintPhase === 'CLOSED' || isMinting || !eligibility?.eligible || eligibility?.price === 0) 
                      ? 'rgba(107, 114, 128, 0.3)' 
                      : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: (eligibility?.mintPhase === 'CLOSED' || isMinting || !eligibility?.eligible || eligibility?.price === 0) 
                      ? '#6b7280' 
                      : '#ffffff',
                    boxShadow: (eligibility?.mintPhase === 'CLOSED' || isMinting || !eligibility?.eligible || eligibility?.price === 0) 
                      ? 'none' 
                      : '0 10px 40px rgba(139, 92, 246, 0.3)',
                    border: 'none'
                  }}
                >
                  {isMinting && eligibility?.price !== 0 ? 'Minting...' : `💎 Mint ${eligibility?.price || 0.5} SOL`}
                </button>
              </div>
            )}

            {/* Mint Status Message */}
            {mintStatus && (
              <div className={`p-4 rounded-lg ${
                mintStatus.type === 'success' ? 'bg-green-500/20 border border-green-500' :
                mintStatus.type === 'error' ? 'bg-red-500/20 border border-red-500' :
                'bg-blue-500/20 border border-blue-500'
              }`}>
                <p className={
                  mintStatus.type === 'success' ? 'text-green-300' :
                  mintStatus.type === 'error' ? 'text-red-300' :
                  'text-blue-300'
                }>{mintStatus.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Powered by Solana */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ color: '#10B981', fontSize: '20px' }}>⚡</span>
            <span style={{ color: '#a0a0a0' }}>Powered by</span>
            <span style={{ color: '#ffffff', fontWeight: 'bold' }}>Solana</span>
          </div>
        </div>
      </div>
    </div>
  );
}
