import crypto from 'crypto';

// Anchor uses the first 8 bytes of sha256("global:instruction_name")
function getDiscriminator(instructionName) {
  const hash = crypto.createHash('sha256').update(`global:${instructionName}`).digest();
  return Array.from(hash.slice(0, 8));
}

console.log('CM v3 Instruction Discriminators:\n');

const instructions = [
  'mint',
  'mint_v2',
  'mintV2',
  'mint_nft',
  'mintNft',
];

for (const name of instructions) {
  const disc = getDiscriminator(name);
  console.log(`${name}: [${disc.join(', ')}]`);
}
