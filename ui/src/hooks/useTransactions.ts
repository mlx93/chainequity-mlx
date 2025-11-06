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
  })
}

