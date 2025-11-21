import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createBurnInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// Presale Pass Token Mint (created by create-presale-pass-mainnet.mjs)
export const PRESALE_PASS_MINT = new PublicKey('Aj6dxxzsmDTVnn9QS6kXE7PLxXbzJqtwySeZ1eNWKHLq');

// Your wallet (mint authority for presale passes)
export const MINT_AUTHORITY = new PublicKey('D2nUJVgRMHgeAH8Zw3gCMjhgRZin9xmjSuStSZjtqkC2');

/**
 * Check if user has a presale pass token
 */
export async function hasPresalePass(
  connection: Connection,
  userPublicKey: PublicKey
): Promise<{ hasPass: boolean; balance: number; tokenAccount: PublicKey | null }> {
  try {
    console.log('Checking presale pass for wallet:', userPublicKey.toString());
    console.log('Presale pass mint:', PRESALE_PASS_MINT.toString());
    
    const tokenAccount = await getAssociatedTokenAddress(
      PRESALE_PASS_MINT,
      userPublicKey
    );

    console.log('Token account address:', tokenAccount.toString());

    const accountInfo = await getAccount(connection, tokenAccount);
    const balance = Number(accountInfo.amount);

    console.log('Presale pass balance:', balance);

    return {
      hasPass: balance > 0,
      balance,
      tokenAccount,
    };
  } catch (error) {
    // Token account doesn't exist
    console.error('Error checking presale pass:', error);
    return {
      hasPass: false,
      balance: 0,
      tokenAccount: null,
    };
  }
}

/**
 * Create transaction to mint a presale pass to user
 * User pays 0.001 SOL to mint authority
 */
export async function createMintPresalePassTransaction(
  connection: Connection,
  userPublicKey: PublicKey,
  mintAuthority: PublicKey
): Promise<Transaction> {
  const transaction = new Transaction();

  // 1. Payment: User sends 0.001 SOL to mint authority
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: userPublicKey,
      toPubkey: MINT_AUTHORITY,
      lamports: 0.001 * LAMPORTS_PER_SOL,
    })
  );

  // 2. Get or create user's token account
  const userTokenAccount = await getAssociatedTokenAddress(
    PRESALE_PASS_MINT,
    userPublicKey
  );

  // Check if token account exists
  const accountInfo = await connection.getAccountInfo(userTokenAccount);
  if (!accountInfo) {
    // Create associated token account
    transaction.add(
      createAssociatedTokenAccountInstruction(
        userPublicKey, // payer
        userTokenAccount, // token account
        userPublicKey, // owner
        PRESALE_PASS_MINT // mint
      )
    );
  }

  // Note: The actual minting of the token to the user's account must be done
  // by the mint authority (your backend/server) after receiving payment.
  // For this demo, we'll assume you manually mint tokens to buyers.

  return transaction;
}

/**
 * Create transaction to burn a presale pass token
 */
export async function createBurnPresalePassTransaction(
  connection: Connection,
  userPublicKey: PublicKey
): Promise<Transaction> {
  const transaction = new Transaction();

  const userTokenAccount = await getAssociatedTokenAddress(
    PRESALE_PASS_MINT,
    userPublicKey
  );

  // Burn 1 presale pass token
  transaction.add(
    createBurnInstruction(
      userTokenAccount, // token account
      PRESALE_PASS_MINT, // mint
      userPublicKey, // owner
      1, // amount (1 token, 0 decimals)
      [], // multiSigners
      TOKEN_PROGRAM_ID
    )
  );

  return transaction;
}
