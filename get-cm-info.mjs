import { Connection, PublicKey } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const CANDY_MACHINE_ID = 'J2H4LfJ6xsejNB4FxHLvevMaTo11BUiF4kbuKVzeDVYA';

async function main() {
  const connection = new Connection(MAINNET_RPC, 'confirmed');
  const candyMachine = new PublicKey(CANDY_MACHINE_ID);

  console.log('Fetching Candy Machine data...\n');
  console.log('CM Address:', CANDY_MACHINE_ID);

  const accountInfo = await connection.getAccountInfo(candyMachine);
  
  if (!accountInfo) {
    console.error('Candy Machine not found!');
    return;
  }

  console.log('\n✅ Candy Machine found');
  console.log('Owner:', accountInfo.owner.toString());
  console.log('Data length:', accountInfo.data.length);

  // Try to parse collection mint from cache
  const cachePath = path.join('C:\\Users\\kkbad\\CascadeProjects\\pawnz-mainnet-test', 'cache.json');
  
  if (fs.existsSync(cachePath)) {
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    console.log('\n📄 From cache.json:');
    console.log('Candy Machine:', cache.program?.candyMachine);
    console.log('Collection Mint:', cache.program?.collectionMint);
    
    if (cache.program?.collectionMint) {
      // Verify collection exists
      const collectionMint = new PublicKey(cache.program.collectionMint);
      const collectionInfo = await connection.getAccountInfo(collectionMint);
      
      if (collectionInfo) {
        console.log('\n✅ Collection mint exists on-chain');
        console.log('Collection Mint:', collectionMint.toString());
      }
    }
  }

  // CM v2 data layout (simplified)
  // Bytes 8-40: authority (32 bytes)
  // Bytes 40-72: wallet (32 bytes)
  
  const data = accountInfo.data;
  
  if (data.length > 72) {
    const authority = new PublicKey(data.slice(8, 40));
    const wallet = new PublicKey(data.slice(40, 72));
    
    console.log('\n📊 Parsed CM v2 data:');
    console.log('Authority:', authority.toString());
    console.log('Wallet:', wallet.toString());
  }
}

main().catch(console.error);
