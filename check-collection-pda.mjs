import { PublicKey } from '@solana/web3.js';

const COLLECTION_MINT = '4K74nmy4E7KprxmDTp9hkWkC4RkBHtkdzvVrDhMHY47C';
const TOKEN_METADATA_PROGRAM = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
const EXPECTED_ADDRESS = '54hvNZNSjt2wtwg9J7zV7p7VJvnFGm56iYMSacLCeKzt';

console.log('Checking if', EXPECTED_ADDRESS, 'is a collection-related PDA...\n');

// Metadata PDA
const [metadataPDA] = PublicKey.findProgramAddressSync(
  [
    Buffer.from('metadata'),
    new PublicKey(TOKEN_METADATA_PROGRAM).toBuffer(),
    new PublicKey(COLLECTION_MINT).toBuffer(),
  ],
  new PublicKey(TOKEN_METADATA_PROGRAM)
);

console.log('Collection Metadata PDA:', metadataPDA.toString());
if (metadataPDA.toString() === EXPECTED_ADDRESS) {
  console.log('✅ MATCH! This is the collection metadata PDA');
}

// Master Edition PDA
const [editionPDA] = PublicKey.findProgramAddressSync(
  [
    Buffer.from('metadata'),
    new PublicKey(TOKEN_METADATA_PROGRAM).toBuffer(),
    new PublicKey(COLLECTION_MINT).toBuffer(),
    Buffer.from('edition'),
  ],
  new PublicKey(TOKEN_METADATA_PROGRAM)
);

console.log('\nCollection Master Edition PDA:', editionPDA.toString());
if (editionPDA.toString() === EXPECTED_ADDRESS) {
  console.log('✅ MATCH! This is the collection master edition PDA');
}

// Collection Authority Record
const [authorityRecordPDA] = PublicKey.findProgramAddressSync(
  [
    Buffer.from('metadata'),
    new PublicKey(TOKEN_METADATA_PROGRAM).toBuffer(),
    new PublicKey(COLLECTION_MINT).toBuffer(),
    Buffer.from('collection_authority'),
    new PublicKey('D2nUJVgRMHgeAH8Zw3gCMjhgRZin9xmjSuStSZjtqkC2').toBuffer(),
  ],
  new PublicKey(TOKEN_METADATA_PROGRAM)
);

console.log('\nCollection Authority Record PDA:', authorityRecordPDA.toString());
if (authorityRecordPDA.toString() === EXPECTED_ADDRESS) {
  console.log('✅ MATCH! This is the collection authority record PDA');
}
