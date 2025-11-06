import { useQuery } from '@tanstack/react-query'
import { getWalletInfo } from '@/lib/api'
import type { Address } from 'viem'

export function useWalletInfo(address?: Address) {
  return useQuery({
    queryKey: ['wallet', address],
    queryFn: () => getWalletInfo(address!),
    enabled: !!address,
  })
}

