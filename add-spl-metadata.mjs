import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { serialize } from 'borsh';
import fs from 'fs';

// Configuration
const MAINNET_RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
const TOKEN_MINT = new PublicKey('31bLEgYfLvrQ4e9nXvKMckUG6KQ3r5yhMwBHaJqrRhDm');
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Metadata
const TOKEN_NAME = "PAWNZ PASS";
const TOKEN_SYMBOL = "PWZP";
const TOKEN_URI = "https://amethyst-worrying-boar-710.mypinata.cloud/ipfs/bafkreiewox4qy6oncpfwtze4x4zxbbhwtewjbvbqhqpgtyy2c5lre4ewaa";

// Borsh schema for CreateMetadataAccountV3
class CreateMetadataAccountArgsV3 {
  constructor(properties) {
    Object.assign(this, properties);
  }
}

const createMetadataAccountArgsV3Schema = new Map([
  [
    CreateMetadataAccountArgsV3,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['data', {
          kind: 'struct',
          fields: [
            ['name', 'string'],
            ['symbol', 'string'],
            ['uri', 'string'],
            ['sellerFeeBasisPoints', 'u16'],
            ['creators', { kind: 'option', type: 'null' }],
            ['collection', { kind: 'option', type: 'null' }],
            ['uses', { kind: 'option', type: 'null' }],
          ]
        }],
        ['isMutable', 'u8'],
        ['collectionDetails', { kind: 'option', type: 'null' }],
      ],
    },
  ],
]);

async function addMetadata() {
  console.log('🎨 Adding Metadata to PAWNZ PASS Token...\n');

  // Load wallet
  const walletPath = process.env.WALLET_PATH || './wallet.json';
  if (!fs.existsSync(walletPath)) {
    console.error('❌ Wallet file not found');
    process.exit(1);
  }

  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  console.log('👛 Wallet:', payer.publicKey.toString());
  console.log('🎫 Token Mint:', TOKEN_MINT.toString());

  const connection = new Connection(MAINNET_RPC, 'confirmed');

  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  console.log('💰 Balance:', (balance / 1e9).toFixed(4), 'SOL\n');

  if (balance < 20000000) {
    console.error('❌ Insufficient balance. Need at least 0.02 SOL');
    process.exit(1);
  }

  // Derive metadata PDA
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      TOKEN_MINT.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  console.log('📝 Creating metadata...');
  console.log('   Name:', TOKEN_NAME);
  console.log('   Symbol:', TOKEN_SYMBOL);
  console.log('   URI:', TOKEN_URI);
  console.log('   Metadata PDA:', metadataPDA.toString());

  // Create instruction data
  const args = new CreateMetadataAccountArgsV3({
    instruction: 33, // CreateMetadataAccountV3
    data: {
      name: TOKEN_NAME,
      symbol: TOKEN_SYMBOL,
      uri: TOKEN_URI,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: 1,
    collectionDetails: null,
  });

  const data = serialize(createMetadataAccountArgsV3Schema, args);

  // Create instruction
  const keys = [
    { pubkey: metadataPDA, isSigner: false, isWritable: true },
    { pubkey: TOKEN_MINT, isSigner: false, isWritable: false },
    { pubkey: payer.publicKey, isSigner: true, isWritable: false },
    { pubkey: payer.publicKey, isSigner: true, isWritable: true },
    { pubkey: payer.publicKey, isSigner: false, isWritable: false },
    { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false },
    { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId: TOKEN_METADATA_PROGRAM_ID,
    data: Buffer.from(data),
  });

  // Send transaction
  console.log('\n📤 Sending transaction...');
  const transaction = new Transaction().add(instruction);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer.publicKey;

  try {
    const signature = await connection.sendTransaction(transaction, [payer]);
    console.log('⏳ Confirming...');
    
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    console.log('\n✅ Metadata Created!');
    console.log('   Transaction:', signature);
    console.log('   View on Solscan:', `https://solscan.io/tx/${signature}`);
    console.log('   Token page:', `https://solscan.io/token/${TOKEN_MINT.toString()}`);
    
    console.log('\n🎉 SUCCESS!');
    console.log('Wait 5-10 minutes for metadata to propagate');
    console.log('Then check your wallet - token should show "PAWNZ PASS" with image!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.logs) {
      console.log('\nProgram Logs:');
      error.logs.forEach(log => console.log('  ', log));
    }
  }
}

addMetadata().catch(console.error);
