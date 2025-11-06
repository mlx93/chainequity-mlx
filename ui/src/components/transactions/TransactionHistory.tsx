import { useTransactions } from '@/hooks/useTransactions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatAddress, getBlockExplorerUrl } from '@/lib/utils'
import type { Address } from 'viem'
import { ExternalLink } from 'lucide-react'

interface TransactionHistoryProps {
  address?: Address
}

export default function TransactionHistory({ address }: TransactionHistoryProps) {
  const { data, isLoading } = useTransactions({ address, limit: 20 })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!data || data.transfers.length === 0) {
    return <p className="text-sm text-muted-foreground">No transactions found</p>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Hash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.transfers.map((transfer) => (
            <TableRow key={transfer.transactionHash}>
              <TableCell className="text-sm">
                {new Date(transfer.timestamp).toLocaleString()}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-semibold">
                  {transfer.eventType}
                </span>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {formatAddress(transfer.from)}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {formatAddress(transfer.to)}
              </TableCell>
              <TableCell>
                {(parseFloat(transfer.amount) / 1e18).toLocaleString()}
              </TableCell>
              <TableCell>
                <a
                  href={getBlockExplorerUrl(transfer.transactionHash, 84532)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {formatAddress(transfer.transactionHash, 6)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

