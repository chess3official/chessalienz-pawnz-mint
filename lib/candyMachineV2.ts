import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_SLOT_HASHES_PUBKEY,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';

// Candy Machine V2 Program ID
export const CANDY_MACHINE_V2_PROGRAM_ID = new PublicKey(
  'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ'
);

// Token Metadata Program ID
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

/**
 * Get metadata PDA for a mint
 */
export function getMetadataPDA(mint: PublicKey): PublicKey {
  const [metadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return metadata;
}

/**
 * Get master edition PDA for a mint
 */
export function getMasterEditionPDA(mint: PublicKey): PublicKey {
  const [edition] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from('edition'),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return edition;
}

/**
 * Get candy machine creator PDA
 */
export function getCandyMachineCreator(
  candyMachine: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('candy_machine'), candyMachine.toBuffer()],
    CANDY_MACHINE_V2_PROGRAM_ID
  );
}

/**
 * Create a mint NFT from Candy Machine V2 instruction
 */
export async function createMintNFTInstruction(
  candyMachine: PublicKey,
  candyMachineCreator: PublicKey,
  payer: PublicKey,
  wallet: PublicKey,
  mint: PublicKey,
  mintAuthority: PublicKey,
  updateAuthority: PublicKey,
  collectionMint: PublicKey,
  collectionUpdateAuthority: PublicKey
): Promise<TransactionInstruction> {
  const metadata = getMetadataPDA(mint);
  const masterEdition = getMasterEditionPDA(mint);
  const collectionMetadata = getMetadataPDA(collectionMint);
  const collectionMasterEdition = getMasterEditionPDA(collectionMint);

  const tokenAccount = await getAssociatedTokenAddress(mint, payer);

  // Candy Machine V2 mint instruction discriminator
  const data = Buffer.from([211, 57, 6, 167, 15, 219, 35, 251]);

  const keys = [
    { pubkey: candyMachine, isSigner: false, isWritable: true },
    { pubkey: candyMachineCreator, isSigner: false, isWritable: false },
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: wallet, isSigner: false, isWritable: true },
    { pubkey: metadata, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: true },
    { pubkey: mintAuthority, isSigner: true, isWritable: false },
    { pubkey: updateAuthority, isSigner: true, isWritable: false },
    { pubkey: masterEdition, isSigner: false, isWritable: true },
    { pubkey: TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_SLOT_HASHES_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: collectionMetadata, isSigner: false, isWritable: true },
    { pubkey: collectionMint, isSigner: false, isWritable: false },
    { pubkey: collectionUpdateAuthority, isSigner: false, isWritable: false },
    { pubkey: collectionMasterEdition, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: tokenAccount, isSigner: false, isWritable: true },
  ];

  return new TransactionInstruction({
    keys,
    programId: CANDY_MACHINE_V2_PROGRAM_ID,
    data,
  });
}

/**
 * Fetch candy machine account data
 */
export async function getCandyMachineData(
  connection: Connection,
  candyMachineAddress: PublicKey
): Promise<any> {
  const accountInfo = await connection.getAccountInfo(candyMachineAddress);
  
  if (!accountInfo) {
    throw new Error('Candy Machine not found');
  }

  // Parse basic CM v2 data (simplified - you may need to adjust based on actual layout)
  const data = accountInfo.data;
  
  // This is a simplified parser - CM v2 has a complex layout
  // For now, we'll just return the raw data and let the instruction handle it
  return {
    address: candyMachineAddress,
    data: accountInfo.data,
    owner: accountInfo.owner,
  };
}
