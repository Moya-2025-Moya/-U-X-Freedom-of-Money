import { createConfig, http } from 'wagmi';
import { bsc, mainnet } from 'viem/chains';
import { injected } from 'wagmi/connectors';

// Dedicated Alchemy RPC — reliable, no rate-limit surprises
const BSC_RPC = 'https://bnb-mainnet.g.alchemy.com/v2/TBTri88WcPoFSqH9luU86';

export const wagmiConfig = createConfig({
  chains: [bsc, mainnet],
  connectors: [injected()],
  transports: {
    [bsc.id]:     http(BSC_RPC),
    [mainnet.id]: http(),
  },
  ssr: true,
});
