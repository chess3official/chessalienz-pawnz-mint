import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex, walletAdapterIdentity, toBigNumber } from '@metaplex-foundation/js';

const COLLECTION_MINT = new PublicKey('4K74nmy4E7KprxmDTp9hkWkC4RkBHtkdzvVrDhMHY47C');

/**
 * Mint an NFT directly using Metaplex SDK (no Candy Machine)
 */
export async function mintNFT(
  metaplex: Metaplex,
  metadata: {
    name: string;
    symbol: string;
    uri: string;
  }
): Promise<{ nft: any; signature: string }> {
  // Step 1: Create the NFT
  const { nft } = await metaplex.nfts().create({
    uri: metadata.uri,
    name: metadata.name,
    symbol: metadata.symbol,
    sellerFeeBasisPoints: 500, // 5%
    collection: COLLECTION_MINT,
    collectionAuthority: metaplex.identity(),
  });

  console.log('NFT created:', nft.address.toString());

  // Step 2: Verify the NFT as part of the collection
  console.log('Verifying NFT in collection...');
  console.log('Collection mint:', COLLECTION_MINT.toString());
  console.log('NFT mint:', nft.address.toString());
  
  try {
    const verifyResult = await metaplex.nfts().verifyCollection({
      mintAddress: nft.address,
      collectionMintAddress: COLLECTION_MINT,
      collectionAuthority: metaplex.identity(),
    });
    console.log('✅ NFT verified in collection successfully!');
    console.log('Verify signature:', verifyResult.response.signature);
  } catch (error: any) {
    console.error('❌ Failed to verify collection:', error);
    console.error('Error details:', error.message);
    // Don't fail the mint if verification fails, but log it clearly
  }

  return {
    nft,
    signature: nft.address.toString(),
  };
}

/**
 * Get next available NFT metadata from your collection
 */
export function getNextNFTMetadata(mintNumber: number): {
  name: string;
  symbol: string;
  uri: string;
} {
  // Your metadata URIs from the cache
  const metadataURIs = [
    'https://gateway.irys.xyz/qD71up1CUBgqt9-2Fu632Gqru-HBnXj3OQi7BXqw5Jc',
    'https://gateway.irys.xyz/QeAcOqQWIkW0MxY2TTOtslW6VK7JjjfoN6xUOqkeQ7g',
    'https://gateway.irys.xyz/mS_zCk0wmjNQ7KB1hBUr9Z0b184Auqk1hsLzyj0_M-Y',
  ];

  const index = mintNumber % metadataURIs.length;

  return {
    name: `Chessalienz: Pawnz #${mintNumber}`,
    symbol: 'PAWNZ',
    uri: metadataURIs[index],
  };
}
