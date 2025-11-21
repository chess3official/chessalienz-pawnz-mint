import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import fs from 'fs';

// Configuration
const MAINNET_RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
const TOKEN_MINT = new PublicKey('31bLEgYfLvrQ4e9nXvKMckUG6KQ3r5yhMwBHaJqrRhDm');
const TOKEN_URI = "https://amethyst-worrying-boar-710.mypinata.cloud/ipfs/bafkreiewox4qy6oncpfwtze4x4zxbbhwtewjbvbqhqpgtyy2c5lre4ewaa";

async function addMetadata() {
  console.log('🎨 Adding Metadata to PAWNZ PASS Token...\n');

  // Load wallet
  const walletPath = process.env.WALLET_PATH || './wallet.json';
  if (!fs.existsSync(walletPath)) {
    console.error('❌ Wallet file not found');
    process.exit(1);
  }

  const keypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  console.log('👛 Wallet:', keypair.publicKey.toString());
  console.log('🎫 Token Mint:', TOKEN_MINT.toString());

  // Setup Metaplex
  const connection = new Connection(MAINNET_RPC, 'confirmed');
  const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));

  // Check balance
  const balance = await connection.getBalance(keypair.publicKey);
  console.log('💰 Balance:', (balance / 1e9).toFixed(4), 'SOL\n');

  if (balance < 20000000) {
    console.error('❌ Insufficient balance. Need at least 0.02 SOL');
    process.exit(1);
  }

  console.log('📝 Creating metadata...');
  console.log('   Name: PAWNZ PASS');
  console.log('   Symbol: PWZP');
  console.log('   URI:', TOKEN_URI);

  try {
    // Create metadata for the token
    const { nft } = await metaplex.nfts().create({
      uri: TOKEN_URI,
      name: "PAWNZ PASS",
      symbol: "PWZP",
      sellerFeeBasisPoints: 0,
      useExistingMint: TOKEN_MINT,
    });

    console.log('\n✅ Metadata Created!');
    console.log('   Metadata Address:', nft.address.toString());
    console.log('   View on Solscan:', `https://solscan.io/token/${TOKEN_MINT.toString()}`);
    
    console.log('\n🎉 SUCCESS!');
    console.log('Wait 5-10 minutes for metadata to propagate');
    console.log('Then check your wallet - token should show name and image!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('already exists')) {
      console.log('\n💡 Metadata already exists for this token!');
      console.log('   Your token already has metadata attached.');
      console.log('   Check: https://solscan.io/token/' + TOKEN_MINT.toString());
    }
  }
}

addMetadata().catch(console.error);
