# Presale Pass Tokens Guide (SPL Tokens)

## 💰 Cost: **~0.01-0.02 SOL** (99% cheaper than NFTs!)

### Cost Breakdown:
- **Create Token Mint:** ~0.001 SOL (one-time)
- **Mint 1,000 tokens:** ~0.00001 SOL
- **Per distribution:** ~0.00001 SOL per recipient
- **Total for 1,000 passes:** **~0.01-0.02 SOL** ✅

**Savings vs NFTs:** ~15-20 SOL saved! 🎉

---

## 🎯 What Are SPL Tokens?

SPL Tokens are fungible tokens on Solana (like ERC-20 on Ethereum):
- ✅ **Much cheaper** than NFTs
- ✅ **Faster** to create and distribute
- ✅ **Same functionality** - holders can mint FREE NFTs
- ✅ **Tradeable** on DEXs if you want
- ✅ **No image needed** (just a token)

---

## 🚀 Step-by-Step Instructions

### Step 1: Create the Token Mint

This creates the "Presale Pass" token type and mints 1,000 tokens to your wallet.

```bash
cd C:\Users\kkbad\CascadeProjects\pawnz-mint

# Make sure you have wallet.json in the folder
# Run the creation script
node create-presale-pass-tokens.mjs
```

**What happens:**
1. Creates a new SPL Token mint
2. Mints 1,000 tokens to your wallet
3. Saves mint address to `presale-pass-mint-info.json`

**Output:**
```
🎫 Creating Presale Pass Tokens...

👛 Wallet: YourWalletAddress...
💰 Balance: 1.0000 SOL

📝 Step 1: Creating Token Mint...
✅ Token Mint Created: TokenMintAddress...
   Save this address - you'll need it for the mint page!

💾 Mint info saved to: presale-pass-mint-info.json

📝 Step 2: Creating token account for your wallet...
✅ Token Account Created: TokenAccountAddress...

🎫 Step 3: Minting 1,000 presale pass tokens...
✅ Minted 1,000 tokens!

🎉 SUCCESS!
✅ Token Mint Address: TokenMintAddress...
✅ Total Supply: 1,000 tokens
✅ Your Token Balance: 1,000 tokens
💰 Final SOL balance: 0.9990 SOL
💸 Total spent: 0.0010 SOL

✨ Done!
```

---

### Step 2: Update Your Mint Page

Update `.env.local` with the new token mint address:

```env
# Replace the old presale pass mint address with the new one
NEXT_PUBLIC_PRESALE_PASS_MINT=<NEW_TOKEN_MINT_ADDRESS>
```

The token mint address is in `presale-pass-mint-info.json`.

**Redeploy to Vercel:**
- Update environment variable in Vercel dashboard
- Or push changes to GitHub (Vercel auto-deploys)

---

### Step 3: Distribute Tokens to Users

#### Option A: Manual Distribution (Phantom Wallet)

1. Open Phantom wallet
2. Go to "Send"
3. Select the presale pass token
4. Enter recipient address
5. Enter amount (1 token = 1 pass)
6. Send!

#### Option B: Bulk Distribution (Script)

1. **Create recipients list:**
   ```bash
   node distribute-presale-tokens.mjs
   ```
   This creates `recipients.json` template.

2. **Edit `recipients.json`:**
   ```json
   [
     { "address": "Wallet1Address...", "amount": 1 },
     { "address": "Wallet2Address...", "amount": 2 },
     { "address": "Wallet3Address...", "amount": 1 }
   ]
   ```

3. **Run distribution:**
   ```bash
   node distribute-presale-tokens.mjs
   ```

**Output:**
```
📤 Distributing Presale Pass Tokens...

👛 Your Wallet: YourAddress...
🎫 Token Mint: TokenMintAddress...
💰 SOL Balance: 0.9990 SOL
🎫 Your Token Balance: 1000 tokens

📋 Found 3 recipients
📊 Total to distribute: 4 tokens

🚀 Starting distribution...

📤 [1/3] Sending 1 token(s) to Wallet1...
   ✅ Sent! Tx: signature...

📤 [2/3] Sending 2 token(s) to Wallet2...
   ✅ Sent! Tx: signature...

📤 [3/3] Sending 1 token(s) to Wallet3...
   ✅ Sent! Tx: signature...

🎉 DISTRIBUTION COMPLETE!
✅ Successfully sent: 3/3
💸 Total spent: 0.0003 SOL

✨ Done!
```

