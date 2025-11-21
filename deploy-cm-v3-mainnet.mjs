/**
 * Deploy Candy Machine V3 with UMI SDK on mainnet-beta for test collection
 * Run with: node deploy-cm-v3-mainnet.mjs
 *
 * This is a "dress rehearsal" script. It deploys a tiny test collection
 * so you can test your mint UI and Candy Guard configuration on mainnet
 * without touching the real Pawnz collection.
 */

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { create, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { generateSigner, percentAmount, some, transactionBuilder } from '@metaplex-foundation/umi';
import { createSignerFromKeypair, signerIdentity } from '@metaplex-foundation/umi';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

async function deployCandyMachineV3Mainnet() {
  console.log('🚀 Starting Candy Machine V3 Deployment on MAINNET (TEST)...\n');

  // Initialize UMI on mainnet-beta
  const umi = createUmi('https://api.mainnet-beta.solana.com')
    .use(mplCandyMachine())
    .use(mplTokenMetadata());

  // Load wallet
  const walletPath = join(homedir(), '.config', 'solana', 'id.json');
  const walletKeypair = JSON.parse(readFileSync(walletPath, 'utf-8'));

  const secretKey = new Uint8Array(walletKeypair);
  const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
  const signer = createSignerFromKeypair(umi, keypair);

  umi.use(signerIdentity(signer));

  console.log('✅ Wallet loaded:', signer.publicKey);
  console.log('📍 Network: mainnet-beta (TEST COLLECTION)\n');

  // Generate Candy Machine keypair
  const candyMachine = generateSigner(umi);
  console.log('🎰 Candy Machine Address:', candyMachine.publicKey);

  // Create a small test collection NFT
  console.log('\n📦 Creating Test Collection NFT...');
  const collectionMint = generateSigner(umi);

  await createNft(umi, {
    mint: collectionMint,
    name: 'Pawnz Test Collection',
    symbol: 'PAWNZTEST',
    // Use a throwaway JSON with simple metadata for the test collection
    uri: 'https://example.com/pawnz-test-collection.json',
    sellerFeeBasisPoints: percentAmount(5),
    isCollection: true,
  }).sendAndConfirm(umi);

  console.log('✅ Test Collection NFT Created:', collectionMint.publicKey);

  // Create Candy Machine V3 with a small supply for testing
  console.log('\n🏗️  Creating Candy Machine V3 (mainnet test)...');

  // In this Umi version, create(...) returns an instruction builder.
  // We need to wrap it in a transactionBuilder before sending.
  await transactionBuilder()
    .add(
      create(umi, {
        candyMachine,
        collection: collectionMint.publicKey,
        collectionUpdateAuthority: umi.identity.publicKey,
        itemsAvailable: 20, // small test supply
        sellerFeeBasisPoints: percentAmount(5),
        symbol: 'PAWNZTEST',
        maxEditionSupply: 0,
        isMutable: true,
        creators: [
          {
            address: umi.identity.publicKey,
            verified: true,
            percentageShare: 100,
          },
        ],
        configLineSettings: some({
          prefixName: 'Pawnz Test #',
          nameLength: 2,
          // NOTE: for a real test you should upload your test metadata
          // and point prefixUri + uriLength to that storage (Arweave/Irys/IPFS).
          prefixUri: 'https://example.com/',
          uriLength: 44,
          isSequential: false,
        }),
      })
    )
    .sendAndConfirm(umi);

  console.log('✅ Candy Machine V3 Created on mainnet-beta (TEST)!');

  const deploymentInfo = {
    candyMachine: candyMachine.publicKey,
    collectionMint: collectionMint.publicKey,
    authority: signer.publicKey,
    network: 'mainnet-beta',
    version: 3,
    timestamp: new Date().toISOString(),
  };

  writeFileSync(
    'deployment-v3-mainnet.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('\n📄 Deployment info saved to deployment-v3-mainnet.json');
  console.log('\n🎉 Test Candy Machine V3 deployed successfully on mainnet-beta!');
  console.log('\n📋 Next Steps:');
  console.log('1. Configure a Candy Guard on mainnet with 0.001 SOL pricing for both presale and public.');
  console.log('2. Update CANDY_MACHINE_ID in MintPageUmi.tsx to the value above.');
  console.log('3. Point your wallet adapter to mainnet-beta and mint through the UI.');

  return deploymentInfo;
}

// Run deployment
deployCandyMachineV3Mainnet()
  .then(() => {
    console.log('\n✅ Mainnet test deployment complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Deployment Failed:', error.message);
    console.error(error);
    process.exit(1);
  });
