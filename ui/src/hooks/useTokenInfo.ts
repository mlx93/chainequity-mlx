import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS } from '@/config/contracts'
import GatedTokenABI from '@/abis/GatedToken.json'

export function useTokenInfo() {
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI.abi,
    functionName: 'name',
  })

  const { data: symbol, refetch: refetchSymbol } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI.abi,
    functionName: 'symbol',
  })

  return {
    name: name as string | undefined,
    symbol: symbol as string | undefined,
    refetchSymbol,
  }
}

