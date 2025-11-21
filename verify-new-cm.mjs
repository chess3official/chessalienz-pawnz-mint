import { Connection, PublicKey } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fetchCandyMachine, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { publicKey as umiPublicKey } from '@metaplex-foundation/umi';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const NEW_CM = 'Hz7t4tdJsEifuCWrAXtGaschHttK6CGoWPUcw9WpR5Cd';

async function main() {
  console.log('Verifying new CM deployment...\n');

  const umi = createUmi(MAINNET_RPC).use(mplCandyMachine());
  
  const cm = await fetchCandyMachine(umi, umiPublicKey(NEW_CM));
  
  console.log('✅ Candy Machine:', NEW_CM);
  console.log('Authority:', cm.authority);
  console.log('Mint Authority:', cm.mintAuthority);
  console.log('Collection Mint:', cm.collectionMint);
  console.log('Items Redeemed:', cm.itemsRedeemed);
  console.log('Items Available:', cm.data.itemsAvailable);
  console.log('\n✅ CM is ready to mint!');
}

main().catch(console.error);
