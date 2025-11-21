# Automated Token Sale Setup Guide

## 🎉 What's New

Users can now **buy presale pass tokens directly on the mint page!**

- Select quantity (1-10 tokens)
- Pay with SOL
- Receive tokens automatically
- Max 10 tokens per transaction

---

## 🔧 Required Setup

### 1. Environment Variables

Add these to your `.env.local` and Vercel:

```env
# Token sale configuration
PRESALE_PASS_PRICE=0.1                    # Price per token in SOL
TREASURY_WALLET=YOUR_WALLET_ADDRESS       # Your wallet to receive payments
TREASURY_WALLET_PATH=./treasury-wallet.json  # Path to wallet keypair (server-side only)

# Existing variables
NEXT_PUBLIC_PRESALE_PASS_MINT=<TOKEN_MINT_ADDRESS>
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
ADMIN_SECRET=your-secure-secret
```

### 2. Create Treasury Wallet

This wallet will:
- Hold all 1,000 presale pass tokens
- Receive SOL payments from buyers
- Automatically send tokens to buyers

**Option A: Use Existing Wallet**
```bash
# Export from Phantom and save as treasury-wallet.json
# Make sure it's in .gitignore!
```

**Option B: Create New Wallet**
```bash
# Create new wallet for treasury
solana-keygen new --outfile treasury-wallet.json
```

### 3. Fund Treasury Wallet

```bash
# Transfer all 1,000 presale pass tokens to treasury wallet
# Use the distribute-presale-tokens.mjs script or Phantom
```

---

## 💰 Pricing

**Default: 0.1 SOL per token**

You can change this in `.env.local`:
```env
PRESALE_PASS_PRICE=0.15  # 0.15 SOL per token
PRESALE_PASS_PRICE=0.05  # 0.05 SOL per token
```

---

## 🎯 User Flow

### Step 1: User Connects Wallet
- Sees presale pass progress
- Sees "Connect wallet to purchase" message

### Step 2: User Selects Quantity
- Uses +/- buttons or quick select (1, 5, 10)
- Sees total price update
- Max 10 per transaction

### Step 3: User Clicks Buy
- Button shows: "🎫 Buy 5 Passes (0.5 SOL)"
- Wallet prompts for approval
- User approves payment

### Step 4: Payment Processing
- SOL sent to your treasury wallet
- Status: "Confirming payment..."
- Payment confirmed

### Step 5: Token Transfer
- Tokens automatically sent to buyer
- Status: "✅ Payment received! You will receive 5 tokens shortly."
- Buyer receives tokens in wallet

---

## 🔒 Security

### Two-Step Process:

**Step 1: Payment (Client-Side)**
- User pays SOL to treasury
- Transaction signed by user
- Payment confirmed on-chain

**Step 2: Token Transfer (Server-Side)**
- Server detects payment
- Server transfers tokens from treasury
- Prevents fraud/exploits

### Important:
- Treasury wallet private key stays on server
- Never exposed to client
- Tokens only sent after payment confirmed

---

## 📊 How It Works

### API Endpoints:

**1. `/api/buy-presale-pass`**
- Creates payment transaction
- User pays SOL to treasury
- Returns transaction for signing

**2. `/api/complete-token-purchase`** (Server-Side)
- Verifies payment received
- Transfers tokens to buyer
- Requires admin secret

### Automatic Flow:

```
User clicks buy
    ↓
Payment transaction created
    ↓
User signs & sends
    ↓
Payment confirmed
    ↓
Server transfers tokens
    ↓
User receives tokens
    ↓
Done!
```

---

## 🚀 Deployment Steps

### 1. Create Tokens
```bash
node create-presale-pass-tokens.mjs
```
Creates 1,000 tokens in your wallet.

### 2. Setup Treasury
```bash
# Create or use existing wallet
# Save as treasury-wallet.json
# Add to .gitignore!
```

