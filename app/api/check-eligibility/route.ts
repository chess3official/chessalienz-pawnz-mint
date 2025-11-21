import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { db } from '@/lib/db';
import { presaleSnapshot } from '@/lib/presaleSnapshot';

const PRESALE_PASS_MINT = new PublicKey(process.env.NEXT_PUBLIC_PRESALE_PASS_MINT || '31bLEgYfLvrQ4e9nXvKMckUG6KQ3r5yhMwBHaJqrRhDm');
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
const USE_SNAPSHOT = process.env.NEXT_PUBLIC_USE_SNAPSHOT === 'true';

// Check if all presale passes are sold out
async function arePresalePassesSoldOut(connection: Connection): Promise<boolean> {
  try {
    const mintInfo = await connection.getTokenSupply(PRESALE_PASS_MINT);
    const totalSupply = mintInfo.value.uiAmount || 0;

    // Get all token accounts
    const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
      filters: [
        { dataSize: 165 },
        { memcmp: { offset: 0, bytes: PRESALE_PASS_MINT.toBase58() } },
      ],
    });

    let totalDistributed = 0;
    for (const account of accounts) {
      try {
        const accountInfo = await connection.getTokenAccountBalance(account.pubkey);
        totalDistributed += accountInfo.value.uiAmount || 0;
      } catch (error) {
        // Skip errors
      }
    }

    return totalDistributed >= totalSupply;
  } catch (error) {
    console.error('Error checking presale sold out:', error);
    return false; // Default to not sold out on error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { wallet } = await request.json();

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const walletPubkey = new PublicKey(wallet);
    const connection = new Connection(RPC_URL, 'confirmed');

    // Check if they have a presale pass
    let hasPass = false;
    let passBalance = 0;
    let snapshotBalance = 0;

    // If using snapshot system, check snapshot first
    if (USE_SNAPSHOT && presaleSnapshot.hasSnapshot()) {
      const snapshotEntry = presaleSnapshot.getSnapshotEntry(wallet);
      if (snapshotEntry) {
        snapshotBalance = snapshotEntry.passBalance;
        hasPass = snapshotBalance > 0;
        passBalance = snapshotBalance; // Use snapshot balance for eligibility
      } else {
        // Not in snapshot = not eligible for presale
        hasPass = false;
        passBalance = 0;
      }
    } else {
      // No snapshot, check current balance (original behavior)
      try {
        const ata = await getAssociatedTokenAddress(PRESALE_PASS_MINT, walletPubkey);
        const accountInfo = await connection.getTokenAccountBalance(ata);
        passBalance = accountInfo.value.uiAmount || 0;
        hasPass = passBalance > 0;
      } catch (error) {
        // ATA doesn't exist, no pass
        hasPass = false;
      }
    }

    // Check how many passes they've redeemed FROM THIS WALLET
    const redeemedCount = await db.getRedeemedCount(wallet);
    
    // CRITICAL SECURITY CHECK:
    // If using snapshot, compare redemptions to SNAPSHOT balance, not current balance
    // This prevents: User A redeems 3, transfers to User B who then redeems more
    const maxRedeems = USE_SNAPSHOT && presaleSnapshot.hasSnapshot() 
      ? snapshotBalance  // Use snapshot balance (locked at snapshot time)
      : passBalance;     // Use current balance (vulnerable to transfers)
    
    const canStillRedeem = redeemedCount < maxRedeems;
    const hasRedeemedAll = !canStillRedeem;

    // Get current mint phase
    const mintPhase = process.env.NEXT_PUBLIC_MINT_PHASE || 'CLOSED';
    const publicPrice = parseFloat(process.env.NEXT_PUBLIC_PUBLIC_MINT_PRICE || '0.5');

    // Check if presale passes are sold out
    const presaleSoldOut = await arePresalePassesSoldOut(connection);

    // Determine eligibility and price
    let eligible = false;
    let price = 0;
    let reason = '';

    if (mintPhase === 'CLOSED') {
      eligible = false;
      reason = 'Minting is closed until all presale passes are sold out';
    } else if (mintPhase === 'PRESALE') {
      if (!hasPass) {
        eligible = false;
        reason = 'Presale is only for pass holders';
      } else if (hasRedeemedAll) {
        eligible = false;
        reason = `You have already redeemed all ${passBalance} of your presale passes`;
      } else {
        eligible = true;
        price = 0; // FREE for presale
      }
    } else if (mintPhase === 'PUBLIC') {
      // Public mint only available if presale passes are sold out
      if (!presaleSoldOut) {
        eligible = false;
        reason = 'Public mint opens when all presale passes are sold out';
      } else if (hasPass && !hasRedeemedAll) {
        eligible = true;
        price = 0; // Still FREE for unredeemed pass holders
      } else {
        eligible = true;
        price = publicPrice; // Public price
      }
    }

    return NextResponse.json({
      eligible,
      hasPass,
      hasRedeemed: hasRedeemedAll,
      passBalance: maxRedeems, // Show snapshot balance if using snapshot
      redeemedCount,
      remainingRedeems: Math.max(0, maxRedeems - redeemedCount),
      price,
      mintPhase,
      reason: eligible ? undefined : reason,
    });
  } catch (error: any) {
    console.error('Check eligibility error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check eligibility' },
      { status: 500 }
    );
  }
}
