/**
 * Configure Candy Guard on mainnet-beta for the test Candy Machine V3.
 *
 * - Reads Candy Machine address from deployment-v3-mainnet.json
 * - Creates a Candy Guard with two groups:
 *     - "presale" group @ 0.001 SOL
 *     - default/public group @ 0.001 SOL
 * - Sets the Candy Guard as the mint authority for the Candy Machine.
 *
 * Run with: node configure-guard-mainnet.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { createUmi, sol, some } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, signerIdentity, publicKey } from '@metaplex-foundation/umi';
import {
  mplCandyMachine,
  createCandyGuard,
  updateCandyMachine,
} from '@metaplex-foundation/mpl-candy-machine';

async function configureGuardMainnet() {
  console.log('🔐 Configuring Candy Guard on MAINNET for test CM V3...');

  // Load deployment info (Candy Machine + collection) from mainnet deploy script
  const deploymentPath = join(process.cwd(), 'deployment-v3-mainnet.json');
  const deployment = JSON.parse(readFileSync(deploymentPath, 'utf-8'));

  const candyMachinePk = publicKey(deployment.candyMachine);
  console.log('🎰 Candy Machine:', deployment.candyMachine);

  // Initialize UMI on mainnet-beta
  const umi = createUmi('https://api.mainnet-beta.solana.com').use(mplCandyMachine());

  // Load wallet
  const walletPath = join(homedir(), '.config', 'solana', 'id.json');
  const walletKeypair = JSON.parse(readFileSync(walletPath, 'utf-8'));
  const secretKey = new Uint8Array(walletKeypair);
  const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
  const signer = createSignerFromKeypair(umi, keypair);
  umi.use(signerIdentity(signer));

  console.log('✅ Wallet loaded:', signer.publicKey);
  console.log('📍 Network: mainnet-beta\n');

  // 1) Create Candy Guard with presale + public groups, both at 0.001 SOL
  console.log('🏗️  Creating Candy Guard (0.001 SOL presale + public)...');

  const guardBase = signer.publicKey;

  const guard = await createCandyGuard(umi, {
    base: guardBase,
    guards: {}, // no global guards for now – everything is group-based
    groups: [
      {
        label: 'presale',
        guards: {
          solPayment: some({
            lamports: sol(0.001), // 0.001 SOL
            destination: signer.publicKey,
          }),
        },
      },
      {
        label: 'public',
        guards: {
          solPayment: some({
            lamports: sol(0.001), // 0.001 SOL
            destination: signer.publicKey,
          }),
        },
      },
    ],
  }).sendAndConfirm(umi);

  const candyGuardPk = guard.publicKey ?? guard;
  console.log('✅ Candy Guard created:', candyGuardPk.toString());

  // 2) Set the Candy Guard as the mint authority for the Candy Machine
  console.log('\n🔗 Linking Candy Guard as mint authority for Candy Machine...');

  await updateCandyMachine(umi, {
    candyMachine: candyMachinePk,
    mintAuthority: candyGuardPk,
  }).sendAndConfirm(umi);

  console.log('✅ Candy Machine updated to use Candy Guard as mint authority.');

  // Save guard info
  const info = {
    candyMachine: deployment.candyMachine,
    candyGuard: candyGuardPk.toString(),
    network: 'mainnet-beta',
    priceSol: 0.001,
    groups: ['presale', 'public'],
    updatedAt: new Date().toISOString(),
  };

  writeFileSync('guard-mainnet.json', JSON.stringify(info, null, 2));
  console.log('\n📄 Guard info saved to guard-mainnet.json');

  console.log('\n📋 Next Steps:');
  console.log('- 1. Open guard-mainnet.json and copy the candyGuard address if needed.');
  console.log('- 2. In your UI, mint with group = "presale" for presale, or no group for public.');
  console.log('- 3. Use a small amount of SOL in a test wallet to verify both flows.');
}

configureGuardMainnet()
  .then(() => {
    console.log('\n✅ Candy Guard configuration complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to configure Candy Guard:', error.message);
    console.error(error);
    process.exit(1);
  });
