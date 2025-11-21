import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const PRESALE_PASS_MINT = new PublicKey('Aj6dxxzsmDTVnn9QS6kXE7PLxXbzJqtwySeZ1eNWKHLq');
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';

export async function GET(request: NextRequest) {
  try {
    const connection = new Connection(RPC_URL, 'confirmed');

    // Get mint info to find total supply
    const mintInfo = await connection.getTokenSupply(PRESALE_PASS_MINT);
    const totalSupply = mintInfo.value.uiAmount || 0;

    // Get all token accounts to count distributed passes
    const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
      filters: [
        {
          dataSize: 165, // Token account size
        },
        {
          memcmp: {
            offset: 0, // Mint address offset
            bytes: PRESALE_PASS_MINT.toBase58(),
          },
        },
      ],
    });

    let totalDistributed = 0;
    let uniqueHolders = 0;

    for (const account of accounts) {
      try {
        const accountInfo = await connection.getTokenAccountBalance(account.pubkey);
        const balance = accountInfo.value.uiAmount || 0;
        
        if (balance > 0) {
          totalDistributed += balance;
          uniqueHolders++;
        }
      } catch (error) {
        console.error('Error reading token account:', error);
      }
    }

    return NextResponse.json({
      totalSupply,
      totalDistributed,
      uniqueHolders,
      remaining: Math.max(0, totalSupply - totalDistributed),
      soldOut: totalDistributed >= totalSupply,
    });
  } catch (error: any) {
    console.error('Presale stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get presale stats' },
      { status: 500 }
    );
  }
}
