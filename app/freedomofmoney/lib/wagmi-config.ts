import { createConfig, http } from 'wagmi';
import { bsc } from 'viem/chains';
import { injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [bsc],
  connectors: [injected()],          // MetaMask and any injected wallet
  transports: { [bsc.id]: http() },  // Public BNB Chain RPC
  ssr: true,
});
