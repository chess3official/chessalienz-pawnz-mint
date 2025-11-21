import {
  Connection,
  Keypair,
  PublicKey,
} from '@solana/web3.js';
import {
  Metaplex,
  keypairIdentity,
  sol,
  token,
} from '@metaplex-foundation/js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mainnet Helius RPC
const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';

// Your Candy Machine ID
const CANDY_MACHINE_ID = 'J2H4LfJ6xsejNB4FxHLvevMaTo11BUiF4kbuKVzeDVYA';

async function main() {
  console.log('🛡️  Configuring Candy Guard for CM v2 on Mainnet...\n');

  // Load presale pass token info
  const presalePassPath = path.join(__dirname, 'presale-pass-mainnet.json');
  if (!fs.existsSync(presalePassPath)) {
    console.error('❌ Presale pass token not found. Run create-presale-pass-mainnet.mjs first.');
    process.exit(1);
  }

  const presalePassInfo = JSON.parse(fs.readFileSync(presalePassPath, 'utf-8'));
  const PRESALE_PASS_MINT = presalePassInfo.mintAddress;

  console.log('Presale Pass Token Mint:', PRESALE_PASS_MINT);
  console.log('Candy Machine ID:', CANDY_MACHINE_ID);

  // Load wallet keypair
  const walletPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'id.json');
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  console.log('Wallet:', walletKeypair.publicKey.toString());

  const connection = new Connection(MAINNET_RPC, 'confirmed');
  const metaplex = Metaplex.make(connection).use(keypairIdentity(walletKeypair));

  // Check balance
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log('Balance:', balance / 1e9, 'SOL\n');

  // Load the Candy Machine
  console.log('📝 Loading Candy Machine...');
  const candyMachine = await metaplex.candyMachines().findByAddress({
    address: new PublicKey(CANDY_MACHINE_ID),
  });

  console.log('✅ Candy Machine loaded');
  console.log('   Items Available:', candyMachine.itemsAvailable.toString());
  console.log('   Items Minted:', candyMachine.itemsMinted.toString());

  // Configure guards
  console.log('\n📝 Configuring Candy Guard with presale pass burn...');
  
  // Update the Candy Machine with guards
  await metaplex.candyMachines().update({
    candyMachine,
    guards: {
      // Default guard (public mint with token burn)
      solPayment: {
        amount: sol(0.001),
        destination: walletKeypair.publicKey,
      },
      tokenBurn: {
        amount: token(1, 0), // Burn 1 token (0 decimals)
        mint: new PublicKey(PRESALE_PASS_MINT),
      },
    },
    groups: [
      // Presale group (buy presale pass)
      {
        label: 'presale',
        guards: {
          solPayment: {
            amount: sol(0.001),
            destination: walletKeypair.publicKey,
          },
          // No token burn for presale - they're buying the pass
        },
      },
    ],
  });

  console.log('✅ Candy Guard configured successfully!');
  console.log('\n📋 Configuration:');
  console.log('   Default (Public Mint):');
  console.log('     - Price: 0.001 SOL');
  console.log('     - Requires: Burn 1 presale pass token');
  console.log('   Presale Group:');
  console.log('     - Price: 0.001 SOL');
  console.log('     - Gives: 1 presale pass token (minted separately)');
  console.log('\n🎫 Presale Pass Mint:', PRESALE_PASS_MINT);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
