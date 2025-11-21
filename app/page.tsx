import { WalletContextProvider } from '@/components/WalletContextProvider';
import MintPageNew from '@/components/MintPageNew';

export default function Home() {
  return (
    <WalletContextProvider>
      <MintPageNew />
    </WalletContextProvider>
  );
}
