import { FC, ReactNode } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiProvider, http } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig } from 'wagmi';

// WalletConnect Project ID
const projectId = '36f5ee8da67825bfd8a1329ca2698cdf';

// Infura API configuration for BSC
const infuraApiKey = 'a872d3182c044328b1ea37582d3d3331';

// Create wagmi config with BSC mainnet
const config = createConfig({
  chains: [bsc],
  transports: {
    [bsc.id]: http(`https://bsc-mainnet.infura.io/v3/${infuraApiKey}`),
  },
  connectors: [
    walletConnect({ projectId, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: 'Crypto Charity Donation',
      appLogoUrl: '/pill.svg',
    }),
  ],
});

// Create Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#1aaa5e',
    '--w3m-border-radius-master': '12px',
  },
});

const queryClient = new QueryClient();

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
