import { Keypair } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import { 
  create, 
  mplCandyMachine,
  addConfigLines,
  createCandyGuard,
  wrap
} from '@metaplex-foundation/mpl-candy-machine';
import { publicKey as umiPublicKey, generateSigner, percentAmount } from '@metaplex-foundation/umi';
import fs from 'fs';
import path from 'path';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const COLLECTION_MINT = '4K74nmy4E7KprxmDTp9hkWkC4RkBHtkdzvVrDhMHY47C';

async function main() {
  console.log('🚀 Deploying fresh CM v3 with Umi SDK...\n');

  // Load wallet
  const walletPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'id.json');
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  console.log('Wallet:', walletKeypair.publicKey.toString());

  const umi = createUmi(MAINNET_RPC);
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(walletKeypair.secretKey);
  umi.use(keypairIdentity(umiKeypair)).use(mplCandyMachine());

  // Step 1: Create Candy Machine
  console.log('\n[1/5] Creating Candy Machine...');
  const candyMachine = generateSigner(umi);
  
  await (await create(umi, {
    candyMachine,
    collectionMint: umiPublicKey(COLLECTION_MINT),
    collectionUpdateAuthority: umi.identity,
    tokenStandard: 0, // NonFungible
    sellerFeeBasisPoints: percentAmount(5), // 5%
    itemsAvailable: 3,
    creators: [
      {
        address: umi.identity.publicKey,
        verified: true,
        percentageShare: 100,
      },
    ],
    configLineSettings: {
      prefixName: '',
      nameLength: 32, // Increased to support longer names
      prefixUri: '',
      uriLength: 200,
      isSequential: false,
    },
  })).sendAndConfirm(umi);

  console.log('✅ CM created:', candyMachine.publicKey);

  // Step 2: Add config lines
  console.log('\n[2/5] Adding config lines...');
  const cache = JSON.parse(fs.readFileSync('../pawnz-mainnet-test/cache-new.json', 'utf-8'));
  
  const configLines = [];
  for (let i = 0; i < 3; i++) {
    const item = cache.items[i.toString()];
    configLines.push({
      name: item.name,
      uri: item.metadata_link,
    });
  }

  await addConfigLines(umi, {
    candyMachine: candyMachine.publicKey,
    index: 0,
    configLines,
  }).sendAndConfirm(umi);

  console.log('✅ Config lines added');

  // Step 3: Create candy guard
  console.log('\n[3/5] Creating candy guard...');
  const candyGuard = generateSigner(umi);
  
  await createCandyGuard(umi, {
    base: candyGuard,
    guards: {}, // No guards = free mint
  }).sendAndConfirm(umi);

  console.log('✅ Guard created:', candyGuard.publicKey);

  // Step 4: Wrap CM with guard
  console.log('\n[4/5] Wrapping CM with guard...');
  await wrap(umi, {
    candyMachine: candyMachine.publicKey,
    candyGuard: candyGuard.publicKey,
  }).sendAndConfirm(umi);

  console.log('✅ CM wrapped with guard');

  // Step 5: Save to file
  console.log('\n[5/5] Saving deployment info...');
  const deploymentInfo = {
    candyMachine: candyMachine.publicKey,
    candyGuard: candyGuard.publicKey,
    collectionMint: COLLECTION_MINT,
    authority: umi.identity.publicKey,
  };

  fs.writeFileSync(
    'cm-deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('\n🎉 Deployment complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Candy Machine:', candyMachine.publicKey);
  console.log('Candy Guard:', candyGuard.publicKey);
  console.log('Collection:', COLLECTION_MINT);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅ Ready to mint!');
}

main().catch(console.error);
