import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { 
      wallet, 
      passTokenAccount, 
      passBalance, 
      nftMint, 
      nftMints, 
      txSignature, 
      txSignatures,
      quantity 
    } = await request.json();

    // Support both single and batch minting
    const mints = nftMints || [nftMint];
    const signatures = txSignatures || [txSignature];
    const mintQuantity = quantity || 1;

    if (!wallet || mints.length === 0 || signatures.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet, nftMint(s), txSignature(s)' },
        { status: 400 }
      );
    }

    // Check if wallet can still redeem (has remaining passes)
    const currentRedeemed = await db.getRedeemedCount(wallet);
    const remainingBefore = (passBalance || 1) - currentRedeemed;
    
    if (remainingBefore < mintQuantity) {
      return NextResponse.json(
        { error: `Not enough passes. Have ${remainingBefore}, trying to redeem ${mintQuantity}` },
        { status: 400 }
      );
    }

    // Mark passes as redeemed (one entry per NFT)
    for (let i = 0; i < mints.length; i++) {
      await db.markRedeemed({
        walletAddress: wallet,
        passTokenAccount: passTokenAccount || '',
        passBalance: passBalance || 1,
        nftMint: mints[i],
        txSignature: signatures[i] || signatures[0],
      });

      // Record mint stat
      const mintPhase = process.env.NEXT_PUBLIC_MINT_PHASE || 'PRESALE';
      await db.recordMint({
        phase: mintPhase as 'PRESALE' | 'PUBLIC',
        walletAddress: wallet,
        nftMint: mints[i],
        pricePaid: 0, // Free for presale pass holders
        txSignature: signatures[i] || signatures[0],
      });
    }

    const newRedeemedCount = await db.getRedeemedCount(wallet);

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed ${mints.length} pass${mints.length > 1 ? 'es' : ''}`,
      redeemedCount: newRedeemedCount,
      remainingRedeems: Math.max(0, passBalance - newRedeemedCount),
      quantity: mints.length,
    });
  } catch (error: any) {
    console.error('Mark redeemed error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark as redeemed' },
      { status: 500 }
    );
  }
}
