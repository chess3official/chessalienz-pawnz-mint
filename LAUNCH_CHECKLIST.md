# Chessalienz: Pawnz Launch Checklist

## Collection Details
- **Presale Passes:** 1,000 total
- **Total NFT Collection:** 5,000 NFTs
  - 1,000 reserved for presale pass holders (FREE)
  - 4,000 available for public mint (0.5 SOL each)

## Launch Phases

### Phase 1: Presale Pass Distribution (NOW)
**Status:** Ready to launch ✅

**What happens:**
- Distribute 1,000 presale passes to early supporters
- Mint page shows: "Presale Passes: X / 1,000"
- Both mint buttons are GREYED OUT (phase = CLOSED)
- No NFT metadata needed yet

**Settings:**
```env
NEXT_PUBLIC_MINT_PHASE=CLOSED
```

**What users see:**
- ✅ Presale pass progress bar (0/1,000 → 1,000/1,000)
- ✅ Public mint progress bar (0/5,000)
- 🎫 Buy Presale Pass button (greyed out - sold out)
- 🎁 Free Mint button (GREYED OUT - not active yet)
- 💎 Public Mint button (GREYED OUT - not active yet)

---

### Phase 2: Presale Mint (After passes sold out)
**Status:** Waiting for presale sellout

**Before activating:**
1. ✅ Confirm all 1,000 presale passes are distributed
2. ✅ Upload 5,000 NFT metadata files
3. ✅ Take snapshot of pass holders: `node take-presale-snapshot.mjs`
4. ✅ Update `lib/mintNFT.ts` with correct metadata URIs
5. ✅ Test mint on devnet/testnet

**To activate:**
```env
NEXT_PUBLIC_MINT_PHASE=PRESALE
```

**What happens:**
- Pass holders can mint FREE NFTs (one per pass)
- 🎁 Free Mint button becomes ACTIVE (green)
- 💎 Public Mint button stays GREYED OUT
- Progress: 0/5,000 → up to 1,000/5,000

---

### Phase 3: Public Mint (Manual activation)
**Status:** Waiting for manual activation

**To activate:**
```env
NEXT_PUBLIC_MINT_PHASE=PUBLIC
```

**What happens:**
- Everyone can mint for 0.5 SOL
- Pass holders with unredeemed passes still get FREE mints
- 💎 Public Mint button becomes ACTIVE (purple)
- Progress: 1,000/5,000 → 5,000/5,000

**Note:** Public mint will be blocked if presale passes aren't fully distributed (safety feature)

---

## Manual Controls

### Change Mint Phase
Edit `.env.local`:
```env
NEXT_PUBLIC_MINT_PHASE=CLOSED   # No minting allowed
NEXT_PUBLIC_MINT_PHASE=PRESALE  # Pass holders only (FREE)
NEXT_PUBLIC_MINT_PHASE=PUBLIC   # Everyone (0.5 SOL)
```

Then restart your Next.js server:
```bash
npm run dev
```

### Take Snapshot (Before PRESALE phase)
```bash
node take-presale-snapshot.mjs
```
This locks in who can mint based on pass ownership at snapshot time.

---

## Current Status

**✅ Ready for Phase 1:** Presale Pass Distribution
- Mint page is live
- Both mint buttons are greyed out
- Progress bars are tracking correctly
- Waiting for presale passes to sell out

**⏳ Phase 2 Requirements:**
- Upload 5,000 NFT metadata
- Take snapshot
- Change MINT_PHASE to PRESALE

**⏳ Phase 3 Requirements:**
- Change MINT_PHASE to PUBLIC

---

## Quick Reference

| Phase | MINT_PHASE | Free Mint Button | Public Mint Button | Who Can Mint |
|-------|------------|------------------|-------------------|--------------|
| Pass Distribution | CLOSED | ❌ Greyed | ❌ Greyed | Nobody |
| Presale Mint | PRESALE | ✅ Active | ❌ Greyed | Pass holders only |
| Public Mint | PUBLIC | ✅ Active* | ✅ Active | Everyone |

*Pass holders with unredeemed passes still get free mints

---

## Support

- Presale pass mint: `Aj6dxxzsmDTVnn9QS6kXE7PLxXbzJqtwySeZ1eNWKHLq`
- Collection mint: `4K74nmy4E7KprxmDTp9hkWkC4RkBHtkdzvVrDhMHY47C`
- RPC: Helius mainnet
