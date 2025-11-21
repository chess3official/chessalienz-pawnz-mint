import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const PRESALE_PASS_MINT = new PublicKey('APT2rEQ9J2LKSN3w9ErHcYxcktzwPv9HnN1EznMFCGDu');
const WALLET = new PublicKey('D2nUJVgRMHgeAH8Zw3gCMjhgRZin9xmjSuStSZjtqkC2');

async function main() {
  const connection = new Connection(MAINNET_RPC, 'confirmed');

  console.log('Checking presale pass token...\n');
  console.log('Mint:', PRESALE_PASS_MINT.toString());
  console.log('Wallet:', WALLET.toString());

  // Check if mint exists
  try {
    const mintInfo = await connection.getAccountInfo(PRESALE_PASS_MINT);
    if (mintInfo) {
      console.log('\n✅ Mint account exists');
      console.log('Owner:', mintInfo.owner.toString());
    } else {
      console.log('\n❌ Mint account does NOT exist');
      return;
    }
  } catch (error) {
    console.error('Error checking mint:', error);
    return;
  }

  // Get ATA address
  const ata = await getAssociatedTokenAddress(PRESALE_PASS_MINT, WALLET);
  console.log('\nExpected ATA:', ata.toString());

  // Check if ATA exists
  try {
    const account = await getAccount(connection, ata);
    console.log('\n✅ Token account exists');
    console.log('Balance:', account.amount.toString());
  } catch (error) {
    console.log('\n❌ Token account does NOT exist');
    console.log('Error:', error.message);
  }

  // Check the token account from presale-pass-mainnet.json
  const savedAccount = new PublicKey('89cQmrWp5DV5X6PJpjNWhm8Kt17fNVWkU3BQbXMQfJPC');
  console.log('\nSaved token account from JSON:', savedAccount.toString());
  
  try {
    const account = await getAccount(connection, savedAccount);
    console.log('✅ Saved token account exists');
    console.log('Balance:', account.amount.toString());
    console.log('Owner:', account.owner.toString());
    console.log('Mint:', account.mint.toString());
  } catch (error) {
    console.log('❌ Saved token account does NOT exist');
    console.log('Error:', error.message);
  }
}

main().catch(console.error);
