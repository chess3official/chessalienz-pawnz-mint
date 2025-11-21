import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { 
  getOrCreateAssociatedTokenAccount, 
  transfer,
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import fs from 'fs';

// Configuration
const MAINNET_RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';

async function distributeTokens() {
  console.log('📤 Distributing Presale Pass Tokens...\n');

  // Load wallet
  const walletPath = process.env.WALLET_PATH || './wallet.json';
  if (!fs.existsSync(walletPath)) {
    console.error('❌ Wallet file not found at:', walletPath);
    process.exit(1);
  }

  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  // Load mint info
  if (!fs.existsSync('presale-pass-mint-info.json')) {
    console.error('❌ presale-pass-mint-info.json not found');
    console.log('💡 Run create-presale-pass-tokens.mjs first');
    process.exit(1);
  }

  const mintInfo = JSON.parse(fs.readFileSync('presale-pass-mint-info.json', 'utf-8'));
  const mint = new PublicKey(mintInfo.mintAddress);

  console.log('👛 Your Wallet:', payer.publicKey.toString());
  console.log('🎫 Token Mint:', mint.toString());

  // Load recipients from file
  // Format: recipients.json = [{ "address": "wallet1...", "amount": 1 }, ...]
  const recipientsPath = './recipients.json';
  if (!fs.existsSync(recipientsPath)) {
    console.log('\n📝 Creating example recipients.json file...');
    const exampleRecipients = [
      { address: 'EXAMPLE_WALLET_ADDRESS_1', amount: 1 },
      { address: 'EXAMPLE_WALLET_ADDRESS_2', amount: 2 },
      { address: 'EXAMPLE_WALLET_ADDRESS_3', amount: 1 }
    ];
    fs.writeFileSync(recipientsPath, JSON.stringify(exampleRecipients, null, 2));
    console.log('✅ Created recipients.json');
    console.log('💡 Edit this file with real wallet addresses, then run again');
    process.exit(0);
  }

  const recipients = JSON.parse(fs.readFileSync(recipientsPath, 'utf-8'));
  console.log(`\n📋 Found ${recipients.length} recipients`);

  // Connect to Solana
  const connection = new Connection(MAINNET_RPC, 'confirmed');
  
  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  const balanceSOL = balance / 1e9;
  console.log('💰 SOL Balance:', balanceSOL.toFixed(4), 'SOL');

  // Get your token account
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  console.log('🎫 Your Token Balance:', fromTokenAccount.amount.toString(), 'tokens\n');

  // Calculate total to distribute
  const totalToDistribute = recipients.reduce((sum, r) => sum + r.amount, 0);
  console.log('📊 Total to distribute:', totalToDistribute, 'tokens');

  if (Number(fromTokenAccount.amount) < totalToDistribute) {
    console.error('❌ Insufficient token balance!');
    console.log(`   Need: ${totalToDistribute} tokens`);
    console.log(`   Have: ${fromTokenAccount.amount} tokens`);
    process.exit(1);
  }

  console.log('\n🚀 Starting distribution...\n');

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const recipientPubkey = new PublicKey(recipient.address);
    
    try {
      console.log(`📤 [${i + 1}/${recipients.length}] Sending ${recipient.amount} token(s) to ${recipient.address.slice(0, 8)}...`);

      // Get or create recipient's token account
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        recipientPubkey
      );

      // Transfer tokens
      const signature = await transfer(
        connection,
        payer,
        fromTokenAccount.address,
        toTokenAccount.address,
        payer.publicKey,
        recipient.amount
      );

      successCount++;
      console.log(`   ✅ Sent! Tx: ${signature}\n`);

      // Small delay to avoid rate limits
      if ((i + 1) % 10 === 0) {
        console.log('⏸️  Pausing 2 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      errorCount++;
      const errorMsg = `${recipient.address}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }

  // Final summary
  console.log('='.repeat(60));
  console.log('🎉 DISTRIBUTION COMPLETE!');
  console.log('='.repeat(60));
  console.log(`✅ Successfully sent: ${successCount}/${recipients.length}`);
  console.log(`❌ Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Error details:');
    errors.forEach(err => console.log(`   ${err}`));
  }

  // Check final balance
  const finalBalance = await connection.getBalance(payer.publicKey);
  const finalBalanceSOL = finalBalance / 1e9;
  const spent = balanceSOL - finalBalanceSOL;
  
  console.log('\n💰 Final SOL balance:', finalBalanceSOL.toFixed(4), 'SOL');
  console.log('💸 Total spent:', spent.toFixed(6), 'SOL');
  console.log('📊 Average per transfer:', (spent / successCount).toFixed(6), 'SOL');
  
  console.log('\n✨ Done!');
}

// Run the script
distributeTokens().catch(console.error);
