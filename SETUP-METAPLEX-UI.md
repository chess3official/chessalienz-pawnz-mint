# Setup Metaplex Candy Machine UI (Works with Your CM V2!)

## Why This Works

The official Metaplex Candy Machine UI is designed for CM V2 and has been battle-tested by thousands of projects. It will work with your existing Candy Machine immediately.

## Quick Setup (15 minutes)

### Step 1: Clone the Official UI

```bash
cd C:\Users\kkbad\CascadeProjects
git clone https://github.com/metaplex-foundation/candy-machine-ui.git pawnz-metaplex-ui
cd pawnz-metaplex-ui
```

### Step 2: Install Dependencies

```bash
yarn install
```

(If you don't have yarn: `npm install -g yarn`)

### Step 3: Configure for Your Candy Machine

Create `.env` file:

```env
REACT_APP_CANDY_MACHINE_ID=FNGdN51cFFsCLMiiiySrWiggQB6ASkaMEc7Ud7p4YGNc
REACT_APP_SOLANA_NETWORK=devnet
REACT_APP_SOLANA_RPC_HOST=https://api.devnet.solana.com
```

### Step 4: Customize (Optional)

Edit `src/Home.tsx` to:
- Change title to "Chessalienz: Pawnz"
- Update colors to match your brand
- Add your logo

### Step 5: Run Locally

```bash
yarn start
```

Opens at `http://localhost:3000`

### Step 6: Test Minting

1. Connect Phantom wallet (on devnet)
2. Click "Mint"
3. Should work immediately!

### Step 7: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts
```

Your mint page will be live at: `https://your-project.vercel.app`

## Handling Guards

The Metaplex UI doesn't have built-in guard UI, but you can:

### Option A: Remove Guards for Public Mint
```bash
cd C:\Users\kkbad\CascadeProjects\solana-nft-collection
.\sugar guard remove
```

Then everyone mints at default price (1 SOL).

### Option B: Manual Pre-Sale Process
1. Keep guards active
2. For pre-sale: Temporarily change default guard to 0.5 SOL
3. After 10 mints: Change back to 1 SOL
4. Use Metaplex UI for both phases

### Option C: Add Custom Guard UI (Advanced)

Modify `src/Home.tsx` to add a toggle:

```typescript
const [isPresale, setIsPresale] = useState(false);

// In mint function, pass group parameter
const group = isPresale ? 'presale' : undefined;
```

## Advantages

✅ **Works immediately** - No SDK compatibility issues  
✅ **Battle-tested** - Used by thousands of projects  
✅ **Well-documented** - Lots of community support  
✅ **Customizable** - Full source code access  
✅ **Free** - Open source, no fees  

## Your Candy Machine Info

- **ID:** `FNGdN51cFFsCLMiiiySrWiggQB6ASkaMEc7Ud7p4YGNc`
- **Guard ID:** `2xueZvuXhyTF5n1Amsnv9vUoWQEaPPyc5ye3noiE42m8`
- **Collection:** `EUCNPnR587eXfH6JZVW3fTky7M2TYX6iTd2nZTih8nSc`
- **Network:** Devnet

## Troubleshooting

### If mint fails with guards active:

```bash
# Temporarily remove guards
cd C:\Users\kkbad\CascadeProjects\solana-nft-collection
.\sugar guard remove

# Test minting in UI
# Should work!

# Add guards back
.\sugar guard add
```

### If you want pre-sale in the UI:

You'll need to modify the UI code to support guard groups. I can help with this if needed!

## Next Steps

1. Clone the repo
2. Configure `.env`
3. Run `yarn start`
4. Test minting
5. Customize branding
6. Deploy to Vercel

**This should work within 30 minutes!** 🚀

Let me know if you want to proceed with this approach!
