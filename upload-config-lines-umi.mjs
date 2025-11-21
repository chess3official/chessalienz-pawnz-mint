import { Keypair } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import { addConfigLines, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { publicKey as umiPublicKey } from '@metaplex-foundation/umi';
import fs from 'fs';
import path from 'path';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const CM_ADDRESS = 'Hz7t4tdJsEifuCWrAXtGaschHttK6CGoWPUcw9WpR5Cd';

async function main() {
  console.log('Uploading config lines to CM...\n');

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

  // Load cache to get metadata URIs
  const cache = JSON.parse(fs.readFileSync('../pawnz-mainnet-test/cache-new.json', 'utf-8'));
  
  const configLines = [];
  for (let i = 0; i < 3; i++) {
    const item = cache.items[i.toString()];
    configLines.push({
      name: item.name,
      uri: item.metadata_link,
    });
  }

  console.log('Config lines to upload:', configLines);

  console.log('\nUploading config lines...');
  const result = await addConfigLines(umi, {
    candyMachine: candyMachineAddress,
    index: 0,
    configLines,
  }).sendAndConfirm(umi);

  console.log('\n✅ Config lines uploaded!');
  console.log('Signature:', result.signature);
}

main().catch(console.error);
