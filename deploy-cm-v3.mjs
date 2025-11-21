/**
 * Deploy Candy Machine V3 with UMI SDK
 * Run with: node deploy-cm-v3.mjs
 */

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { create, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { generateSigner, percentAmount, some, sol, transactionBuilder } from '@metaplex-foundation/umi';
import { createSignerFromKeypair, signerIdentity } from '@metaplex-foundation/umi';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

async function deployCandyMachineV3() {
  console.log('🚀 Starting Candy Machine V3 Deployment...\n');

  // Initialize UMI
  const umi = createUmi('https://api.devnet.solana.com')
    .use(mplCandyMachine())
    .use(mplTokenMetadata());

  // Load wallet
  const walletPath = join(homedir(), '.config', 'solana', 'id.json');
  const walletKeypair = JSON.parse(readFileSync(walletPath, 'utf-8'));
  
  // Convert to UMI keypair format
  const secretKey = new Uint8Array(walletKeypair);
  const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
  const signer = createSignerFromKeypair(umi, keypair);
  
  umi.use(signerIdentity(signer));

  console.log('✅ Wallet loaded:', signer.publicKey);
  console.log('📍 Network: Devnet\n');

  // Generate Candy Machine keypair
  const candyMachine = generateSigner(umi);
  console.log('🎰 Candy Machine Address:', candyMachine.publicKey);

  // Create collection NFT first (required for CM V3)
  console.log('\n📦 Creating Collection NFT...');
  const collectionMint = generateSigner(umi);
  
  await createNft(umi, {
    mint: collectionMint,
    name: 'Chessalienz: Pawnz',
    symbol: 'PAWNZ',
    uri: 'https://gateway.irys.xyz/39AH1D8GBz4WnsXs7d83rZgjHYdxAPMEChxm2DgVBFza',
    sellerFeeBasisPoints: percentAmount(5),
    isCollection: true,
  }).sendAndConfirm(umi);

  console.log('✅ Collection NFT Created:', collectionMint.publicKey);

  // Create Candy Machine V3
  console.log('\n🏗️  Creating Candy Machine V3...');
  
  await transactionBuilder()
    .add(create(umi, {
      candyMachine,
      collection: collectionMint.publicKey,
      collectionUpdateAuthority: umi.identity.publicKey,
      itemsAvailable: 100,
      sellerFeeBasisPoints: percentAmount(5),
      symbol: 'PAWNZ',
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
        prefixName: 'Chessalienz: Pawnz #',
        nameLength: 2,
        prefixUri: 'https://gateway.irys.xyz/',
        uriLength: 44,
        isSequential: false,
      }),
    }))
    .sendAndConfirm(umi);

  console.log('✅ Candy Machine V3 Created!');

  // Save deployment info
  const deploymentInfo = {
    candyMachine: candyMachine.publicKey,
    collectionMint: collectionMint.publicKey,
    authority: signer.publicKey,
    network: 'devnet',
    version: 3,
    timestamp: new Date().toISOString(),
  };

  writeFileSync(
    'deployment-v3.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('\n📄 Deployment info saved to deployment-v3.json');
  console.log('\n🎉 Candy Machine V3 deployed successfully!');
  console.log('\n📋 Summary:');
  console.log('  Candy Machine:', candyMachine.publicKey);
  console.log('  Collection:', collectionMint.publicKey);
  console.log('  Network: Devnet');
  
  return deploymentInfo;
}

// Run deployment
deployCandyMachineV3()
  .then((info) => {
    console.log('\n✅ Deployment Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Update CANDY_MACHINE_ID in components/MintPageUmi.tsx');
    console.log('2. Add guards using a separate script or Sugar CLI');
    console.log('3. Upload NFT metadata');
    console.log('4. Test minting in the browser!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Deployment Failed:', error.message);
    console.error(error);
    process.exit(1);
  });
