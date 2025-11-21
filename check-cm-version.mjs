import { Connection, PublicKey } from '@solana/web3.js';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const CM_ADDRESS = 'EUNaHjFghfqhXd1jDbRJF3PuZrobhfLcQT2WfwbxQPG5';

async function main() {
  const connection = new Connection(MAINNET_RPC, 'confirmed');
  const cmPubkey = new PublicKey(CM_ADDRESS);
  
  const accountInfo = await connection.getAccountInfo(cmPubkey);
  
  if (!accountInfo) {
    console.log('❌ Account does not exist!');
    return;
  }
  
  console.log('Account owner:', accountInfo.owner.toString());
  console.log('Data length:', accountInfo.data.length);
  
  // CM v2 program: cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ
  // CM v3 program: CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR
  
  const CMv2_PROGRAM = 'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ';
  const CMv3_PROGRAM = 'CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR';
  
  if (accountInfo.owner.toString() === CMv2_PROGRAM) {
    console.log('✅ This is a CM v2!');
  } else if (accountInfo.owner.toString() === CMv3_PROGRAM) {
    console.log('⚠️  This is a CM v3!');
  } else {
    console.log('❓ Unknown program owner');
  }
}

main().catch(console.error);
