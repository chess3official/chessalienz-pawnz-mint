import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_SLOT_HASHES_PUBKEY,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';

// Candy Machine v3 Program ID (confirmed from on-chain data)
const CANDY_MACHINE_V3_PROGRAM = new PublicKey('CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR');

// Token Metadata Program ID
const TOKEN_METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

/**
 * Get metadata PDA
 */
function getMetadata(mint: PublicKey): PublicKey {
  const [metadata] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM
  );
  return metadata;
}

/**
 * Get master edition PDA
 */
function getMasterEdition(mint: PublicKey): PublicKey {
  const [edition] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM.toBuffer(),
      mint.toBuffer(),
      Buffer.from('edition'),
    ],
    TOKEN_METADATA_PROGRAM
  );
  return edition;
}

/**
 * Get candy machine creator PDA
 */
function getCandyMachineCreator(candyMachine: PublicKey): PublicKey {
  const [creator] = PublicKey.findProgramAddressSync(
    [Buffer.from('candy_machine'), candyMachine.toBuffer()],
    CANDY_MACHINE_V3_PROGRAM
  );
  return creator;
}

/**
 * Create a mint NFT from Candy Machine v2 transaction
 */
export async function createMintNFTFromCMv2Transaction(
  connection: Connection,
  payer: PublicKey,
  candyMachineAddress: PublicKey,
  candyMachineCreator: PublicKey,
  collectionMint: PublicKey,
  collectionUpdateAuthority: PublicKey
): Promise<{ transaction: Transaction; mint: Keypair }> {
  const mint = Keypair.generate();
  const userTokenAccount = await getAssociatedTokenAddress(mint.publicKey, payer);
  
  const metadata = getMetadata(mint.publicKey);
  const masterEdition = getMasterEdition(mint.publicKey);
  const collectionMetadata = getMetadata(collectionMint);
  const collectionMasterEdition = getMasterEdition(collectionMint);

  const transaction = new Transaction();

  // Get CM account to find wallet and authority
  const cmAccount = await connection.getAccountInfo(candyMachineAddress);
  if (!cmAccount) {
    throw new Error('Candy Machine not found');
  }

  // Parse wallet from CM v2 data (bytes 40-72)
  const walletBytes = cmAccount.data.slice(40, 72);
  const wallet = new PublicKey(walletBytes);

  console.log('CM Wallet (treasury):', wallet.toString());

  // CM v3 mint_v2 instruction discriminator (sha256("global:mint_v2").slice(0, 8))
  const data = Buffer.from([120, 121, 23, 146, 173, 110, 199, 205]);

  // Get CM authority from on-chain data (bytes 8-40)
  const authorityBytes = cmAccount.data.slice(8, 40);
  const authority = new PublicKey(authorityBytes);

  console.log('Using CM authority:', authority.toString());

  const keys = [
    { pubkey: candyMachineAddress, isSigner: false, isWritable: true },
    { pubkey: authority, isSigner: false, isWritable: false }, // CM authority
    { pubkey: payer, isSigner: true, isWritable: true }, // minter (payer)
    { pubkey: mint.publicKey, isSigner: true, isWritable: true },
    { pubkey: payer, isSigner: true, isWritable: false }, // mint authority
    { pubkey: metadata, isSigner: false, isWritable: true },
    { pubkey: masterEdition, isSigner: false, isWritable: true },
    { pubkey: userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: collectionMint, isSigner: false, isWritable: false },
    { pubkey: collectionMetadata, isSigner: false, isWritable: true },
    { pubkey: collectionMasterEdition, isSigner: false, isWritable: false },
    { pubkey: collectionUpdateAuthority, isSigner: false, isWritable: false },
    { pubkey: TOKEN_METADATA_PROGRAM, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_SLOT_HASHES_PUBKEY, isSigner: false, isWritable: false },
  ];

  const mintInstruction = new TransactionInstruction({
    keys,
    programId: CANDY_MACHINE_V3_PROGRAM,
    data,
  });

  transaction.add(mintInstruction);

  return { transaction, mint };
}
