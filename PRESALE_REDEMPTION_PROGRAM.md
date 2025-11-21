# Presale Redemption Tracker Program

## Purpose
Track which presale pass holders have redeemed their free mint to prevent double-redemption.

## How it works

### PDA Structure
```
Seeds: ["presale_redemption", presale_pass_mint, user_wallet]
```

### Data
```rust
pub struct PresaleRedemption {
    pub user: Pubkey,           // User wallet
    pub pass_mint: Pubkey,      // Presale pass mint
    pub redeemed_at: i64,       // Timestamp
    pub nft_mint: Pubkey,       // NFT they minted
}
```

### Instructions

1. **mark_redeemed**
   - Creates PDA for user
   - Verifies they hold presale pass
   - Marks as redeemed
   - Can only be called once per user

2. **check_redemption**
   - View function to check if user has redeemed

## Alternative: Database Tracking

If you don't want to deploy a program, you can track redemptions in a database:

### Database Schema
```sql
CREATE TABLE presale_redemptions (
  wallet_address VARCHAR(44) PRIMARY KEY,
  pass_token_account VARCHAR(44) NOT NULL,
  redeemed_at TIMESTAMP DEFAULT NOW(),
  nft_mint VARCHAR(44),
  tx_signature VARCHAR(88)
);

CREATE INDEX idx_redeemed_at ON presale_redemptions(redeemed_at);
```

### API Endpoint
```typescript
// POST /api/check-presale-eligibility
{
  wallet: string;
}

// Response
{
  eligible: boolean;
  hasPass: boolean;
  hasRedeemed: boolean;
  passBalance: number;
}
```

## Recommended Approach

**Use database tracking** because:
1. ✅ No program deployment needed
2. ✅ Easier to manage
3. ✅ Can add admin controls
4. ✅ Can reset if needed
5. ✅ Cheaper (no on-chain storage)

**Security:**
- Verify pass ownership on-chain before marking redeemed
- Sign redemption with wallet to prove ownership
- Rate limit API to prevent spam
- Log all attempts for monitoring

## Implementation Steps

1. Set up database table
2. Create API endpoint to check eligibility
3. Frontend checks eligibility before allowing mint
4. After successful mint, mark as redeemed in database
5. You control mint phases via environment variable

## Mint Phase Control

```env
# .env.local
NEXT_PUBLIC_MINT_PHASE=CLOSED  # CLOSED, PRESALE, or PUBLIC
NEXT_PUBLIC_PUBLIC_MINT_PRICE=0.5  # SOL
```

You can change these anytime to:
- Open presale (only pass holders, free)
- Close presale
- Open public mint (everyone, 0.5 SOL, pass holders still free)
- Close everything
