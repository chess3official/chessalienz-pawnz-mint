import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import * as mplTokenMetadata from '@metaplex-foundation/mpl-token-metadata';
import fs from 'fs';

const { createCreateMetadataAccountV3Instruction, PROGRAM_ID: METADATA_PROGRAM_ID } = mplTokenMetadata;

// Configuration
const MAINNET_RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
const TOKEN_MINT = new PublicKey('31bLEgYfLvrQ4e9nXvKMckUG6KQ3r5yhMwBHaJqrRhDm');

// Token Metadata
const TOKEN_NAME = "PAWNZ PASS";
const TOKEN_SYMBOL = "PWZP";
const TOKEN_URI = "https://amethyst-worrying-boar-710.mypinata.cloud/ipfs/bafkreiewox4qy6oncpfwtze4x4zxbbhwtewjbvbqhqpgtyy2c5lre4ewaa";

async function addTokenMetadata() {
  console.log('🎨 Adding Metadata to PAWNZ PASS Token...\n');

  if (!TOKEN_URI) {
    console.error('❌ TOKEN_URI not set!');
    console.log('📋 Steps to complete:');
    console.log('   1. Upload pawnzpass.png to IPFS (use Pinata, Web3.Storage, etc.)');
    console.log('   2. Create metadata JSON with image URL');
    console.log('   3. Upload metadata JSON to IPFS');
    console.log('   4. Update TOKEN_URI in this script with metadata URL');
    console.log('   5. Run this script again');
    process.exit(1);
  }

  // Load wallet
  const walletPath = process.env.WALLET_PATH || './wallet.json';
  if (!fs.existsSync(walletPath)) {
    console.error('❌ Wallet file not found at:', walletPath);
    process.exit(1);
  }

  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  console.log('👛 Wallet:', payer.publicKey.toString());
  console.log('🎫 Token Mint:', TOKEN_MINT.toString());

  // Connect to Solana
  const connection = new Connection(MAINNET_RPC, 'confirmed');
  
  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  const balanceSOL = balance / 1e9;
  console.log('💰 Balance:', balanceSOL.toFixed(4), 'SOL');

  if (balanceSOL < 0.02) {
    console.error('❌ Insufficient balance. Need at least 0.02 SOL');
    process.exit(1);
  }

  // Metaplex Token Metadata Program ID
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  
  // Derive metadata PDA
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      TOKEN_MINT.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  console.log('\n📝 Creating Token Metadata...');
  console.log('   Name:', TOKEN_NAME);
  console.log('   Symbol:', TOKEN_SYMBOL);
  console.log('   URI:', TOKEN_URI);
  console.log('   Metadata PDA:', metadataPDA.toString());

  // Create metadata instruction
  const metadataInstruction = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: TOKEN_MINT,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          name: TOKEN_NAME,
          symbol: TOKEN_SYMBOL,
          uri: TOKEN_URI,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: true,
        collectionDetails: null,
      },
    }
  );

  // Send transaction
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const transaction = new Transaction().add(metadataInstruction);
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer.publicKey;

  console.log('\n📤 Sending transaction...');
  const signature = await connection.sendTransaction(transaction, [payer]);
  
  console.log('⏳ Confirming transaction...');
  await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  });

  console.log('✅ Metadata Created!');
  console.log('   Transaction:', signature);
  console.log('   View on Solscan:', `https://solscan.io/tx/${signature}`);

  // Check final balance
  const finalBalance = await connection.getBalance(payer.publicKey);
  const finalBalanceSOL = finalBalance / 1e9;
  const spent = balanceSOL - finalBalanceSOL;
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SUCCESS!');
  console.log('='.repeat(60));
  console.log('✅ Token now has metadata!');
  console.log('✅ Name:', TOKEN_NAME);
  console.log('✅ Symbol:', TOKEN_SYMBOL);
  console.log('💰 Cost:', spent.toFixed(6), 'SOL');
  console.log('\n📋 Next Steps:');
  console.log('   1. Wait a few minutes for metadata to propagate');
  console.log('   2. Check your wallet - token should show name and image');
  console.log('   3. View on Solscan:', `https://solscan.io/token/${TOKEN_MINT.toString()}`);
  console.log('\n✨ Done!');
}

// Run the script
addTokenMetadata().catch(console.error);
