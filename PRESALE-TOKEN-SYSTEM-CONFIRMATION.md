# Presale Token System - Requirements Confirmation

## 📋 Your Requirements

### 1. Token Purchase Limit
- ✅ Users can buy **maximum 10 tokens per transaction**
- ✅ No overall limit (can buy multiple times)

### 2. Snapshot System
- ✅ After presale is complete, take snapshot of all token holders
- ✅ Snapshot records: wallet address + token balance
- ✅ Prevents transfer exploits

### 3. Manual Phase Control
- ✅ You manually open public mint after presale complete
- ✅ Change `NEXT_PUBLIC_MINT_PHASE` from `CLOSED` → `PRESALE` → `PUBLIC`

### 4. Redemption System
- ✅ Users can redeem **up to 10 NFTs at a time**
- ✅ Based on snapshot balance (not current balance)
- ✅ Example: User has 25 tokens in snapshot
  - Can mint 10 NFTs (transaction 1)
  - Can mint 10 NFTs (transaction 2)
  - Can mint 5 NFTs (transaction 3)
  - Total: 25 NFTs redeemed

---

## ✅ Current System Status

### What Already Works:

1. **Snapshot System** ✅
   - `presaleSnapshot.getSnapshotEntry(wallet)` gets snapshot balance
   - Redemptions tracked against snapshot, not current balance
   - Prevents transfer exploits

2. **Manual Phase Control** ✅
   - `NEXT_PUBLIC_MINT_PHASE` environment variable
   - CLOSED → PRESALE → PUBLIC flow

3. **Redemption Tracking** ✅
   - Database tracks redemptions per wallet
   - `redeemedCount` vs `snapshotBalance`

### What Needs to Be Added:

1. **Multi-Mint UI** ❌
   - Currently: 1 NFT per transaction
   - **Need:** Quantity selector (1-10 NFTs)

2. **Token Purchase Limit** ❌
   - Currently: No limit on token creation
   - **Need:** Enforce 10 token max per transaction (if selling tokens)
   - **Note:** If you're distributing tokens manually, this is already controlled by you

3. **Batch Minting Logic** ❌
   - Currently: Single mint function
   - **Need:** Loop to mint multiple NFTs in one transaction

---

## 🔧 Required Changes

### Change 1: Add Quantity Selector to Mint Page

**Location:** `components/MintPageNew.tsx`

Add:
- Number input (1-10)
- Max based on `remainingRedeems`
- Update mint button to show "Mint X NFTs"

### Change 2: Update Mint Function for Batch Minting

**Location:** `components/MintPageNew.tsx` - `handleMint()`

Update to:
- Accept quantity parameter
- Loop through quantity
- Mint multiple NFTs
- Update redemption count by quantity

### Change 3: Update Redemption API

**Location:** `app/api/mark-redeemed/route.ts`

Update to:
- Accept quantity parameter
- Increment redemption count by quantity
- Validate quantity <= remaining redeems

---

## 💡 Token Distribution Strategy

Since you're using SPL tokens, you have two options:

### Option A: Manual Distribution (Recommended)
- You create 1,000 tokens
- You manually send tokens to buyers
- You control how many each person gets
- **No purchase limit needed** (you control it)

### Option B: Automated Sale
- Create a token sale program
- Enforce 10 token max per transaction
- Requires smart contract
- More complex

**Recommendation:** Use Option A - Manual distribution gives you full control.

---

## 📊 Complete Flow

### Phase 1: Token Distribution (CLOSED)
1. Create 1,000 presale pass tokens
2. Distribute to early supporters (manually or via script)
3. Users can buy/receive up to 10 tokens per transaction
4. Mint page shows: "Minting closed until presale complete"

### Phase 2: Snapshot (After Distribution)
1. All 1,000 tokens distributed
2. Run snapshot script: `node take-presale-snapshot.mjs`
3. Snapshot records all holders and balances
4. Upload snapshot to production

### Phase 3: Presale Mint (PRESALE)
1. Change `NEXT_PUBLIC_MINT_PHASE=PRESALE`
2. Pass holders can mint FREE NFTs
3. Quantity selector: 1-10 NFTs per transaction
4. Max based on snapshot balance minus redeemed
5. Example: 25 tokens → can mint 10, then 10, then 5

### Phase 4: Public Mint (PUBLIC)
1. Change `NEXT_PUBLIC_MINT_PHASE=PUBLIC`
2. Pass holders with unredeemed tokens: FREE mints
3. Everyone else: 0.5 SOL per NFT
4. Quantity selector: 1-10 NFTs per transaction

---

## 🎯 Example User Journey

### User with 25 Tokens:

**Snapshot taken:**
- Wallet: `ABC123...`
- Token Balance: 25

**Presale Mint Phase:**
1. User connects wallet
2. Sees: "You can mint 25 FREE NFTs"
3. Selects quantity: 10
4. Clicks "Mint 10 NFTs"
5. Receives 10 NFTs
6. Now sees: "You can mint 15 more FREE NFTs"
7. Selects quantity: 10
8. Clicks "Mint 10 NFTs"
9. Receives 10 NFTs
10. Now sees: "You can mint 5 more FREE NFTs"
11. Selects quantity: 5
12. Clicks "Mint 5 NFTs"
13. Receives 5 NFTs
14. Done: "All passes redeemed!"

---

## ⚠️ Important Security Notes

### Snapshot Prevents Exploits:

**Without Snapshot:**
- User A has 10 tokens
- User A mints 10 NFTs
- User A transfers 10 tokens to User B
- User B mints 10 NFTs
- **Result:** 20 NFTs from 10 tokens ❌

**With Snapshot:**
- User A has 10 tokens (snapshot)
- User A mints 10 NFTs (redeemed: 10/10)
- User A transfers 10 tokens to User B
- User B has 10 tokens (current)
- User B has 0 tokens (snapshot)
- User B cannot mint ✅
- **Result:** 10 NFTs from 10 tokens ✅

---

## 🚀 Next Steps

### To Implement Multi-Mint:

1. **Update MintPageNew.tsx:**
   - Add quantity selector (1-10)
   - Update mint button text
   - Add batch minting logic

2. **Update mark-redeemed API:**
   - Accept quantity parameter
   - Validate and update count

3. **Test:**
   - Test with 1 NFT
   - Test with 10 NFTs
   - Test with remaining < 10
   - Test snapshot validation

### To Use Token System:

1. **Create tokens:**
   ```bash
   node create-presale-pass-tokens.mjs
   ```

2. **Update mint page:**
   - Update `NEXT_PUBLIC_PRESALE_PASS_MINT` with new token address

3. **Distribute tokens:**
   - Manual via Phantom
   - Or bulk via script
   - Control 10 token max yourself

4. **Take snapshot:**
   ```bash
   node take-presale-snapshot.mjs
   ```

5. **Open presale:**
   - Set `NEXT_PUBLIC_MINT_PHASE=PRESALE`

---

## ✅ Confirmation Checklist

Before proceeding:

- [ ] Confirm: Users can get max 10 tokens per transaction
- [ ] Confirm: Snapshot taken after all tokens distributed
- [ ] Confirm: Users can mint 1-10 NFTs per transaction
- [ ] Confirm: Redemptions based on snapshot, not current balance
- [ ] Confirm: Manual phase control (you change env variable)

**Do you want me to implement the multi-mint functionality (1-10 NFTs per transaction)?**
