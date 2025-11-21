# Security Considerations for Presale Pass System

## Transfer Exploit Prevention

### The Problem
If we only track redemptions by wallet address, users could:
1. Buy 2 passes
2. Mint 2 NFTs for free
3. Transfer passes to another wallet
4. New wallet mints 2 more NFTs for free
5. Repeat infinitely

### Current Solution (Partial)
We track redemptions per wallet AND check current pass balance:
- Wallet A has 2 passes, redeems 2 → count = 2, balance = 2 ✅
- Wallet A transfers 2 passes to Wallet B → A has count = 2, balance = 0 ❌ Can't mint
- Wallet B has 2 passes, count = 0 → B can mint 2 ✅

**Issue:** Wallet B can still mint even though those passes were already used by Wallet A!

### Better Solutions

#### Option 1: Burn Passes on Redemption (Recommended)
When a user mints with a pass, **burn 1 pass token**.

**Pros:**
- ✅ Completely prevents transfer exploit
- ✅ Simple to implement
- ✅ Clear to users (pass is consumed)
- ✅ Passes become truly limited

**Cons:**
- ❌ Users lose their pass tokens (can't keep as collectibles)
- ❌ Need to implement burn instruction

**Implementation:**
```typescript
// In mintWithPassBurn function:
1. Check pass balance
2. Mint NFT
3. Burn 1 pass token
4. Mark redemption in database
```

#### Option 2: Global Pass Token Tracking (Complex)
Track each individual pass token by its account address.

**Pros:**
- ✅ Prevents transfer exploit
- ✅ Users keep passes as collectibles

**Cons:**
- ❌ Complex to implement (need to track all pass token accounts)
- ❌ Requires indexing all pass holders
- ❌ Higher database/API costs

**Implementation:**
```typescript
// Track redemptions by pass token account address
const passTokenRedemptions = new Map<string, boolean>();

// When minting:
1. Get user's pass token account address
2. Check if that specific account has been used
3. If not used, allow mint and mark account as used
4. If used, deny even if transferred to new wallet
```

#### Option 3: Snapshot at Presale Start (Simplest)
Take a snapshot of all pass holders at presale start time.

**Pros:**
- ✅ Simple to implement
- ✅ Prevents transfer exploit
- ✅ Users keep passes

**Cons:**
- ❌ Passes bought after snapshot can't be used
- ❌ Need to maintain snapshot list
- ❌ Not flexible for ongoing presale

### Recommended Approach

**For your use case (presale with 2 passes max per user):**

Use **Option 1: Burn on Redemption**

**Why:**
1. You want to limit presale to specific number of mints
2. Burning makes it clear passes are consumed
3. Prevents all transfer exploits
4. Simple and secure

**Alternative if you want passes as collectibles:**
Use **Option 2** but implement it properly:
- When user mints, record their pass token account address
- Check that specific account hasn't been used before
- This way even if transferred, that account is marked as "used"

### Current Implementation Status

✅ Tracks redemptions per wallet
✅ Checks current pass balance
⚠️ **Vulnerable to transfer exploit** (receiver can still mint)

### Next Steps

Choose one:
1. Implement burn mechanism (recommended)
2. Implement global pass token account tracking
3. Accept the risk (if passes are non-transferable or you trust users)

## Code Changes Needed for Burn Implementation

1. Import burn function from `@solana/spl-token`
2. Add burn instruction after successful mint
3. Update UI to show "Pass will be burned on mint"
4. Test thoroughly on devnet first

Would you like me to implement the burn mechanism?
