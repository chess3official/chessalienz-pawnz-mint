import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import { Metaplex, keypairIdentity, toBigNumber } from '@metaplex-foundation/js';
import fs from 'fs';
import path from 'path';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const COLLECTION_MINT = '4K74nmy4E7KprxmDTp9hkWkC4RkBHtkdzvVrDhMHY47C';

async function main() {
  console.log('🚀 Deploying CM v2 with Metaplex JS SDK...\n');

  // Load wallet
  const walletPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'id.json');
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  console.log('Wallet:', walletKeypair.publicKey.toString());

  const connection = new Connection(MAINNET_RPC, 'confirmed');
  const metaplex = Metaplex.make(connection).use(keypairIdentity(walletKeypair));

  // Load cache to get metadata URIs
  const cache = JSON.parse(fs.readFileSync('../pawnz-mainnet-test/cache-new.json', 'utf-8'));
  
  const items = [];
  for (let i = 0; i < 3; i++) {
    const item = cache.items[i.toString()];
    items.push({
      name: item.name,
      uri: item.metadata_link,
    });
  }

  console.log('Creating CM v2 with', items.length, 'items...\n');

  // Create CM v2
  const { candyMachine } = await metaplex.candyMachines().create({
    itemsAvailable: toBigNumber(items.length),
    sellerFeeBasisPoints: 500, // 5%
    collection: {
      address: new PublicKey(COLLECTION_MINT),
      updateAuthority: walletKeypair,
    },
    creators: [
      {
        address: walletKeypair.publicKey,
        share: 100,
      },
    ],
    items: items,
    // No guards, no price - free mint!
  });

  console.log('\n✅ CM v2 deployed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Candy Machine:', candyMachine.address.toString());
  console.log('Authority:', candyMachine.authorityAddress.toString());
  console.log('Collection:', COLLECTION_MINT);
  console.log('Items:', candyMachine.itemsAvailable.toString());
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Save deployment info
  const deploymentInfo = {
    candyMachine: candyMachine.address.toString(),
    authority: candyMachine.authorityAddress.toString(),
    collectionMint: COLLECTION_MINT,
    version: 2,
  };

  fs.writeFileSync(
    'cm-v2-deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('\n✅ Ready to mint with CM v2 (no guards needed)!');
}

main().catch(console.error);
