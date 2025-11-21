import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';

const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=ef6ce033-5e56-4193-b6d8-58acadaea81c';
const PRESALE_PASS_MINT = 'Aj6dxxzsmDTVnn9QS6kXE7PLxXbzJqtwySeZ1eNWKHLq';

async function main() {
  console.log('🔍 Finding all presale pass holders...\n');

  const connection = new Connection(MAINNET_RPC, 'confirmed');
  const mintPubkey = new PublicKey(PRESALE_PASS_MINT);

  // Get all token accounts for this mint
  const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      {
        dataSize: 165, // Token account size
      },
      {
        memcmp: {
          offset: 0, // Mint address offset
          bytes: mintPubkey.toBase58(),
        },
      },
    ],
  });

  console.log(`Found ${accounts.length} token accounts\n`);

  const snapshot = [];

  for (const account of accounts) {
    try {
      const accountInfo = await connection.getTokenAccountBalance(account.pubkey);
      const balance = accountInfo.value.uiAmount || 0;

      if (balance > 0) {
        // Parse token account to get owner
        const data = account.account.data;
        const owner = new PublicKey(data.slice(32, 64));

        snapshot.push({
          wallet: owner.toString(),
          passBalance: balance,
          snapshotAt: new Date().toISOString(),
        });

        console.log(`✅ ${owner.toString().slice(0, 8)}... has ${balance} pass(es)`);
      }
    } catch (error) {
      console.error('Error processing account:', error);
    }
  }

  // Save snapshot to file
  fs.writeFileSync(
    'presale-snapshot.json',
    JSON.stringify(snapshot, null, 2)
  );

  console.log(`\n📸 Snapshot saved to presale-snapshot.json`);
  console.log(`Total holders: ${snapshot.length}`);
  console.log(`Total passes: ${snapshot.reduce((sum, e) => sum + e.passBalance, 0)}`);

  // Also save just the wallet list for easy API call
  const walletList = snapshot.map(e => e.wallet);
  fs.writeFileSync(
    'presale-wallets.json',
    JSON.stringify(walletList, null, 2)
  );

  console.log(`\n✅ Wallet list saved to presale-wallets.json`);
  console.log(`\nTo activate snapshot, set in .env.local:`);
  console.log(`NEXT_PUBLIC_USE_SNAPSHOT=true`);
}

main().catch(console.error);
