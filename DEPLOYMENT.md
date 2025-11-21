# Deployment Guide: Chessalienz Pawnz Mint Page

## Deployment Strategy

Since your main website (`pawnz-website`) is a static Vite site and your mint page is a Next.js app, they need to be deployed separately.

### Recommended Setup:

**Main Website:** `chessalienzpawnz.com`  
**Mint Page:** `mint.chessalienzpawnz.com` (subdomain)

---

## Step 1: Deploy Mint Page to Vercel

### A. Create New Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import the `pawnz-mint` repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### B. Set Environment Variables

In Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_MINT_PHASE=CLOSED
NEXT_PUBLIC_PUBLIC_MINT_PRICE=0.5
NEXT_PUBLIC_USE_SNAPSHOT=true
NEXT_PUBLIC_COLLECTION_MINT=4K74nmy4E7KprxmDTp9hkWkC4RkBHtkdzvVrDhMHY47C
NEXT_PUBLIC_COLLECTION_NAME=Chessalienz: Pawnz
NEXT_PUBLIC_COLLECTION_SYMBOL=PAWNZ
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c
ADMIN_SECRET=your-secret-key-change-this
```

⚠️ **Important:** Change `ADMIN_SECRET` to a secure random string!

### C. Deploy

Click "Deploy" and wait for build to complete.

Your mint page will be live at: `https://your-project-name.vercel.app`

---

## Step 2: Set Up Custom Domain (Subdomain)

### Option A: Subdomain (Recommended)

1. In Vercel mint project settings → "Domains"
2. Add domain: `mint.chessalienzpawnz.com`
3. Vercel will provide DNS records
4. Add these records to your domain provider:
   - Type: `CNAME`
   - Name: `mint`
   - Value: `cname.vercel-dns.com`

### Option B: Custom Path (More Complex)

If you want `chessalienzpawnz.com/mint` instead:

1. Deploy mint page to Vercel (get URL like `pawnz-mint.vercel.app`)
2. In your main website's `vercel.json`, add:
   ```json
   {
     "rewrites": [
       { "source": "/presale", "destination": "/presale.html" },
       { "source": "/mint/:path*", "destination": "https://pawnz-mint.vercel.app/:path*" }
     ]
   }
   ```

---

## Step 3: Keep Mint Page Hidden (No Links)

✅ **Already Done!**

Since you won't add any links to the mint page on your main website, users can only access it if they know the direct URL:

- `mint.chessalienzpawnz.com` (subdomain)
- OR `chessalienzpawnz.com/mint` (if using path)

This allows you to:
- Share the link privately with presale pass holders
- Test the page before public launch
- Control access via the URL

---

## Step 4: Managing Mint Phases

### Change Mint Phase

In Vercel mint project:
1. Go to Settings → Environment Variables
2. Update `NEXT_PUBLIC_MINT_PHASE`:
   - `CLOSED` - No minting (current)
   - `PRESALE` - Pass holders only
   - `PUBLIC` - Everyone can mint
3. Redeploy (or wait for automatic deployment)

### Quick Phase Changes

You can also update `.env.local` in your repo and push to GitHub. Vercel will auto-deploy.

---

## Step 5: Before Going Live

### Presale Phase Checklist:

- [ ] All 1,000 presale passes distributed
- [ ] Upload 5,000 NFT metadata files
- [ ] Take snapshot: `node take-presale-snapshot.mjs`
- [ ] Upload `presale-snapshot.json` to your repo
- [ ] Update `NEXT_PUBLIC_MINT_PHASE=PRESALE` in Vercel
- [ ] Test mint with a pass holder wallet
- [ ] Verify NFTs appear in wallets

### Public Phase Checklist:

- [ ] Confirm presale passes sold out (1,000/1,000)
- [ ] Update `NEXT_PUBLIC_MINT_PHASE=PUBLIC` in Vercel
- [ ] Test public mint (0.5 SOL)
- [ ] Monitor mint progress

---

## Monitoring & Updates

### View Mint Progress

The mint page automatically shows:
- Presale passes: X / 1,000
- NFTs minted: X / 5,000

### Update Mint Page

1. Make changes to code
2. Push to GitHub
3. Vercel auto-deploys
4. Changes live in ~2 minutes

---

## Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use Vercel Environment Variables** for production
3. **Change ADMIN_SECRET** to something secure
4. **Keep RPC URL private** (consider using Vercel env vars)
5. **Snapshot system prevents exploits** - Always use it for presale

---

## Support & Troubleshooting

### Common Issues:

**Mint buttons greyed out:**
- Check `NEXT_PUBLIC_MINT_PHASE` is set correctly
- Verify environment variables in Vercel

**NFTs not appearing in wallet:**
- Collection verification is automatic
- Check Solana explorer for transaction
- May take 1-2 minutes to appear

**Presale pass count not updating:**
- Stats refresh every 30 seconds
- Check RPC URL is working
- Verify presale pass mint address

---

## Quick Reference

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | `localhost:3000` | Local testing |
| Production | `mint.chessalienzpawnz.com` | Live mint page |
| Main Site | `chessalienzpawnz.com` | Marketing site |

**Mint Phases:**
- `CLOSED` → No minting, buttons greyed
- `PRESALE` → Pass holders only, free mints
- `PUBLIC` → Everyone, 0.5 SOL

**Collection:**
- Presale Passes: 1,000
- Total NFTs: 5,000
- Presale: 1,000 free
- Public: 4,000 @ 0.5 SOL
