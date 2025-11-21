import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

const PRESALE_PASS_MINT = new PublicKey(process.env.NEXT_PUBLIC_PRESALE_PASS_MINT || '31bLEgYfLvrQ4e9nXvKMckUG6KQ3r5yhMwBHaJqrRhDm');
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
const TREASURY_WALLET = process.env.TREASURY_WALLET ? new PublicKey(process.env.TREASURY_WALLET) : null;

export async function GET(request: NextRequest) {
  try {
    const connection = new Connection(RPC_URL, 'confirmed');

    // Get mint info to find total supply
    const mintInfo = await connection.getTokenSupply(PRESALE_PASS_MINT);
    const totalSupply = mintInfo.value.uiAmount || 0;

    // Get treasury wallet's token balance (tokens available for sale)
    let remaining = 0;
    if (TREASURY_WALLET) {
      try {
        const treasuryTokenAccount = await getAssociatedTokenAddress(
          PRESALE_PASS_MINT,
          TREASURY_WALLET
        );
        const treasuryBalance = await connection.getTokenAccountBalance(treasuryTokenAccount);
        remaining = treasuryBalance.value.uiAmount || 0;
      } catch (error) {
        console.error('Error reading treasury balance:', error);
        remaining = 0;
      }
    }

    const totalDistributed = totalSupply - remaining;

    return NextResponse.json({
      totalSupply,
      totalDistributed,
      remaining,
      soldOut: remaining === 0,
    });
  } catch (error: any) {
    console.error('Presale stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get presale stats' },
      { status: 500 }
    );
  }
}
