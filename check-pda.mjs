import { PublicKey } from '@solana/web3.js';

const CANDY_MACHINE_ID = 'J2H4LfJ6xsejNB4FxHLvevMaTo11BUiF4kbuKVzeDVYA';
const CM_V3_PROGRAM = 'CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR';
const EXPECTED_ADDRESS = '54hvNZNSjt2wtwg9J7zV7p7VJvnFGm56iYMSacLCeKzt';

console.log('Checking if', EXPECTED_ADDRESS, 'is a PDA...\n');

// Try common PDA derivations for CM v3
const seeds = [
  ['metadata', new PublicKey(CANDY_MACHINE_ID).toBuffer()],
  ['candy_machine', new PublicKey(CANDY_MACHINE_ID).toBuffer()],
  [Buffer.from('candy_machine'), new PublicKey(CANDY_MACHINE_ID).toBuffer()],
  [Buffer.from('authority'), new PublicKey(CANDY_MACHINE_ID).toBuffer()],
];

for (const seed of seeds) {
  try {
    const [pda, bump] = PublicKey.findProgramAddressSync(seed, new PublicKey(CM_V3_PROGRAM));
    console.log('Seed:', seed.map(s => s instanceof Buffer && s.length < 50 ? s.toString('utf-8') : 'PublicKey').join(', '));
    console.log('PDA:', pda.toString());
    console.log('Bump:', bump);
    
    if (pda.toString() === EXPECTED_ADDRESS) {
      console.log('✅ MATCH FOUND!');
    }
    console.log('');
  } catch (e) {
    // Skip invalid seeds
  }
}
