import { createConfig, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { metaMask } from '@wagmi/connectors'

const rpcUrl = import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [metaMask()],
  transports: {
    [baseSepolia.id]: http(rpcUrl),
  },
})

