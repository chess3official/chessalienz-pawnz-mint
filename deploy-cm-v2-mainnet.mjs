import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Metaplex, keypairIdentity, toBigNumber, toDateTime, sol } from '@metaplex-foundation/js';
import fs from 'fs';
import path from 'path';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';

async function main() {
  console.log('🚀 Deploying Candy Machine V2 on Mainnet...\n');

  // Load wallet
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

  if (balance < 0.05 * 1e9) {
    console.error('❌ Insufficient balance. Need at least 0.05 SOL for deployment.');
    return;
  }

  // Create collection NFT first
  console.log('📝 Creating collection NFT...');
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

  // Deploy Candy Machine V2
  console.log('\n📝 Deploying Candy Machine V2...');
  
  const { candyMachine } = await metaplex.candyMachines().create({
    itemsAvailable: toBigNumber(3),
    sellerFeeBasisPoints: 500,
    symbol: 'PWNZ',
    maxEditionSupply: toBigNumber(0),
    isMutable: true,
    creators: [
      {
        address: walletKeypair.publicKey,
        share: 100,
      },
    ],
    collection: {
      address: collectionNft.address,
      updateAuthority: walletKeypair,
    },
    // No guards - we'll handle payment and pass burning in the frontend
  });

  console.log('\n✅ Candy Machine V2 deployed successfully!');
  console.log('Candy Machine ID:', candyMachine.address.toString());
  console.log('Collection Mint:', collectionNft.address.toString());
  console.log('Authority:', walletKeypair.publicKey.toString());

  // Save to file
  const deploymentInfo = {
    candyMachine: candyMachine.address.toString(),
    collectionMint: collectionNft.address.toString(),
    authority: walletKeypair.publicKey.toString(),
    itemsAvailable: 3,
    price: 0.001,
    network: 'mainnet-beta',
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'cm-v2-deployment.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('\n📄 Deployment info saved to: cm-v2-deployment.json');
  console.log('\n🎉 Ready to mint!');
}

main().catch(console.error);
