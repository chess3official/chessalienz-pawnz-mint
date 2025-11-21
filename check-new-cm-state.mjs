import { Connection, PublicKey } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fetchCandyMachine, fetchCandyGuard, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { publicKey as umiPublicKey } from '@metaplex-foundation/umi';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const NEW_CM = 'Hz7t4tdJsEifuCWrAXtGaschHttK6CGoWPUcw9WpR5Cd';
const GUARD_ADDRESS = 'EgbQzdgr9AXPrfk4kVjEt2myFKkJ8drY2dECa6Mc3cou';

async function main() {
  console.log('Checking CM and Guard state...\n');

  const umi = createUmi(MAINNET_RPC).use(mplCandyMachine());
  
  const cm = await fetchCandyMachine(umi, umiPublicKey(NEW_CM));
  
  console.log('CM Address:', NEW_CM);
  console.log('CM Authority:', cm.authority);
  console.log('CM Mint Authority:', cm.mintAuthority);
  console.log('CM Collection:', cm.collectionMint);
  
  console.log('\nChecking guard...');
  try {
    const guard = await fetchCandyGuard(umi, umiPublicKey(GUARD_ADDRESS));
    console.log('✅ Guard exists at:', GUARD_ADDRESS);
    console.log('Guard base:', guard.base);
    console.log('Guard authority:', guard.authority);
    console.log('Guard groups:', guard.groups);
  } catch (e) {
    console.log('❌ Guard does not exist or error:', e.message);
  }
  
  // Check if mint authority is the guard
  console.log('\nIs mint authority the guard?', cm.mintAuthority === GUARD_ADDRESS);
}

main().catch(console.error);
