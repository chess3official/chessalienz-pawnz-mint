import fs from 'fs';

// Token Metadata
const TOKEN_NAME = "PAWNZ PASS";
const TOKEN_SYMBOL = "$PWZP";
const TOKEN_DESCRIPTION = "Presale pass for Chessalienz: Pawnz NFT Collection. Holders can redeem 1 free NFT per pass during presale.";

// You'll need to upload the image first and get its URL
const IMAGE_URL = ""; // Update this after uploading pawnzpass.png

const metadata = {
  name: TOKEN_NAME,
  symbol: TOKEN_SYMBOL,
  description: TOKEN_DESCRIPTION,
  image: IMAGE_URL,
  attributes: [
    {
      trait_type: "Type",
      value: "Presale Pass"
    },
    {
      trait_type: "Collection",
      value: "Chessalienz: Pawnz"
    },
    {
      trait_type: "Redeemable",
      value: "Yes"
    },
    {
      trait_type: "Free NFTs",
      value: "1"
    }
  ],
  properties: {
    category: "image",
    files: [
      {
        uri: IMAGE_URL,
        type: "image/png"
      }
    ]
  }
};

// Save metadata JSON
fs.writeFileSync('token-metadata.json', JSON.stringify(metadata, null, 2));

console.log('✅ Metadata JSON created: token-metadata.json');
console.log('\n📋 Next Steps:');
console.log('1. Upload pawnzpass.png to a hosting service:');
console.log('   - Pinata (https://pinata.cloud)');
console.log('   - Web3.Storage (https://web3.storage)');
console.log('   - Or any image hosting service');
console.log('\n2. Update IMAGE_URL in this script with the uploaded image URL');
console.log('3. Run this script again to regenerate metadata.json');
console.log('4. Upload token-metadata.json to the same service');
console.log('5. Use that metadata URL when creating the token');
