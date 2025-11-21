import { Connection, PublicKey } from '@solana/web3.js';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const MYSTERY_ADDRESS = '54hvNZNSjt2wtwg9J7zV7p7VJvnFGm56iYMSacLCeKzt';

async function main() {
  const connection = new Connection(MAINNET_RPC, 'confirmed');
  
  console.log('Checking address:', MYSTERY_ADDRESS);
  
  const accountInfo = await connection.getAccountInfo(new PublicKey(MYSTERY_ADDRESS));
  
  if (!accountInfo) {
    console.log('❌ Account does not exist');
    return;
  }
  
  console.log('\n✅ Account exists');
  console.log('Owner:', accountInfo.owner.toString());
  console.log('Lamports:', accountInfo.lamports / 1e9, 'SOL');
  console.log('Data length:', accountInfo.data.length);
  console.log('Executable:', accountInfo.executable);
  
  // Check if it's a keypair you might have
  console.log('\n💡 This might be a keypair from a previous deployment.');
  console.log('Check if you have this in your .config/solana/ directory or deployment files.');
}

main().catch(console.error);
