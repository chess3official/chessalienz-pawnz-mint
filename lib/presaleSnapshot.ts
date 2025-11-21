import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

const PRESALE_PASS_MINT = new PublicKey('Aj6dxxzsmDTVnn9QS6kXE7PLxXbzJqtwySeZ1eNWKHLq');

export interface SnapshotEntry {
  wallet: string;
  passBalance: number;
  snapshotAt: Date;
}

// In-memory snapshot (replace with database in production)
let snapshot: Map<string, SnapshotEntry> = new Map();
let snapshotTaken = false;

export const presaleSnapshot = {
  /**
   * Take a snapshot of all current pass holders
   */
  async takeSnapshot(connection: Connection, passHolders: string[]): Promise<void> {
    console.log('Taking presale snapshot...');
    snapshot.clear();

    for (const wallet of passHolders) {
      try {
        const walletPubkey = new PublicKey(wallet);
        const ata = await getAssociatedTokenAddress(PRESALE_PASS_MINT, walletPubkey);
        const accountInfo = await connection.getTokenAccountBalance(ata);
        const balance = accountInfo.value.uiAmount || 0;

        if (balance > 0) {
          snapshot.set(wallet, {
            wallet,
            passBalance: balance,
            snapshotAt: new Date(),
          });
        }
      } catch (error) {
        console.error(`Error checking wallet ${wallet}:`, error);
      }
    }

    snapshotTaken = true;
    console.log(`Snapshot complete: ${snapshot.size} wallets with passes`);
  },

  /**
   * Check if a wallet is in the snapshot
   */
  isWhitelisted(wallet: string): boolean {
    return snapshot.has(wallet);
  },

  /**
   * Get snapshot entry for a wallet
   */
  getSnapshotEntry(wallet: string): SnapshotEntry | null {
    return snapshot.get(wallet) || null;
  },

  /**
   * Get all snapshot entries
   */
  getAllEntries(): SnapshotEntry[] {
    return Array.from(snapshot.values());
  },

  /**
   * Check if snapshot has been taken
   */
  hasSnapshot(): boolean {
    return snapshotTaken;
  },

  /**
   * Clear snapshot (for testing)
   */
  clearSnapshot(): void {
    snapshot.clear();
    snapshotTaken = false;
  },

  /**
   * Manually add wallet to snapshot (for testing or manual additions)
   */
  addToSnapshot(wallet: string, passBalance: number): void {
    snapshot.set(wallet, {
      wallet,
      passBalance,
      snapshotAt: new Date(),
    });
    snapshotTaken = true;
  },

  /**
   * Load snapshot from JSON file
   */
  loadFromJSON(data: SnapshotEntry[]): void {
    snapshot.clear();
    data.forEach(entry => {
      snapshot.set(entry.wallet, {
        ...entry,
        snapshotAt: new Date(entry.snapshotAt),
      });
    });
    snapshotTaken = true;
    console.log(`Loaded snapshot: ${snapshot.size} wallets`);
  },

  /**
   * Export snapshot to JSON
   */
  exportToJSON(): SnapshotEntry[] {
    return Array.from(snapshot.values());
  },
};
