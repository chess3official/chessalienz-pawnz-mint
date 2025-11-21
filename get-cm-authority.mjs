import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const CANDY_MACHINE_ID = 'J2H4LfJ6xsejNB4FxHLvevMaTo11BUiF4kbuKVzeDVYA';

async function main() {
  const connection = new Connection(MAINNET_RPC, 'confirmed');
  const metaplex = Metaplex.make(connection);

  console.log('Fetching Candy Machine v3 data...\n');
  console.log('CM Address:', CANDY_MACHINE_ID);

  try {
    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: new PublicKey(CANDY_MACHINE_ID),
    });

    console.log('\n✅ Candy Machine found');
    console.log('Authority:', candyMachine.authorityAddress.toString());
    console.log('Mint Authority:', candyMachine.mintAuthorityAddress.toString());
    console.log('Collection Mint:', candyMachine.collectionMintAddress.toString());
    console.log('Items Available:', candyMachine.itemsAvailable.toString());
    console.log('Items Minted:', candyMachine.itemsMinted.toString());
    
    console.log('\n🔑 USE THIS AS CANDY MACHINE AUTHORITY:');
    console.log(candyMachine.authorityAddress.toString());
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
