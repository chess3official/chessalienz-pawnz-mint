# 🎫 PAWNZ PASS Token Setup Guide

Complete guide to creating and selling PAWNZ PASS tokens for your NFT presale.

## 📋 Token Details

- **Name:** PAWNZ PASS
- **Symbol:** $PWZP
- **Supply:** 1,000 tokens
- **Price:** 2 SOL per token
- **Image:** pawnzpass.png
- **Purpose:** Each token allows holder to mint 1 free NFT during presale

## 🎯 NFT Collection Details

- **Total Supply:** 5,000 NFTs
- **Presale (Free with pass):** 1,000 NFTs
- **Public Mint (3 SOL each):** 4,000 NFTs

## 🚀 Setup Steps

### Step 1: Install Dependencies

```bash
npm install @metaplex-foundation/mpl-token-metadata nft.storage
```

### Step 2: Get NFT.Storage API Key

1. Go to https://nft.storage
2. Sign up for free account
3. Create API key
4. Save it for later

### Step 3: Upload Token Metadata

```bash
# Set your NFT.Storage API key
export NFT_STORAGE_API_KEY=your_api_key_here

# Run upload script
node upload-token-metadata.mjs
```

This will:
- Upload pawnzpass.png to IPFS
- Create metadata JSON with token details
- Upload metadata to IPFS
- Give you a metadata URI

### Step 4: Create PAWNZ PASS Token

```bash
# Make sure your wallet.json is in the project root
# Or set WALLET_PATH environment variable

node create-pawnz-pass-token.mjs
```

This will:
- Create the SPL token mint
- Add metadata (name, symbol, image)
- Mint 1,000 tokens to your wallet
- Save mint address to `pawnz-pass-mint-info.json`

### Step 5: Update Token Metadata URI

After creating the token, you need to update its metadata URI with the one from Step 3.

You can use Metaplex's Sugar CLI or a custom script to update the URI.

### Step 6: Configure Environment Variables

Update `.env.local`:

```env
# Presale Pass Token
NEXT_PUBLIC_PRESALE_PASS_MINT=<your_token_mint_address>
PRESALE_PASS_PRICE=2

# Public Mint Price
NEXT_PUBLIC_PUBLIC_MINT_PRICE=3

# Treasury Wallet (receives payments)
TREASURY_WALLET=<your_wallet_address>

# Mint Phase (keep CLOSED until ready)
NEXT_PUBLIC_MINT_PHASE=CLOSED
```

### Step 7: Deploy to Vercel

```bash
git add .
git commit -m "Add PAWNZ PASS token configuration"
git push
```

Make sure to add these environment variables in Vercel dashboard:
- `TREASURY_WALLET`
- `PRESALE_PASS_PRICE`
- `NEXT_PUBLIC_PRESALE_PASS_MINT`
- `NEXT_PUBLIC_PUBLIC_MINT_PRICE`

## 💰 Selling PAWNZ PASS Tokens

### Option 1: Automated Sale (On Mint Page)

Users can buy tokens directly on your mint page:
1. Connect wallet
2. Select quantity (1-10)
3. Pay 2 SOL per token
4. Receive tokens instantly

**Requirements:**
- Set `TREASURY_WALLET` in Vercel
- Keep tokens in treasury wallet's associated token account
- System automatically transfers tokens after payment

### Option 2: Manual Distribution

Distribute tokens manually to presale participants:

```bash
# Use the distribute script
node distribute-presale-tokens.mjs
```

## 🎮 How It Works

### Phase 1: Token Sale (CLOSED)
- Mint page shows token purchase UI
- Users buy PAWNZ PASS tokens for 2 SOL each
- Tokens go to their wallet
- NFT minting is disabled

### Phase 2: Presale (PRESALE)
- Change `NEXT_PUBLIC_MINT_PHASE=PRESALE`
- Token holders can mint FREE NFTs
- 1 token = 1 free NFT
- Max 1,000 NFTs can be minted
- Non-holders cannot mint

### Phase 3: Public Mint (PUBLIC)
- Change `NEXT_PUBLIC_MINT_PHASE=PUBLIC`
- Anyone can mint for 3 SOL
- Token holders still get FREE mints (if not redeemed)
- Max 4,000 NFTs available for public
- Total: 5,000 NFTs (1,000 presale + 4,000 public)

## 📊 Supply Tracking

The system tracks:
- **Presale passes sold:** Out of 1,000
- **Presale NFTs minted:** Out of 1,000 (free with pass)
- **Public NFTs minted:** Out of 4,000 (3 SOL each)
- **Total NFTs minted:** Out of 5,000

## ⚙️ Configuration Files

### `.env.local` (Local Development)
```env
NEXT_PUBLIC_MINT_PHASE=CLOSED
NEXT_PUBLIC_PUBLIC_MINT_PRICE=3
PRESALE_PASS_PRICE=2
NEXT_PUBLIC_PRESALE_PASS_MINT=<token_mint_address>
TREASURY_WALLET=<your_wallet>
```

### Vercel Environment Variables
Add these in Vercel dashboard → Settings → Environment Variables:
- `TREASURY_WALLET` (your wallet address)
- `PRESALE_PASS_PRICE` (2)
- `NEXT_PUBLIC_PRESALE_PASS_MINT` (token mint address)
- `NEXT_PUBLIC_PUBLIC_MINT_PRICE` (3)
- `NEXT_PUBLIC_RPC_URL` (your Helius/QuickNode RPC)

## 🔒 Security Notes

1. **Never commit wallet.json** - Keep it secure
2. **Use environment variables** - Don't hardcode keys
3. **Test on devnet first** - Before mainnet deployment
4. **Keep treasury wallet secure** - It holds all tokens and receives payments
5. **Monitor transactions** - Watch for any issues

## 📝 Testing Checklist

Before going live:

- [ ] Token created with correct metadata
- [ ] Image displays correctly
- [ ] Token purchase works (2 SOL)
- [ ] Tokens transfer to buyer
- [ ] Presale minting works (free with token)
- [ ] Public minting works (3 SOL)
- [ ] Supply limits enforced (1,000 presale, 4,000 public)
- [ ] Phase switching works
- [ ] All prices display correctly

## 🆘 Troubleshooting

### "Treasury wallet not configured"
- Add `TREASURY_WALLET` to Vercel environment variables
- Redeploy

### "No presale tokens available"
- Make sure tokens are in treasury wallet's associated token account
- Check token balance

### Token purchase fails
- Verify `PRESALE_PASS_PRICE` is set
- Check treasury wallet has token account
- Ensure tokens are available

### Metadata not showing
- Wait for IPFS propagation (can take a few minutes)
- Try different IPFS gateway
- Verify metadata URI is correct

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test on devnet first
4. Check Solana Explorer for transaction details

---

✨ **Ready to launch your PAWNZ PASS presale!**
