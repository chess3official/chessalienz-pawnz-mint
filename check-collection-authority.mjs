import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const COLLECTION_MINT = '4K74nmy4E7KprxmDTp9hkWkC4RkBHtkdzvVrDhMHY47C';

async function main() {
  const connection = new Connection(MAINNET_RPC, 'confirmed');
  const metaplex = Metaplex.make(connection);

  console.log('Checking collection authority...\n');

  const collection = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(COLLECTION_MINT),
  });

  console.log('Collection Mint:', COLLECTION_MINT);
  console.log('Collection Name:', collection.name);
  console.log('Update Authority:', collection.updateAuthorityAddress.toString());
  console.log('Is Collection:', collection.collectionDetails ? 'Yes' : 'No');
  
  if (collection.collectionDetails) {
    console.log('Collection Size:', collection.collectionDetails.size.toString());
  }
}

main().catch(console.error);
