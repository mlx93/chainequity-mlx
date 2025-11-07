import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, GatedTokenABI } from '@/config/contracts'

export function useTokenInfo() {
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'name',
  })

  const { data: symbol, refetch: refetchSymbol } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'symbol',
  })

  return {
    name: name as string | undefined,
    symbol: symbol as string | undefined,
    refetchSymbol,
  }
}

