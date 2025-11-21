import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import { createCandyGuard, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { publicKey as umiPublicKey, generateSigner, createSignerFromKeypair } from '@metaplex-foundation/umi';
import fs from 'fs';
import path from 'path';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const CM_ADDRESS = 'J2H4LfJ6xsejNB4FxHLvevMaTo11BUiF4kbuKVzeDVYA';

async function main() {
  console.log('Initializing Candy Guard for CM...\n');

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

  console.log('Creating empty Candy Guard for CM:', CM_ADDRESS);

  // Generate a new base signer for the guard
  const baseSigner = generateSigner(umi);

  console.log('Guard base:', baseSigner.publicKey);

  // Create an empty guard (no restrictions)
  const result = await createCandyGuard(umi, {
    base: baseSigner,
    guards: {},
  }).sendAndConfirm(umi);

  console.log('\n✅ Candy Guard initialized!');
  console.log('Signature:', result.signature);
  console.log('\nNow you can mint from the CM.');
}

main().catch(console.error);
