import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount } from '@solana/spl-token';
import fs from 'fs';

const PRESALE_PASS_MINT = new PublicKey(process.env.NEXT_PUBLIC_PRESALE_PASS_MINT || '31bLEgYfLvrQ4e9nXvKMckUG6KQ3r5yhMwBHaJqrRhDm');
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const { buyerWallet, quantity, paymentSignature, adminSecret } = await request.json();

    // Verify admin secret (this endpoint should only be called by your server/admin)
    if (adminSecret !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!buyerWallet || !quantity || !paymentSignature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const connection = new Connection(RPC_URL, 'confirmed');
    const buyerPubkey = new PublicKey(buyerWallet);

    // Verify payment transaction
    const paymentTx = await connection.getTransaction(paymentSignature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!paymentTx || !paymentTx.meta || paymentTx.meta.err) {
      return NextResponse.json(
        { error: 'Payment transaction not found or failed' },
        { status: 400 }
      );
    }

    // Load treasury wallet keypair
    const walletPath = process.env.TREASURY_WALLET_PATH || './treasury-wallet.json';
    if (!fs.existsSync(walletPath)) {
      return NextResponse.json(
        { error: 'Treasury wallet not configured' },
        { status: 500 }
      );
    }

    const treasuryKeypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
    );

    // Get token accounts
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      PRESALE_PASS_MINT,
      treasuryKeypair.publicKey
    );

    const buyerTokenAccount = await getAssociatedTokenAddress(
      PRESALE_PASS_MINT,
      buyerPubkey
    );

    // Check if buyer's token account exists, create if not
    let buyerAccountExists = true;
    try {
      await getAccount(connection, buyerTokenAccount);
    } catch (error) {
      buyerAccountExists = false;
    }

    // Build transaction
    const { Transaction } = await import('@solana/web3.js');
    const transaction = new Transaction();

    // Create buyer's token account if needed
    if (!buyerAccountExists) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          treasuryKeypair.publicKey, // payer
          buyerTokenAccount,
          buyerPubkey,
          PRESALE_PASS_MINT
        )
      );
    }

    // Transfer tokens
    transaction.add(
      createTransferInstruction(
        treasuryTokenAccount,
        buyerTokenAccount,
        treasuryKeypair.publicKey,
        quantity
      )
    );

    // Send transaction
    const signature = await connection.sendTransaction(transaction, [treasuryKeypair]);
    await connection.confirmTransaction(signature, 'confirmed');

    return NextResponse.json({
      success: true,
      signature,
      quantity,
      buyerTokenAccount: buyerTokenAccount.toString(),
      message: `Successfully transferred ${quantity} token${quantity > 1 ? 's' : ''} to buyer`,
    });
  } catch (error: any) {
    console.error('Complete token purchase error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete token transfer' },
      { status: 500 }
    );
  }
}