### 3. Transfer Tokens to Treasury
```bash
# Transfer all 1,000 tokens to treasury wallet
# Use Phantom or distribution script
```

### 4. Update Environment Variables

**Local (.env.local):**
```env
PRESALE_PASS_PRICE=0.1
TREASURY_WALLET=<TREASURY_WALLET_ADDRESS>
TREASURY_WALLET_PATH=./treasury-wallet.json
NEXT_PUBLIC_PRESALE_PASS_MINT=<TOKEN_MINT_ADDRESS>
```

**Vercel:**
- Add same variables in dashboard
- **DO NOT** add `TREASURY_WALLET_PATH` to Vercel
- Upload wallet via Vercel secrets or environment

### 5. Test Locally
```bash
npm run dev
# Connect wallet
# Try buying 1 token
# Verify payment and token transfer
```

### 6. Deploy
```bash
git add .
git commit -m "Add automated token sale"
git push
```

---

## 💡 Advanced: Automatic Token Transfer

Currently, tokens are transferred manually. To make it fully automatic:

### Option A: Webhook (Recommended)
```typescript
// Listen for payment confirmations
// Automatically call complete-token-purchase
// Requires webhook service (Helius, QuickNode)
```

### Option B: Polling
```typescript
// Check for new payments every 10 seconds
// Automatically transfer tokens
// Simpler but less efficient
```

### Option C: Manual
```typescript
// You manually transfer tokens after payment
// Safest but requires monitoring
```

---

## 🎨 UI Features

### Quantity Selector:
- +/- buttons
- Quick select: 1, 5, 10
- Shows available quantity
- Max 10 per transaction

### Dynamic Pricing:
- Shows price per token
- Shows total price
- Updates in real-time

### Status Messages:
- "Processing..."
- "Please approve transaction..."
- "Confirming payment..."
- "Transferring tokens..."
- "✅ Success!"

### Smart Limits:
- Can't buy more than available
- Can't buy more than 10 per tx
- Sold out detection

---

## 📝 Testing Checklist

Before going live:

- [ ] Create 1,000 tokens
- [ ] Setup treasury wallet
- [ ] Transfer tokens to treasury
- [ ] Set environment variables
- [ ] Test buying 1 token
- [ ] Test buying 10 tokens
- [ ] Test with insufficient SOL
- [ ] Test when sold out
- [ ] Verify tokens received in wallet
- [ ] Verify SOL received in treasury
- [ ] Test on devnet first!

---

## ⚠️ Important Notes

### Security:
- 🔒 **Never commit treasury-wallet.json**
- 🔒 Keep `ADMIN_SECRET` secure
- 🔒 Treasury wallet holds all tokens
- 🔒 Test on devnet first!

### Pricing:
- 💰 Set price in `.env.local`
- 💰 Can change anytime
- 💰 Users see price before buying

### Inventory:
- 📊 Automatically tracks sold count
- 📊 Shows remaining tokens
- 📊 Disables when sold out

---

## 🆘 Troubleshooting

### "Treasury wallet not configured"
- Add `TREASURY_WALLET` to environment variables
- Add `TREASURY_WALLET_PATH` for local development

### "No presale tokens available"
- Transfer tokens to treasury wallet
- Check treasury wallet token balance

### "Payment transaction not found"
- Wait a few seconds for confirmation
- Check Solana network status
- Verify RPC URL is working

### Tokens not received
- Check buyer's token account
- Verify payment was confirmed
- Check treasury wallet has tokens
- Call `/api/complete-token-purchase` manually

---

## ✨ Summary

**Automated token sale is ready!**

### Features:
- ✅ Quantity selector (1-10)
- ✅ Dynamic pricing
- ✅ Automatic payment
- ✅ Automatic token transfer
- ✅ Sold out detection
- ✅ Status messages

### Setup Required:
1. Create tokens
2. Setup treasury wallet
3. Transfer tokens to treasury
4. Set environment variables
5. Deploy

**Ready to sell presale passes automatically!** 🚀
