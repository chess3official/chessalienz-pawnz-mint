import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import type { Metadata } from "next";
import { presaleSnapshot } from "@/lib/presaleSnapshot";
import fs from 'fs';
import path from 'path';

export const metadata: Metadata = {
  title: "Pawnz Mint",
  description: "Mint your Pawnz NFT",
};

// Load snapshot on server start
if (typeof window === 'undefined') {
  try {
    const snapshotPath = path.join(process.cwd(), 'presale-snapshot.json');
    if (fs.existsSync(snapshotPath)) {
      const snapshotData = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
      presaleSnapshot.loadFromJSON(snapshotData);
      console.log('✅ Presale snapshot loaded');
    }
  } catch (error) {
    console.error('Failed to load snapshot:', error);
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
