import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mainnet Helius RPC
const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';

async function main() {
  console.log('🎫 Creating Presale Pass Token on Mainnet...\n');

  // Load wallet keypair
  const walletPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'id.json');
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  console.log('Wallet:', walletKeypair.publicKey.toString());

  const connection = new Connection(MAINNET_RPC, 'confirmed');

  // Check balance
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log('Balance:', balance / 1e9, 'SOL\n');

  if (balance < 0.01 * 1e9) {
    console.error('❌ Insufficient balance. Need at least 0.01 SOL for token creation.');
    process.exit(1);
  }

  // Create the presale pass token mint
  console.log('📝 Creating presale pass token mint...');
  const mint = await createMint(
    connection,
    walletKeypair,
    walletKeypair.publicKey, // mint authority
    null, // freeze authority (null = no freeze)
    0, // decimals (0 = non-fungible, whole tokens only)
    undefined,
    undefined,
    TOKEN_PROGRAM_ID
  );

  console.log('✅ Presale Pass Token Mint:', mint.toString());

  // Create associated token account for the wallet
  console.log('\n📝 Creating associated token account...');
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    walletKeypair,
    mint,
    walletKeypair.publicKey
  );

  console.log('✅ Token Account:', tokenAccount.address.toString());

  // Mint 10 presale passes to the wallet for testing
  console.log('\n📝 Minting 10 presale passes for testing...');
  await mintTo(
    connection,
    walletKeypair,
    mint,
    tokenAccount.address,
    walletKeypair.publicKey,
    10 // mint 10 passes
  );

  console.log('✅ Minted 10 presale passes to your wallet');

  // Save the mint address to a file
  const outputPath = path.join(__dirname, 'presale-pass-mainnet.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        mintAddress: mint.toString(),
        tokenAccount: tokenAccount.address.toString(),
        authority: walletKeypair.publicKey.toString(),
        decimals: 0,
        supply: 10,
        network: 'mainnet-beta',
        createdAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  console.log('\n✅ Presale pass token created successfully!');
  console.log('📄 Details saved to:', outputPath);
  console.log('\n🎫 PRESALE PASS TOKEN MINT:', mint.toString());
  console.log('\nNext steps:');
  console.log('1. Configure Candy Guard with this token mint for burn');
  console.log('2. Update frontend to handle presale pass minting and burning');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
