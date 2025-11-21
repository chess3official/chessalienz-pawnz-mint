// Simple in-memory database for now
// You can replace this with PostgreSQL, Supabase, or Vercel Postgres later

interface PresaleRedemption {
  walletAddress: string;
  passTokenAccount: string;
  passBalance: number;
  redeemedCount: number; // How many passes this wallet has redeemed
  redeemedAt: Date;
  nftMints: string[]; // Array of NFT mints
  txSignatures: string[]; // Array of transaction signatures
}

interface PassTokenRedemption {
  passTokenMint: string; // The specific pass token mint address
  redeemedBy: string; // Wallet that redeemed it
  nftMint: string; // NFT that was minted
  txSignature: string;
  redeemedAt: Date;
}

interface MintStat {
  phase: 'PRESALE' | 'PUBLIC';
  walletAddress: string;
  nftMint: string;
  pricePaid: number;
  txSignature: string;
  mintedAt: Date;
}

// In-memory storage (replace with real database)
const redemptions = new Map<string, PresaleRedemption>();
const passTokenRedemptions = new Set<string>(); // Track individual pass token mints that have been used
const mintStats: MintStat[] = [];

export const db = {
  // Check how many passes a wallet has redeemed
  async getRedeemedCount(walletAddress: string): Promise<number> {
    const redemption = redemptions.get(walletAddress);
    return redemption?.redeemedCount || 0;
  },

  // Get redemption details
  async getRedemption(walletAddress: string): Promise<PresaleRedemption | null> {
    return redemptions.get(walletAddress) || null;
  },

  // Check if wallet can still redeem (has unredeemed passes)
  async canRedeem(walletAddress: string, passBalance: number): Promise<boolean> {
    const redeemedCount = await this.getRedeemedCount(walletAddress);
    return redeemedCount < passBalance;
  },

  // Mark one pass as redeemed
  async markRedeemed(data: {
    walletAddress: string;
    passTokenAccount: string;
    passBalance: number;
    nftMint: string;
    txSignature: string;
  }): Promise<void> {
    const existing = redemptions.get(data.walletAddress);

    if (existing) {
      // Increment redemption count
      existing.redeemedCount += 1;
      existing.nftMints.push(data.nftMint);
      existing.txSignatures.push(data.txSignature);
      existing.redeemedAt = new Date();
    } else {
      // First redemption
      redemptions.set(data.walletAddress, {
        walletAddress: data.walletAddress,
        passTokenAccount: data.passTokenAccount,
        passBalance: data.passBalance,
        redeemedCount: 1,
        nftMints: [data.nftMint],
        txSignatures: [data.txSignature],
        redeemedAt: new Date(),
      });
    }
  },

  // Record mint stat
  async recordMint(stat: Omit<MintStat, 'mintedAt'>): Promise<void> {
    mintStats.push({
      ...stat,
      mintedAt: new Date(),
    });
  },

  // Get mint statistics
  async getStats(): Promise<{
    totalMinted: number;
    presaleMinted: number;
    publicMinted: number;
    totalRevenue: number;
  }> {
    const presaleMinted = mintStats.filter(s => s.phase === 'PRESALE').length;
    const publicMinted = mintStats.filter(s => s.phase === 'PUBLIC').length;
    const totalRevenue = mintStats.reduce((sum, s) => sum + s.pricePaid, 0);

    return {
      totalMinted: mintStats.length,
      presaleMinted,
      publicMinted,
      totalRevenue,
    };
  },

  // Get all redemptions (admin)
  async getAllRedemptions(): Promise<PresaleRedemption[]> {
    return Array.from(redemptions.values());
  },
};

// Note: For production, replace this with:
// - PostgreSQL with pg or Prisma
// - Supabase
// - Vercel Postgres
// - MongoDB
// etc.
