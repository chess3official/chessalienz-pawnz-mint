import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from '@solana/spl-token';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
const TOKEN_PRICE = parseFloat(process.env.PRESALE_PASS_PRICE || '2'); // Price per token in SOL
const MAX_PER_TRANSACTION = 10;

// Lazy load these to avoid build-time errors
let PRESALE_PASS_MINT: PublicKey;
let TREASURY_WALLET: PublicKey;

function getPresalePassMint(): PublicKey {
  if (!PRESALE_PASS_MINT) {
    PRESALE_PASS_MINT = new PublicKey(process.env.NEXT_PUBLIC_PRESALE_PASS_MINT || '31bLEgYfLvrQ4e9nXvKMckUG6KQ3r5yhMwBHaJqrRhDm');
  }
  return PRESALE_PASS_MINT;
}

function getTreasuryWallet(): PublicKey | null {
  if (!process.env.TREASURY_WALLET) {
    return null;
  }
  if (!TREASURY_WALLET) {
    TREASURY_WALLET = new PublicKey(process.env.TREASURY_WALLET);
  }
  return TREASURY_WALLET;
}

export async function POST(request: NextRequest) {
  try {
    const { buyerWallet, quantity } = await request.json();

    if (!buyerWallet || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: buyerWallet, quantity' },
        { status: 400 }
      );
    }

    // Validate quantity
    if (quantity < 1 || quantity > MAX_PER_TRANSACTION) {
      return NextResponse.json(
        { error: `Quantity must be between 1 and ${MAX_PER_TRANSACTION}` },
        { status: 400 }
      );
    }

    const treasuryWallet = getTreasuryWallet();
    if (!treasuryWallet) {
      return NextResponse.json(
        { error: 'Treasury wallet not configured' },
        { status: 500 }
      );
    }

    const connection = new Connection(RPC_URL, 'confirmed');
    const buyerPubkey = new PublicKey(buyerWallet);
    const presalePassMint = getPresalePassMint();

    // Check if tokens are available
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      presalePassMint,
      treasuryWallet
    );

    let availableTokens = 0;
    try {
      const accountInfo = await getAccount(connection, treasuryTokenAccount);
      availableTokens = Number(accountInfo.amount);
    } catch (error) {
      return NextResponse.json(
        { error: 'No presale tokens available' },
        { status: 400 }
      );
    }

    if (availableTokens < quantity) {
      return NextResponse.json(
        { error: `Only ${availableTokens} tokens available, you requested ${quantity}` },
        { status: 400 }
      );
    }

    // Calculate total price
    const totalPrice = TOKEN_PRICE * quantity;
    const totalLamports = Math.floor(totalPrice * LAMPORTS_PER_SOL);

    // Get buyer's token account (or create instruction for it)
    const buyerTokenAccount = await getAssociatedTokenAddress(
      presalePassMint,
      buyerPubkey
    );

    // Create transaction instructions
    const transaction = new Transaction();

    // 1. Payment instruction (SOL to treasury)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: buyerPubkey,
        toPubkey: treasuryWallet,
        lamports: totalLamports,
      })
    );

    // Note: The actual token transfer needs to be done server-side with your wallet
    // This endpoint returns transaction for payment, then server transfers tokens

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = buyerPubkey;

    // Serialize transaction
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return NextResponse.json({
      success: true,
      transaction: Buffer.from(serializedTransaction).toString('base64'),
      quantity,
      pricePerToken: TOKEN_PRICE,
      totalPrice,
      buyerTokenAccount: buyerTokenAccount.toString(),
      message: `Purchase ${quantity} presale pass token${quantity > 1 ? 's' : ''} for ${totalPrice} SOL`,
    });
  } catch (error: any) {
    console.error('Buy presale pass error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create purchase transaction' },
      { status: 500 }
    );
  }
}
