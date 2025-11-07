import { useQuery } from '@tanstack/react-query'
import { getHistoricalCapTable } from '@/lib/api'

export function useHistoricalCapTable(blockNumber: number | null) {
  return useQuery({
    queryKey: ['historicalCapTable', blockNumber],
    queryFn: () => {
      if (!blockNumber) {
        return null
      }
      return getHistoricalCapTable(blockNumber)
    },
    enabled: !!blockNumber,
    staleTime: Infinity, // Historical data never changes
    retry: 1,
  })
}

