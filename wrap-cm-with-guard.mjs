import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import { wrap, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { publicKey as umiPublicKey } from '@metaplex-foundation/umi';
import fs from 'fs';
import path from 'path';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const CM_ADDRESS = 'J2H4LfJ6xsejNB4FxHLvevMaTo11BUiF4kbuKVzeDVYA';
const GUARD_ADDRESS = '8dgTUsLH4JdEcUBzszwiAjU3NEGJsxxvQDjrUTEDcUk2'; // From init script

async function main() {
  console.log('Wrapping Candy Machine with Guard...\n');

  // Load wallet
  const walletPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'id.json');
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  console.log('Wallet:', walletKeypair.publicKey.toString());

  const umi = createUmi(MAINNET_RPC);
  
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(walletKeypair.secretKey);
  
  umi.use(keypairIdentity(umiKeypair))
     .use(mplCandyMachine());

  const candyMachineAddress = umiPublicKey(CM_ADDRESS);
  const candyGuardAddress = umiPublicKey(GUARD_ADDRESS);

  console.log('CM:', CM_ADDRESS);
  console.log('Guard:', GUARD_ADDRESS);
  console.log('\nWrapping CM with guard...');

  // Wrap the candy machine with the guard
  const result = await wrap(umi, {
    candyMachine: candyMachineAddress,
    candyGuard: candyGuardAddress,
  }).sendAndConfirm(umi);

  console.log('\n✅ Candy Machine wrapped with guard!');
  console.log('Signature:', result.signature);
  console.log('\nNow the CM will use this guard for minting.');
}

main().catch(console.error);
