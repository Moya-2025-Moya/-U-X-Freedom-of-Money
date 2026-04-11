import { createConfig, http } from 'wagmi';
import { bsc, mainnet } from 'viem/chains';
import { injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [bsc, mainnet],
  connectors: [injected()],
  transports: {
    [bsc.id]:     http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});
