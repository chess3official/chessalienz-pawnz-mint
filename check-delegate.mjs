import { Connection, PublicKey } from '@solana/web3.js';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const EXPECTED_ADDRESS = '54hvNZNSjt2wtwg9J7zV7p7VJvnFGm56iYMSacLCeKzt';

async function main() {
  const connection = new Connection(MAINNET_RPC, 'confirmed');
  
  console.log('Checking account:', EXPECTED_ADDRESS, '\n');
  
  const accountInfo = await connection.getAccountInfo(new PublicKey(EXPECTED_ADDRESS));
  
  if (accountInfo) {
    console.log('✅ Account exists');
    console.log('Owner:', accountInfo.owner.toString());
    console.log('Data length:', accountInfo.data.length);
    console.log('Lamports:', accountInfo.lamports);
    
    // If it's a Token Metadata program account, it might be a delegate record
    if (accountInfo.owner.toString() === 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s') {
      console.log('\n📝 This is a Token Metadata program account (likely a delegate or authority record)');
    }
  } else {
    console.log('❌ Account does not exist');
  }
}

main().catch(console.error);
