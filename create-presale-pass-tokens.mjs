import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo,
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import fs from 'fs';

// Configuration
const MAINNET_RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
const DECIMALS = 0; // No decimals - each token is whole (1 pass = 1 token)

async function createPresalePassTokens() {
  console.log('🎫 Creating Presale Pass Tokens...\n');

  // Load wallet
  const walletPath = process.env.WALLET_PATH || './wallet.json';
  if (!fs.existsSync(walletPath)) {
    console.error('❌ Wallet file not found at:', walletPath);
    console.log('💡 Set WALLET_PATH environment variable or place wallet.json in project root');
    process.exit(1);
  }

  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  console.log('👛 Wallet:', payer.publicKey.toString());

  // Connect to Solana
  const connection = new Connection(MAINNET_RPC, 'confirmed');
  
  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  const balanceSOL = balance / 1e9;
  console.log('💰 Balance:', balanceSOL.toFixed(4), 'SOL');

  if (balanceSOL < 0.1) {
    console.error('❌ Insufficient balance. Need at least 0.1 SOL');
    console.log('   Current balance:', balanceSOL.toFixed(4), 'SOL');
    process.exit(1);
  }

  console.log('\n📝 Step 1: Creating Token Mint...');
  console.log('   This creates the "Presale Pass" token type');

  // Create the token mint
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey, // mint authority
    payer.publicKey, // freeze authority (can freeze tokens if needed)
    DECIMALS,
    undefined,
    undefined,
    TOKEN_PROGRAM_ID
  );

  console.log('✅ Token Mint Created:', mint.toString());
  console.log('   This is your PRESALE PASS TOKEN ADDRESS');
  console.log('   Save this address - you\'ll need it for the mint page!\n');

  // Save mint address to file
  const mintInfo = {
    mintAddress: mint.toString(),
    decimals: DECIMALS,
    totalSupply: 1000,
    createdAt: new Date().toISOString(),
    authority: payer.publicKey.toString()
  };

  fs.writeFileSync('presale-pass-mint-info.json', JSON.stringify(mintInfo, null, 2));
  console.log('💾 Mint info saved to: presale-pass-mint-info.json\n');

  console.log('📝 Step 2: Creating token account for your wallet...');
  
  // Create associated token account for the payer
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  console.log('✅ Token Account Created:', tokenAccount.address.toString());

  console.log('\n🎫 Step 3: Minting 1,000 presale pass tokens...');
  console.log('   All tokens will be minted to your wallet');
  console.log('   You can then distribute them to users\n');

  // Mint 1,000 tokens to your wallet
  const signature = await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer.publicKey, // mint authority
    1000 // amount (1000 tokens)
  );

  console.log('✅ Minted 1,000 tokens!');
  console.log('   Transaction:', signature);

  // Check final balance
  const finalBalance = await connection.getBalance(payer.publicKey);
  const finalBalanceSOL = finalBalance / 1e9;
  const spent = balanceSOL - finalBalanceSOL;
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SUCCESS!');
  console.log('='.repeat(60));
  console.log('✅ Token Mint Address:', mint.toString());
  console.log('✅ Total Supply: 1,000 tokens');
  console.log('✅ Your Token Balance: 1,000 tokens');
  console.log('💰 Final SOL balance:', finalBalanceSOL.toFixed(4), 'SOL');
  console.log('💸 Total spent:', spent.toFixed(6), 'SOL');
  console.log('\n📋 Next Steps:');
  console.log('   1. Update .env.local with new token mint address');
  console.log('   2. Distribute tokens to presale participants');
  console.log('   3. Users holding tokens can mint FREE NFTs');
  console.log('\n✨ Done!');
}

// Run the script
createPresalePassTokens().catch(console.error);
