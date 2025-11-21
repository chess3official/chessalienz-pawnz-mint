# 🎨 Adding Metadata to PAWNZ PASS Token

This guide will help you add the name, symbol, and image to your token so it displays correctly in wallets.

## 📋 What You Need

- ✅ Token Mint Address: `31bLEgYfLvrQ4e9nXvKMckUG6KQ3r5yhMwBHaJqrRhDm`
- ✅ Image: `C:\Users\kkbad\OneDrive\Pictures\pawnzpass.png`
- ✅ Wallet with ~0.02 SOL for transaction fees

---

## 🚀 Quick Method: Use Pinata + Script

### Step 1: Upload Image to Pinata

1. **Go to** https://pinata.cloud
2. **Sign up** for free account
3. **Click "Upload"** → Select `pawnzpass.png`
4. **Copy the IPFS URL** (looks like: `https://gateway.pinata.cloud/ipfs/Qm...`)

### Step 2: Create Metadata JSON

Create a file called `pawnz-pass-metadata.json`:

```json
{
  "name": "PAWNZ PASS",
  "symbol": "PWZP",
  "description": "Presale pass for Chessalienz: Pawnz NFT Collection. Holders can redeem 1 free NFT during presale.",
  "image": "YOUR_IMAGE_URL_FROM_STEP_1",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Presale Pass"
    },
    {
      "trait_type": "Collection",
      "value": "Chessalienz: Pawnz"
    },
    {
      "trait_type": "Redeemable",
      "value": "Yes"
    },
    {
      "trait_type": "Price",
      "value": "2 SOL"
    }
  ],
  "properties": {
    "category": "image",
    "files": [
      {
        "uri": "YOUR_IMAGE_URL_FROM_STEP_1",
        "type": "image/png"
      }
    ]
  }
}
```

**Replace** `YOUR_IMAGE_URL_FROM_STEP_1` with the IPFS URL from Step 1.

### Step 3: Upload Metadata JSON to Pinata

1. **Go back to Pinata**
2. **Click "Upload"** → Select `pawnz-pass-metadata.json`
3. **Copy the IPFS URL** for the JSON file

### Step 4: Update Script

Open `add-token-metadata.mjs` and update line 12:

```javascript
const TOKEN_URI = "YOUR_METADATA_JSON_URL_FROM_STEP_3";
```

### Step 5: Run Script

```bash
node add-token-metadata.mjs
```

This will:
- ✅ Add metadata to your token
- ✅ Cost ~0.01-0.02 SOL
- ✅ Take 1-2 minutes

### Step 6: Wait for Propagation

- Wait 5-10 minutes for metadata to propagate
- Refresh your wallet
- Token should now show "PAWNZ PASS" with image!

---

## 🎯 Alternative: Use Solana CLI

If you have Solana CLI installed:

```bash
spl-token create-metadata 31bLEgYfLvrQ4e9nXvKMckUG6KQ3r5yhMwBHaJqrRhDm \
  "PAWNZ PASS" \
  "PWZP" \
  "https://your-metadata-url.com/metadata.json"
```

---

## 📊 Verify Metadata

After adding metadata, check:

1. **Solscan:** https://solscan.io/token/31bLEgYfLvrQ4e9nXvKMckUG6KQ3r5yhMwBHaJqrRhDm
2. **Your Phantom Wallet** - Should show name and image
3. **Mint Page** - Token should display correctly

---

## 🆘 Troubleshooting

### "Metadata account already exists"
- Metadata was already added
- You can update it instead using `updateMetadataAccountV2`

### Image not showing
- Wait 10-15 minutes for IPFS propagation
- Try different IPFS gateway
- Verify image URL is accessible

### Transaction failed
- Check you have enough SOL (need ~0.02)
- Verify you're the mint authority
- Check wallet.json is correct

---

## 📝 What Metadata Does

With metadata, your token will:
- ✅ Show "PAWNZ PASS" instead of address
- ✅ Display your custom image
- ✅ Show symbol "PWZP"
- ✅ Look professional in all wallets
- ✅ Be discoverable on explorers

---

## 🔗 Useful Links

- **Pinata:** https://pinata.cloud
- **Web3.Storage:** https://web3.storage
- **NFT.Storage:** https://nft.storage
- **Metaplex Docs:** https://docs.metaplex.com
- **Token on Solscan:** https://solscan.io/token/31bLEgYfLvrQ4e9nXvKMckUG6KQ3r5yhMwBHaJqrRhDm

---

✨ **Once metadata is added, your PAWNZ PASS tokens will look professional in all wallets!**
