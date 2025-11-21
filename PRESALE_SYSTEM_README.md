# Presale Redemption System

## Overview

This system allows you to control presale and public mint phases with automatic eligibility checking and redemption tracking.

## Features

✅ **Phase Control** - Switch between CLOSED, PRESALE, and PUBLIC
✅ **Presale Pass Holders** - Get FREE mints (one per pass token held)
✅ **Multiple Redemptions** - Hold 2 passes = mint 2 NFTs for free
✅ **Public Mint** - Everyone can mint for 0.5 SOL
✅ **Redemption Tracking** - Tracks redemptions per pass, not per wallet
✅ **No Burning** - Passes remain as collectibles
✅ **Direct Minting** - No Candy Machine complications

## How It Works

### Mint Phases

1. **CLOSED** - Nobody can mint
2. **PRESALE** - Only presale pass holders can mint (FREE)
3. **PUBLIC** - Everyone can mint (0.5 SOL), pass holders still FREE if not redeemed

### Eligibility Rules

| Phase | Has Pass | Redeemed | Price | Can Mint? |
|-------|----------|----------|-------|-----------|
| CLOSED | Any | Any | - | ❌ No |
| PRESALE | ✅ Yes | ❌ No | FREE | ✅ Yes |
| PRESALE | ✅ Yes | ✅ Yes | - | ❌ No |
| PRESALE | ❌ No | - | - | ❌ No |
| PUBLIC | ✅ Yes | ❌ No | FREE | ✅ Yes |
| PUBLIC | ✅ Yes | ✅ Yes | 0.5 SOL | ✅ Yes |
| PUBLIC | ❌ No | - | 0.5 SOL | ✅ Yes |

## Controlling Mint Phases

### Option 1: Environment Variable (Recommended for testing)

Edit `.env.local`:

```env
# Open presale
NEXT_PUBLIC_MINT_PHASE=PRESALE

# Open public mint
NEXT_PUBLIC_MINT_PHASE=PUBLIC

# Close everything
NEXT_PUBLIC_MINT_PHASE=CLOSED
```

Then restart your dev server.

### Option 2: Database (Recommended for production)

Store the current phase in your database and query it in the API endpoint.

```sql
UPDATE mint_config SET value = 'PRESALE' WHERE key = 'current_phase';
UPDATE mint_config SET value = 'PUBLIC' WHERE key = 'current_phase';
UPDATE mint_config SET value = 'CLOSED' WHERE key = 'current_phase';
```

### Option 3: Admin Dashboard

Create an admin page where you can click a button to change phases.

## API Endpoints

### POST /api/check-eligibility

Check if a wallet is eligible to mint.

**Request:**
```json
{
  "wallet": "D2nUJVgRMHgeAH8Zw3gCMjhgRZin9xmjSuStSZjtqkC2"
}
```

**Response:**
```json
{
  "eligible": true,
  "hasPass": true,
  "hasRedeemed": false,
  "passBalance": 1,
  "price": 0,
  "mintPhase": "PRESALE"
}
```

### POST /api/mark-redeemed

Mark a wallet as having redeemed their presale pass.

**Request:**
```json
{
  "wallet": "D2nUJVgRMHgeAH8Zw3gCMjhgRZin9xmjSuStSZjtqkC2",
  "passTokenAccount": "...",
  "passBalance": 1,
  "nftMint": "...",
  "txSignature": "...",
  "metadataUri": "..."
}
```

## Testing

### Test Presale Phase

1. Set `NEXT_PUBLIC_MINT_PHASE=PRESALE` in `.env.local`
2. Restart dev server
3. Connect wallet with presale pass
4. Should see "FREE" mint button
5. Mint NFT
6. Try to mint again - should be blocked (already redeemed)

### Test Public Phase

1. Set `NEXT_PUBLIC_MINT_PHASE=PUBLIC` in `.env.local`
2. Restart dev server
3. Connect wallet WITHOUT presale pass
4. Should see "0.5 SOL" mint button
5. Connect wallet WITH unredeemed pass
6. Should see "FREE" mint button

### Test Closed Phase

1. Set `NEXT_PUBLIC_MINT_PHASE=CLOSED` in `.env.local`
2. Restart dev server
3. Connect any wallet
4. Should see "Minting is currently closed" message

## Production Deployment

### 1. Set up Database

Use PostgreSQL, Supabase, or Vercel Postgres:

```sql
-- Run the schema from db/schema.sql
```

### 2. Update db.ts

Replace the in-memory storage with real database queries.

### 3. Set Environment Variables

In your production environment (Vercel, etc.):

```env
NEXT_PUBLIC_MINT_PHASE=CLOSED  # Start closed
NEXT_PUBLIC_PUBLIC_MINT_PRICE=0.5
DATABASE_URL=postgresql://...
```

### 4. Create Admin Dashboard

Build a simple admin page to:
- View mint statistics
- Change mint phase
- View redemptions
- Manage collection

## Security

✅ **On-chain verification** - Pass ownership checked on-chain
✅ **Redemption tracking** - Prevents double-redemption
✅ **No burning required** - Passes remain valuable
✅ **Rate limiting** - Add to API endpoints
✅ **Logging** - All mints and redemptions logged

## Support

For issues or questions, check:
- API logs in console
- Database redemption records
- On-chain transaction signatures

## Next Steps

1. ✅ Test presale phase
2. ✅ Test public phase
3. ⏳ Set up production database
4. ⏳ Deploy to mainnet
5. ⏳ Open presale!
