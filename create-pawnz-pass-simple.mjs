import { Connection, Keypair } from '@solana/web3.js';
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
const TOTAL_SUPPLY = 1000; // 1000 presale passes

async function createPawnzPassToken() {
  console.log('🎫 Creating PAWNZ PASS Tokens (Simple Version)...\n');

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
  console.log(`   Name: PAWNZ PASS`);
  console.log(`   Symbol: $PWZP`);
  console.log(`   Supply: ${TOTAL_SUPPLY}`);

  // Create the token mint
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey, // mint authority
    payer.publicKey, // freeze authority
    DECIMALS,
    undefined,
    undefined,
    TOKEN_PROGRAM_ID
  );

  console.log('✅ Token Mint Created:', mint.toString());

  console.log('\n📝 Step 2: Creating token account...');
  
  // Create associated token account
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  console.log('✅ Token Account Created:', tokenAccount.address.toString());

  console.log(`\n🎫 Step 3: Minting ${TOTAL_SUPPLY} PAWNZ PASS tokens...`);

  // Mint tokens
  const signature = await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer.publicKey,
    TOTAL_SUPPLY
  );

  console.log(`✅ Minted ${TOTAL_SUPPLY} tokens!`);
  console.log('   Transaction:', signature);

  // Save mint info
  const mintInfo = {
    mintAddress: mint.toString(),
    name: "PAWNZ PASS",
    symbol: "$PWZP",
    decimals: DECIMALS,
    totalSupply: TOTAL_SUPPLY,
    createdAt: new Date().toISOString(),
    authority: payer.publicKey.toString(),
    price: '2 SOL per token',
    tokenAccount: tokenAccount.address.toString()
  };

  fs.writeFileSync('pawnz-pass-mint-info.json', JSON.stringify(mintInfo, null, 2));
  console.log('\n💾 Mint info saved to: pawnz-pass-mint-info.json');

  // Check final balance
  const finalBalance = await connection.getBalance(payer.publicKey);
  const finalBalanceSOL = finalBalance / 1e9;
  const spent = balanceSOL - finalBalanceSOL;
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SUCCESS!');
  console.log('='.repeat(60));
  console.log('✅ Token Mint Address:', mint.toString());
  console.log('✅ Name: PAWNZ PASS');
  console.log('✅ Symbol: $PWZP');
  console.log('✅ Total Supply:', TOTAL_SUPPLY, 'tokens');
  console.log('✅ Your Token Balance:', TOTAL_SUPPLY, 'tokens');
  console.log('✅ Token Account:', tokenAccount.address.toString());
  console.log('💰 Final SOL balance:', finalBalanceSOL.toFixed(4), 'SOL');
  console.log('💸 Total spent:', spent.toFixed(6), 'SOL');
  console.log('\n📋 IMPORTANT - Add to Vercel Environment Variables:');
  console.log('   NEXT_PUBLIC_PRESALE_PASS_MINT=' + mint.toString());
  console.log('   PRESALE_PASS_PRICE=2');
  console.log('   TREASURY_WALLET=' + payer.publicKey.toString());
  console.log('\n📋 Next Steps:');
  console.log('   1. Add environment variables to Vercel (see above)');
  console.log('   2. Keep tokens in your wallet for automated sales');
  console.log('   3. Or distribute manually to presale participants');
  console.log('   4. (Optional) Add metadata later using Metaplex tools');
  console.log('\n✨ Done!');
}

// Run the script
createPawnzPassToken().catch(console.error);
