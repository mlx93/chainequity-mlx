import { useQuery } from '@tanstack/react-query'
import { getCapTable } from '@/lib/api'

export function useCapTable() {
  return useQuery({
    queryKey: ['capTable'],
    queryFn: () => getCapTable(),
    refetchInterval: 5000, // Refresh every 5 seconds
  })
}

