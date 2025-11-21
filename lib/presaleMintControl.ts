import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export const PRESALE_PASS_MINT = new PublicKey('Aj6dxxzsmDTVnn9QS6kXE7PLxXbzJqtwySeZ1eNWKHLq');

// PDA to track presale redemptions
// Seeds: ["presale_redemption", presale_pass_mint, user_wallet]
export function getPresaleRedemptionPDA(
  userWallet: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('presale_redemption'),
      PRESALE_PASS_MINT.toBuffer(),
      userWallet.toBuffer(),
    ],
    programId
  );
}

/**
 * Check if user has a presale pass
 */
export async function hasPresalePass(
  connection: Connection,
  wallet: PublicKey
): Promise<{ hasPass: boolean; balance: number }> {
  try {
    const ata = await getAssociatedTokenAddress(
      PRESALE_PASS_MINT,
      wallet
    );
    
    const accountInfo = await connection.getTokenAccountBalance(ata);
    const balance = accountInfo.value.uiAmount || 0;
    
    return {
      hasPass: balance > 0,
      balance,
    };
  } catch (error) {
    return { hasPass: false, balance: 0 };
  }
}

/**
 * Check if user has already redeemed their presale pass
 * This checks an on-chain PDA that tracks redemptions
 */
export async function hasRedeemedPresale(
  connection: Connection,
  wallet: PublicKey,
  redemptionProgramId: PublicKey
): Promise<boolean> {
  try {
    const [redemptionPDA] = getPresaleRedemptionPDA(wallet, redemptionProgramId);
    const accountInfo = await connection.getAccountInfo(redemptionPDA);
    
    // If PDA exists, they've already redeemed
    return accountInfo !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Eligibility check for presale mint
 */
export async function checkPresaleEligibility(
  connection: Connection,
  wallet: PublicKey,
  redemptionProgramId: PublicKey
): Promise<{
  eligible: boolean;
  reason?: string;
  passBalance: number;
}> {
  // Check if they have a pass
  const { hasPass, balance } = await hasPresalePass(connection, wallet);
  
  if (!hasPass) {
    return {
      eligible: false,
      reason: 'No presale pass found',
      passBalance: 0,
    };
  }
  
  // Check if they've already redeemed
  const redeemed = await hasRedeemedPresale(connection, wallet, redemptionProgramId);
  
  if (redeemed) {
    return {
      eligible: false,
      reason: 'Presale pass already redeemed',
      passBalance: balance,
    };
  }
  
  return {
    eligible: true,
    passBalance: balance,
  };
}

/**
 * Mint phases
 */
export enum MintPhase {
  CLOSED = 'CLOSED',
  PRESALE = 'PRESALE',
  PUBLIC = 'PUBLIC',
}

/**
 * Get current mint phase (you control this via env vars or database)
 */
export function getCurrentMintPhase(): MintPhase {
  // You can control this via:
  // 1. Environment variable
  // 2. Database flag
  // 3. On-chain state
  // 4. Time-based (start/end timestamps)
  
  const phase = process.env.NEXT_PUBLIC_MINT_PHASE || 'CLOSED';
  return phase as MintPhase;
}

/**
 * Get mint price based on phase and eligibility
 */
export function getMintPrice(
  phase: MintPhase,
  hasPresalePass: boolean,
  hasRedeemed: boolean
): number {
  if (phase === MintPhase.CLOSED) {
    return 0; // Can't mint
  }
  
  if (phase === MintPhase.PRESALE) {
    // During presale, only pass holders can mint for free
    if (hasPresalePass && !hasRedeemed) {
      return 0; // FREE for presale pass holders
    }
    return -1; // Not eligible
  }
  
  if (phase === MintPhase.PUBLIC) {
    // During public mint:
    // - Pass holders who haven't redeemed: FREE
    // - Everyone else: 0.5 SOL
    if (hasPresalePass && !hasRedeemed) {
      return 0; // Still free for pass holders
    }
    return 0.5; // 0.5 SOL for public
  }
  
  return -1;
}
