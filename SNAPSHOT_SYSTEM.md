# Presale Snapshot System

## Overview

The snapshot system prevents the transfer exploit by recording which wallets held passes at a specific point in time. Only wallets in the snapshot can mint during presale, regardless of current pass ownership.

## How It Works

### Without Snapshot (Vulnerable)
1. User A buys 2 passes
2. User A mints 2 NFTs
3. User A transfers passes to User B
4. User B can mint 2 more NFTs ❌ (exploit!)

### With Snapshot (Secure)
1. **Take snapshot** before presale starts
2. Snapshot records: User A has 2 passes ✅
3. User A mints 2 NFTs ✅
4. User A transfers passes to User B
5. User B tries to mint → **Not in snapshot** ❌ (blocked!)

## Setup Instructions

### Step 1: Take Snapshot

Run the snapshot script to find all current pass holders:

```bash
node take-presale-snapshot.mjs
```

This creates two files:
- `presale-snapshot.json` - Full snapshot with balances
- `presale-wallets.json` - Just wallet addresses

### Step 2: Load Snapshot

You have two options:

#### Option A: Load from file (recommended)

Add to your app initialization:

```typescript
import { presaleSnapshot } from '@/lib/presaleSnapshot';
import snapshotData from './presale-snapshot.json';

// On app start
presaleSnapshot.loadFromJSON(snapshotData);
```

#### Option B: Manual entry

For testing or small lists:

```typescript
presaleSnapshot.addToSnapshot('D2nUJVgRMHgeAH8Zw3gCMjhgRZin9xmjSuStSZjtqkC2', 2);
presaleSnapshot.addToSnapshot('AnotherWallet...', 1);
```

### Step 3: Enable Snapshot Mode

In `.env.local`:

```env
NEXT_PUBLIC_USE_SNAPSHOT=true
```

### Step 4: Restart Server

```bash
npm run dev
```

## Testing

### Test Without Snapshot
```env
NEXT_PUBLIC_USE_SNAPSHOT=false
```
- Any wallet with passes can mint
- Vulnerable to transfer exploit

### Test With Snapshot
```env
NEXT_PUBLIC_USE_SNAPSHOT=true
```
- Only wallets in snapshot can mint
- Transfer exploit prevented

## Admin API

### Take Snapshot via API

```bash
curl -X POST http://localhost:3000/api/admin/take-snapshot \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-admin-secret",
    "wallets": ["wallet1...", "wallet2..."]
  }'
```

Response:
```json
{
  "success": true,
  "count": 5,
  "entries": [
    { "wallet": "D2nU...", "passBalance": 2 },
    { "wallet": "Abc1...", "passBalance": 1 }
  ]
}
```

## Production Deployment

### 1. Take Final Snapshot

Right before presale starts:

```bash
node take-presale-snapshot.mjs
```

### 2. Store Snapshot

Choose one:
- **Database** (recommended): Store in PostgreSQL/Supabase
- **File**: Include `presale-snapshot.json` in deployment
- **Environment**: Store as JSON in env var (small lists only)

### 3. Load on Server Start

```typescript
// app/layout.tsx or similar
import { presaleSnapshot } from '@/lib/presaleSnapshot';

// Load from database
const snapshotData = await db.getPresaleSnapshot();
presaleSnapshot.loadFromJSON(snapshotData);

// Or from file
import snapshotData from '@/presale-snapshot.json';
presaleSnapshot.loadFromJSON(snapshotData);
```

### 4. Enable in Production

```env
NEXT_PUBLIC_USE_SNAPSHOT=true
```

## Security Benefits

✅ **Prevents Transfer Exploit**
- Passes can be transferred but won't work for new owner

✅ **Fair Distribution**
- Only original pass buyers can mint
- No gaming the system

✅ **Simple & Reliable**
- No complex on-chain tracking needed
- Works with any SPL token

## Limitations

⚠️ **Passes bought after snapshot can't be used**
- Take snapshot right before presale
- Or retake snapshot if needed

⚠️ **Snapshot must be loaded on server start**
- Ensure it's loaded before presale opens
- Test thoroughly

## Example Workflow

### Day Before Presale
1. Announce presale time
2. Tell users to hold passes in their wallet
3. Take snapshot 1 hour before presale

### Presale Day
1. Load snapshot on server
2. Enable snapshot mode
3. Open presale (set `MINT_PHASE=PRESALE`)
4. Only snapshot wallets can mint

### After Presale
1. Close presale (set `MINT_PHASE=CLOSED`)
2. Prepare for public mint
3. Disable snapshot (set `USE_SNAPSHOT=false`)
4. Open public mint (set `MINT_PHASE=PUBLIC`)

## Troubleshooting

### "Not in snapshot" error
- Check if snapshot is loaded
- Verify wallet address is correct
- Confirm `USE_SNAPSHOT=true`

### Snapshot not working
- Check console for "Loaded snapshot: X wallets"
- Verify snapshot file exists
- Ensure server restarted after loading

### Need to update snapshot
- Take new snapshot
- Reload snapshot data
- Restart server

## Support

For issues or questions about the snapshot system, check:
- Snapshot file exists and is loaded
- `USE_SNAPSHOT` environment variable
- Server console logs
