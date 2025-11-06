import { useQuery } from '@tanstack/react-query'
import { getTransfers } from '@/lib/api'
import type { Address } from 'viem'

export function useTransactions(params?: {
  address?: Address
  limit?: number
  offset?: number
  fromBlock?: number
  toBlock?: number
}) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getTransfers(params ? {
      address: params.address,
      limit: params.limit,
      offset: params.offset,
      fromBlock: params.fromBlock,
      toBlock: params.toBlock,
    } : undefined),
    enabled: !!params?.address, // Only fetch if address is provided
    retry: 1, // Retry once if it fails (in case indexer is catching up)
    retryDelay: 2000, // Wait 2 seconds before retrying
    staleTime: 5000, // Consider data fresh for 5 seconds
  })
}

