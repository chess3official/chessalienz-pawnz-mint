import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { wallet, passTokenAccount, passBalance, nftMint, txSignature } = await request.json();

    if (!wallet || !nftMint || !txSignature) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet, nftMint, txSignature' },
        { status: 400 }
      );
    }

    // Check if wallet can still redeem (has remaining passes)
    const canRedeem = await db.canRedeem(wallet, passBalance || 1);
    if (!canRedeem) {
      const redeemedCount = await db.getRedeemedCount(wallet);
      return NextResponse.json(
        { error: `All passes already redeemed (${redeemedCount}/${passBalance})` },
        { status: 400 }
      );
    }

    // Mark one pass as redeemed
    await db.markRedeemed({
      walletAddress: wallet,
      passTokenAccount: passTokenAccount || '',
      passBalance: passBalance || 1,
      nftMint,
      txSignature,
    });

    // Record mint stat
    const mintPhase = process.env.NEXT_PUBLIC_MINT_PHASE || 'PRESALE';
    await db.recordMint({
      phase: mintPhase as 'PRESALE' | 'PUBLIC',
      walletAddress: wallet,
      nftMint: nftMint,
      pricePaid: 0, // Free for presale pass holders
      txSignature,
    });

    const newRedeemedCount = await db.getRedeemedCount(wallet);

    return NextResponse.json({
      success: true,
      message: 'Redemption recorded successfully',
      redeemedCount: newRedeemedCount,
      remainingRedeems: Math.max(0, passBalance - newRedeemedCount),
    });
  } catch (error: any) {
    console.error('Mark redeemed error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark as redeemed' },
      { status: 500 }
    );
  }
}
