import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const CM_V2_PROGRAM = new PublicKey('cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ');

async function main() {
  console.log('🚀 Deploying Candy Machine V2 on Mainnet (Raw Instructions)...\n');

  // Load wallet
  const walletPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'id.json');
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  console.log('Wallet:', walletKeypair.publicKey.toString());

  const connection = new Connection(MAINNET_RPC, 'confirmed');
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log('Balance:', balance / 1e9, 'SOL\n');

  // First create collection NFT using Metaplex SDK (this works fine)
  console.log('📝 Creating collection NFT...');
  const metaplex = Metaplex.make(connection).use(keypairIdentity(walletKeypair));
  
  const { nft: collectionNft } = await metaplex.nfts().create({
    uri: 'https://gateway.irys.xyz/CDELWFO3SJKdjNl22Xfb6eyz1eTLH3daZFE8V2dbBgs',
    name: 'Chessalienz: Pawnz Collection',
    sellerFeeBasisPoints: 500,
    symbol: 'PWNZ',
    creators: [
      {
        address: walletKeypair.publicKey,
        share: 100,
      },
    ],
    isMutable: true,
    isCollection: true,
  });

  console.log('✅ Collection NFT created:', collectionNft.address.toString());

  console.log('\n⚠️  Note: Metaplex JS SDK only supports CM v3 deployment.');
  console.log('For CM v2, you need to use Sugar CLI v1.x or the deprecated candy-machine-cli.');
  console.log('\nAlternatively, we can:');
  console.log('1. Use the existing CM v3 and fix the minting logic');
  console.log('2. Download Sugar v1.x to deploy CM v2');
  console.log('3. Use candy-machine-cli (deprecated but works for CM v2)');
  
  console.log('\n💡 Recommendation: Use the existing CM v3 at J2H4LfJ6xsejNB4FxHLvevMaTo11BUiF4kbuKVzeDVYA');
  console.log('   It already has your assets uploaded and just needs proper minting implementation.');
}

main().catch(console.error);
