# Chessalienz: Pawnz - NFT Mint Page

Genesis collection mint page for Chessalienz: Pawnz NFT collection on Solana.

## 🎮 Features

- **Presale Pass System** - 1,000 presale passes for early supporters
- **Free Mints** - Pass holders get FREE NFTs (one per pass)
- **Public Mint** - 4,000 NFTs available at 0.5 SOL
- **Snapshot Security** - Prevents transfer exploits
- **Real-time Progress** - Live tracking of passes and mints
- **Phase Control** - Manual control of mint phases

## 📊 Collection Details

- **Presale Passes:** 1,000
- **Total NFTs:** 5,000
  - 1,000 reserved for presale (FREE)
  - 4,000 public mint (0.5 SOL)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Solana wallet (Phantom, Solflare, etc.)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd pawnz-mint

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your values
# Start development server
npm run dev
```

Visit `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create `.env.local` with:

```env
# Mint Phase Control (CLOSED, PRESALE, PUBLIC)
NEXT_PUBLIC_MINT_PHASE=CLOSED

# Public mint price in SOL
NEXT_PUBLIC_PUBLIC_MINT_PRICE=0.5

# Snapshot System
NEXT_PUBLIC_USE_SNAPSHOT=true

# Admin secret for snapshots
ADMIN_SECRET=your-secret-key-change-this

# Collection details
NEXT_PUBLIC_COLLECTION_MINT=4K74nmy4E7KprxmDTp9hkWkC4RkBHtkdzvVrDhMHY47C
NEXT_PUBLIC_COLLECTION_NAME=Chessalienz: Pawnz
NEXT_PUBLIC_COLLECTION_SYMBOL=PAWNZ

# RPC
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

## 📖 Documentation

- **[Launch Checklist](./LAUNCH_CHECKLIST.md)** - Step-by-step launch guide
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to Vercel
- **[Presale System](./PRESALE_SYSTEM_README.md)** - How the presale works
- **[Snapshot System](./SNAPSHOT_SYSTEM.md)** - Security features

## 🎯 Mint Phases

### Phase 1: CLOSED
- Presale passes being distributed
- Minting disabled
- Buttons greyed out

### Phase 2: PRESALE
- Pass holders mint FREE NFTs
- One NFT per pass held
- Public minting disabled

### Phase 3: PUBLIC
- Everyone can mint for 0.5 SOL
- Pass holders with unredeemed passes still get FREE mints
- Continues until 5,000 NFTs minted

## 🛠️ Tech Stack

- **Framework:** Next.js 14
- **Blockchain:** Solana
- **Wallet:** Solana Wallet Adapter
- **NFT Standard:** Metaplex
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## 📝 Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Take presale snapshot
node take-presale-snapshot.mjs
```

## 🔐 Security

- Snapshot system prevents transfer exploits
- Environment variables for sensitive data
- Admin-only snapshot endpoints
- Redemption tracking per wallet

## 🌐 Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables
4. Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📞 Support

- Collection: Chessalienz: Pawnz
- Blockchain: Solana Mainnet
- Presale Pass Mint: `Aj6dxxzsmDTVnn9QS6kXE7PLxXbzJqtwySeZ1eNWKHLq`
- Collection Mint: `4K74nmy4E7KprxmDTp9hkWkC4RkBHtkdzvVrDhMHY47C`

## 📄 License

Private - All Rights Reserved