---

## 🎫 How It Works

### For You (Admin):
1. Create token mint (1,000 tokens)
2. Distribute tokens to early supporters
3. Track distribution on mint page

### For Users:
1. Receive presale pass token in wallet
2. Connect wallet to mint page
3. Mint FREE NFT (one per token held)
4. Token is marked as "redeemed" (but not burned)
5. Can keep token as collectible

---

## 📊 Token vs NFT Comparison

| Feature | NFT Passes | Token Passes |
|---------|-----------|--------------|
| Cost to create 1,000 | ~15-20 SOL | ~0.01 SOL |
| Time to create | 15-30 min | ~10 seconds |
| Distribution cost | ~0.01 SOL each | ~0.00001 SOL each |
| Has image | ✅ Yes | ❌ No (just token) |
| Tradeable | ✅ Yes | ✅ Yes |
| Works with mint page | ✅ Yes | ✅ Yes |
| Can be collectible | ✅ Yes | ✅ Yes |

---

## 🔧 Advanced: Add Token Metadata (Optional)

If you want your token to have a name/image in wallets:

```bash
# Install Metaplex Token Metadata
npm install @metaplex-foundation/mpl-token-metadata

# Create metadata for your token
# (Script coming soon)
```

This adds:
- Token name: "Chessalienz: Pawnz - Presale Pass"
- Token symbol: "PAWNZPASS"
- Token image: Your pass image
- Token description

**Cost:** +0.001 SOL per token

---

## ⚠️ Important Notes

### Security:
- 🔒 Keep `wallet.json` secure
- 🔒 Delete after use
- 🔒 Token mint authority = you (can mint more if needed)

### Freeze Authority:
- You have freeze authority (can freeze tokens if needed)
- Useful to prevent trading before launch
- Can be removed later if desired

### Supply:
- Fixed at 1,000 tokens
- Can mint more if you want (you're the authority)
- Or can revoke mint authority to lock supply

---

## 🎯 After Distribution

### Monitor Progress:
Your mint page automatically shows:
- **Presale Passes:** X / 1,000
- Updates every 30 seconds
- Shows when sold out

### Verify Distribution:
Check Solana Explorer:
```
https://explorer.solana.com/address/TOKEN_MINT_ADDRESS/holders
```

Shows all wallets holding tokens.

---

## 💡 Tips

### Batch Distribution:
- Send 10-50 at a time
- Script pauses to avoid rate limits
- Very cheap (~0.0001 SOL per 10 transfers)

### Airdrop Tools:
Consider using:
- **Streamflow** - Token distribution platform
- **Grape** - Discord token gating
- **Gumdrop** - Metaplex airdrop tool

### Marketing:
- Tokens are tradeable on Jupiter/Raydium
- Can create liquidity pool if desired
- Holders can verify on-chain

---

## 🆘 Troubleshooting

### "Wallet file not found"
```bash
set WALLET_PATH=C:\path\to\wallet.json
node create-presale-pass-tokens.mjs
```

### "Insufficient balance"
- Need at least 0.1 SOL
- Actual cost is ~0.01 SOL
- Extra is for safety buffer

### "Invalid recipient address"
- Check address format in `recipients.json`
- Must be valid Solana addresses
- No spaces or special characters

---

## ✅ Checklist

Before creating:
- [ ] Have 0.1 SOL in wallet
- [ ] `wallet.json` file ready
- [ ] Decided on total supply (1,000)

After creating:
- [ ] Save token mint address
- [ ] Update mint page `.env.local`
- [ ] Redeploy to Vercel
- [ ] Test with your wallet

Before distributing:
- [ ] Create `recipients.json`
- [ ] Verify all addresses
- [ ] Have ~0.01 SOL for distribution

After distributing:
- [ ] Verify tokens received
- [ ] Test mint page
- [ ] Delete `wallet.json`

---

## 🎉 Summary

**SPL Tokens are the way to go!**

- ✅ **99% cheaper** than NFTs
- ✅ **Instant** creation
- ✅ **Easy** distribution
- ✅ **Same** functionality
- ✅ **Professional** solution

Total cost: **~0.01-0.02 SOL** for everything! 🚀
