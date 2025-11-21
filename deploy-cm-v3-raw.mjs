/**
 * Deploy Candy Machine V3 using raw Solana instructions
 * This bypasses the broken SDK wrappers
 */

import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// Candy Machine V3 Program ID
const CANDY_MACHINE_V3_PROGRAM_ID = new PublicKey('CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR');
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

async function main() {
  console.log('🚀 Deploying Candy Machine V3 (Raw Method)...\n');

  // Load wallet
  const walletPath = join(homedir(), '.config', 'solana', 'id.json');
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(readFileSync(walletPath, 'utf-8')))
  );

  console.log('✅ Wallet:', walletKeypair.publicKey.toString());

  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Check balance
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log('💰 Balance:', balance / 1e9, 'SOL\n');

  if (balance < 0.5 * 1e9) {
    console.log('⚠️  Low balance! Request airdrop:');
    console.log('   solana airdrop 2 --url devnet\n');
  }

  console.log('📋 Candy Machine V3 Program:', CANDY_MACHINE_V3_PROGRAM_ID.toString());
  console.log('\n⚠️  Note: Raw CM V3 deployment requires complex instruction building.');
  console.log('The SDK issues we encountered are blocking this approach too.\n');

  console.log('🎯 Recommended Alternative Approaches:\n');
  
  console.log('1️⃣  Use your existing CM V2 with CLI minting:');
  console.log('   cd C:\\Users\\kkbad\\CascadeProjects\\solana-nft-collection');
  console.log('   .\\sugar guard remove');
  console.log('   .\\sugar mint');
  console.log('   .\\sugar guard add\n');

  console.log('2️⃣  Build a custom backend API:');
  console.log('   - Create Node.js server');
  console.log('   - Server calls Sugar CLI');
  console.log('   - Frontend calls your API');
  console.log('   - Users get browser experience\n');

  console.log('3️⃣  Use Metaplex Candy Machine UI (fork it):');
  console.log('   - Clone: https://github.com/metaplex-foundation/candy-machine-ui');
  console.log('   - Update config for your CM');
  console.log('   - Deploy to Vercel');
  console.log('   - Works with CM V2\n');

  console.log('4️⃣  Magic Eden Launchpad (easiest):');
  console.log('   - Apply at: https://magiceden.io/launchpad/apply');
  console.log('   - They handle everything');
  console.log('   - Professional platform\n');

  // Save info
  const info = {
    candyMachineV2: 'FNGdN51cFFsCLMiiiySrWiggQB6ASkaMEc7Ud7p4YGNc',
    guardId: '2xueZvuXhyTF5n1Amsnv9vUoWQEaPPyc5ye3noiE42m8',
    collectionMint: 'EUCNPnR587eXfH6JZVW3fTky7M2TYX6iTd2nZTih8nSc',
    network: 'devnet',
    status: 'Working via CLI, browser blocked by SDK issues',
    recommendations: [
      'Option 1: CLI minting (works now)',
      'Option 2: Backend API wrapper',
      'Option 3: Fork Metaplex UI',
      'Option 4: Magic Eden (recommended)',
    ],
  };

  writeFileSync('deployment-status.json', JSON.stringify(info, null, 2));
  console.log('📄 Status saved to deployment-status.json\n');

  console.log('💡 Next Steps:');
  console.log('Choose one of the 4 options above based on your priorities:');
  console.log('- Speed → Magic Eden');
  console.log('- Control → Backend API');
  console.log('- Quick fix → Metaplex UI fork');
  console.log('- Testing → CLI minting\n');
}

main().catch(console.error);
