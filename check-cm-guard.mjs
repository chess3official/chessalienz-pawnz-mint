import { Connection, PublicKey } from '@solana/web3.js';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const CM_ADDRESS = 'J2H4LfJ6xsejNB4FxHLvevMaTo11BUiF4kbuKVzeDVYA';

async function main() {
  const connection = new Connection(MAINNET_RPC, 'confirmed');
  
  const cmAccount = await connection.getAccountInfo(new PublicKey(CM_ADDRESS));
  
  if (!cmAccount) {
    console.log('CM not found');
    return;
  }
  
  console.log('CM Data length:', cmAccount.data.length);
  console.log('CM Owner:', cmAccount.owner.toString());
  
  // CM v3 structure: mintAuthority is at bytes 40-72
  const mintAuthorityBytes = cmAccount.data.slice(40, 72);
  const mintAuthority = new PublicKey(mintAuthorityBytes);
  
  console.log('\nMint Authority from data:', mintAuthority.toString());
  
  // Check if this is a guard PDA
  const [guardPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('candy_guard'), new PublicKey(CM_ADDRESS).toBuffer()],
    new PublicKey('Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g')
  );
  
  console.log('Expected Guard PDA:', guardPDA.toString());
  console.log('Is mint authority a guard?', mintAuthority.equals(guardPDA));
  
  // Check if guard account exists
  const guardAccount = await connection.getAccountInfo(guardPDA);
  console.log('\nGuard account exists?', guardAccount !== null);
  
  if (!guardAccount) {
    console.log('\n⚠️  The CM has a guard PDA set as mint authority, but the guard account is not initialized!');
    console.log('This is why minting fails.');
    console.log('\nSolution: Initialize the guard or update CM to remove guard.');
  }
}

main().catch(console.error);
