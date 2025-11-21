import { WalletContextProvider } from '@/components/WalletContextProvider';
import MintPageUmi from '@/components/MintPageUmi';

export default function MainnetTestPage() {
  return (
    <WalletContextProvider>
      <MintPageUmi />
    </WalletContextProvider>
  );
}
