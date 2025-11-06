import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, GatedTokenABI } from '@/config/contracts'
import type { Address } from 'viem'

export function useBalance(address?: Address) {
  return useReadContract({
    address: CONTRACT_ADDRESS as Address,
    abi: GatedTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}

