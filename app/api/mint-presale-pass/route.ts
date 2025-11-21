import { NextRequest, NextResponse } from 'next/server';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createMintToInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import fs from 'fs';
import path from 'path';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const PRESALE_PASS_MINT = new PublicKey('Aj6dxxzsmDTVnn9QS6kXE7PLxXbzJqtwySeZ1eNWKHLq');

export async function POST(request: NextRequest) {
  try {
    const { userPublicKey, paymentSignature } = await request.json();

    if (!userPublicKey || !paymentSignature) {
      return NextResponse.json(
        { error: 'Missing userPublicKey or paymentSignature' },
        { status: 400 }
      );
    }

    const connection = new Connection(MAINNET_RPC, 'confirmed');

    // Verify the payment transaction
    const paymentTx = await connection.getTransaction(paymentSignature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!paymentTx || !paymentTx.meta || paymentTx.meta.err) {
      return NextResponse.json(
        { error: 'Payment transaction not found or failed' },
        { status: 400 }
      );
    }

    // Load mint authority keypair
    const walletPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.config', 'solana', 'id.json');
    const mintAuthority = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
    );

    // Get user's token account
    const userTokenAccount = await getAssociatedTokenAddress(
      PRESALE_PASS_MINT,
      new PublicKey(userPublicKey)
    );

    // Create mint instruction
    const transaction = new Transaction().add(
      createMintToInstruction(
        PRESALE_PASS_MINT,
        userTokenAccount,
        mintAuthority.publicKey,
        1, // mint 1 token
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Sign and send transaction
    const signature = await connection.sendTransaction(transaction, [mintAuthority]);
    await connection.confirmTransaction(signature, 'confirmed');

    return NextResponse.json({
      success: true,
      signature,
      message: 'Presale pass minted successfully',
    });
  } catch (error: any) {
    console.error('Error minting presale pass:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mint presale pass' },
      { status: 500 }
    );
  }
}
