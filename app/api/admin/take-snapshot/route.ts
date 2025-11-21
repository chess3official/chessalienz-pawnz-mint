import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';
import { presaleSnapshot } from '@/lib/presaleSnapshot';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'change-me-in-production';

export async function POST(request: NextRequest) {
  try {
    const { secret, wallets } = await request.json();

    // Simple admin authentication
    if (secret !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!wallets || !Array.isArray(wallets)) {
      return NextResponse.json(
        { error: 'Wallets array required' },
        { status: 400 }
      );
    }

    const connection = new Connection(RPC_URL, 'confirmed');

    // Take snapshot
    await presaleSnapshot.takeSnapshot(connection, wallets);

    const entries = presaleSnapshot.getAllEntries();

    return NextResponse.json({
      success: true,
      message: 'Snapshot taken successfully',
      count: entries.length,
      entries: entries.map(e => ({
        wallet: e.wallet,
        passBalance: e.passBalance,
      })),
    });
  } catch (error: any) {
    console.error('Take snapshot error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to take snapshot' },
      { status: 500 }
    );
  }
}
