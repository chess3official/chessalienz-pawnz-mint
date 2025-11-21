import fs from 'fs';
import path from 'path';
import { NFTStorage, File } from 'nft.storage';

// Configuration
const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY || '';
const IMAGE_PATH = 'C:\\Users\\kkbad\\OneDrive\\Pictures\\pawnzpass.png';

// Token Metadata
const TOKEN_NAME = "PAWNZ PASS";
const TOKEN_SYMBOL = "$PWZP";
const TOKEN_DESCRIPTION = "Presale pass for Chessalienz: Pawnz NFT Collection. Holders can redeem 1 free NFT per pass during presale.";

async function uploadTokenMetadata() {
  console.log('📤 Uploading PAWNZ PASS Metadata to IPFS...\n');

  if (!NFT_STORAGE_API_KEY) {
    console.error('❌ NFT_STORAGE_API_KEY not set');
    console.log('💡 Get a free API key from https://nft.storage');
    console.log('   Then set: export NFT_STORAGE_API_KEY=your_key');
    process.exit(1);
  }

  if (!fs.existsSync(IMAGE_PATH)) {
    console.error('❌ Image not found at:', IMAGE_PATH);
    console.log('💡 Update IMAGE_PATH in this script to point to your pawnzpass.png');
    process.exit(1);
  }

  const client = new NFTStorage({ token: NFT_STORAGE_API_KEY });

  console.log('📝 Step 1: Reading image file...');
  const imageData = fs.readFileSync(IMAGE_PATH);
  const imageFile = new File([imageData], 'pawnzpass.png', { type: 'image/png' });
  console.log('✅ Image loaded:', path.basename(IMAGE_PATH));

  console.log('\n📤 Step 2: Uploading image to IPFS...');
  const imageCID = await client.storeBlob(imageFile);
  const imageURL = `https://nftstorage.link/ipfs/${imageCID}`;
  console.log('✅ Image uploaded!');
  console.log('   IPFS URL:', imageURL);

  console.log('\n📝 Step 3: Creating metadata JSON...');
  const metadata = {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    description: TOKEN_DESCRIPTION,
    image: imageURL,
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
          uri: imageURL,
          type: "image/png"
        }
      ]
    }
  };

  console.log('✅ Metadata created');

  console.log('\n📤 Step 4: Uploading metadata to IPFS...');
  const metadataFile = new File(
    [JSON.stringify(metadata, null, 2)],
    'metadata.json',
    { type: 'application/json' }
  );
  
  const metadataCID = await client.storeBlob(metadataFile);
  const metadataURL = `https://nftstorage.link/ipfs/${metadataCID}`;
  console.log('✅ Metadata uploaded!');
  console.log('   IPFS URL:', metadataURL);

  // Save info
  const uploadInfo = {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    description: TOKEN_DESCRIPTION,
    imageCID: imageCID,
    imageURL: imageURL,
    metadataCID: metadataCID,
    metadataURL: metadataURL,
    uploadedAt: new Date().toISOString()
  };

  fs.writeFileSync('token-metadata-upload.json', JSON.stringify(uploadInfo, null, 2));
  console.log('\n💾 Upload info saved to: token-metadata-upload.json');

  console.log('\n' + '='.repeat(60));
  console.log('🎉 SUCCESS!');
  console.log('='.repeat(60));
  console.log('✅ Image URL:', imageURL);
  console.log('✅ Metadata URL:', metadataURL);
  console.log('\n📋 Next Step:');
  console.log('   Update your token metadata with this URI:');
  console.log('   ', metadataURL);
  console.log('\n✨ Done!');
}

// Run the script
uploadTokenMetadata().catch(console.error);
