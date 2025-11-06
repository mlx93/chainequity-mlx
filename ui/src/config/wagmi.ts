import { createConfig, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { metaMask } from '@wagmi/connectors'

const rpcUrl = import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'

// Ensure we're on client-side before initializing connectors
const isClient = typeof window !== 'undefined'

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: isClient
    ? [
        metaMask({
          dappMetadata: {
            name: 'ChainEquity',
            url: window.location.origin,
          },
        }),
      ]
    : [],
  transports: {
    [baseSepolia.id]: http(rpcUrl),
  },
  ssr: false, // Disable SSR for better MetaMask detection
})

