import { createConfig, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { metaMask } from '@wagmi/connectors'

const rpcUrl = import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'ChainEquity',
      },
    }),
  ],
  transports: {
    [baseSepolia.id]: http(rpcUrl),
  },
  ssr: false, // Disable SSR for better MetaMask detection
})

