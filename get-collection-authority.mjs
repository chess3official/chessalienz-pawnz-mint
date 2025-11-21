import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const COLLECTION_MINT = '4K74nmy4E7KprxmDTp9hkWkC4RkBHtkdzvVrDhMHY47C';

async function main() {
  const connection = new Connection(MAINNET_RPC, 'confirmed');
  const metaplex = Metaplex.make(connection);

  console.log('Fetching collection NFT metadata...\n');
  console.log('Collection Mint:', COLLECTION_MINT);

  try {
    const nft = await metaplex.nfts().findByMint({
      mintAddress: new PublicKey(COLLECTION_MINT),
    });

    console.log('\n✅ Collection NFT found');
    console.log('Name:', nft.name);
    console.log('Symbol:', nft.symbol);
    console.log('Update Authority:', nft.updateAuthorityAddress.toString());
    console.log('Mint Authority:', nft.mint.mintAuthorityAddress?.toString() || 'None');
    console.log('Is Mutable:', nft.isMutable);
    
    console.log('\n🔑 USE THIS AS COLLECTION_UPDATE_AUTHORITY:');
    console.log(nft.updateAuthorityAddress.toString());
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);
