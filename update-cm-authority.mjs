import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import fs from 'fs';
import path from 'path';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const CANDY_MACHINE_ID = 'J2H4LfJ6xsejNB4FxHLvevMaTo11BUiF4kbuKVzeDVYA';

async function main() {
  // Load your wallet keypair
  const walletPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'id.json');
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  console.log('Updating Candy Machine authority...\n');
  console.log('Your wallet:', walletKeypair.publicKey.toString());
  console.log('CM Address:', CANDY_MACHINE_ID);

  const connection = new Connection(MAINNET_RPC, 'confirmed');
  const metaplex = Metaplex.make(connection).use(keypairIdentity(walletKeypair));

  // Load candy machine
  const candyMachine = await metaplex.candyMachines().findByAddress({
    address: new PublicKey(CANDY_MACHINE_ID),
  });

  console.log('\nCurrent CM Authority:', candyMachine.authorityAddress.toString());
  console.log('Current Mint Authority:', candyMachine.mintAuthorityAddress.toString());

  // Check if we're already the authority
  if (candyMachine.authorityAddress.toString() === walletKeypair.publicKey.toString()) {
    console.log('\n✅ You are already the authority!');
    return;
  }

  console.log('\n⚠️  The CM authority is different from your wallet.');
  console.log('This means the CM was deployed with a different authority.');
  console.log('\nTo fix this, you need to either:');
  console.log('1. Use the wallet at address:', candyMachine.authorityAddress.toString());
  console.log('2. Have that wallet transfer authority to you');
  console.log('3. Deploy a new Candy Machine with your wallet as authority');
  
  // Check if the current authority wallet exists and has the keypair
  const currentAuthPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'authority.json');
  if (fs.existsSync(currentAuthPath)) {
    console.log('\n📝 Found authority.json - attempting to transfer authority...');
    
    const authorityKeypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(currentAuthPath, 'utf-8')))
    );
    
    if (authorityKeypair.publicKey.toString() === candyMachine.authorityAddress.toString()) {
      console.log('✅ Authority keypair matches! Transferring...');
      
      const metaplexWithAuthority = Metaplex.make(connection).use(keypairIdentity(authorityKeypair));
      
      await metaplexWithAuthority.candyMachines().update({
        candyMachine: candyMachine.address,
        authority: walletKeypair.publicKey,
      });
      
      console.log('✅ Authority transferred to:', walletKeypair.publicKey.toString());
    }
  }
}

main().catch(console.error);
