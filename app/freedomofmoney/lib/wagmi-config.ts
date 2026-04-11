import { createConfig, http } from 'wagmi';
import { bsc, mainnet } from 'viem/chains';
import { injected } from 'wagmi/connectors';

// Public RPC for client-side reads (balance checks, tx confirmations)
// Server-side verification uses dedicated RPC via BSC_RPC_URL env var
const BSC_RPC = 'https://bsc-dataseed1.bnbchain.org';

export const wagmiConfig = createConfig({
  chains: [bsc, mainnet],
  connectors: [injected()],
  transports: {
    [bsc.id]:     http(BSC_RPC),
    [mainnet.id]: http(),
  },
  ssr: true,
});
