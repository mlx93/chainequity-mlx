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
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (!data || data.transfers.length === 0) {
    return <p className="text-sm text-muted-foreground">No transactions yet</p>
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="max-h-[400px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">From</TableHead>
              <TableHead className="text-xs">To</TableHead>
              <TableHead className="text-xs text-right">Amount</TableHead>
              <TableHead className="text-xs">Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.transfers.map((transfer) => (
              <TableRow key={transfer.transactionHash} className="hover:bg-muted/50">
                <TableCell className="text-xs whitespace-nowrap">
                  {new Date(transfer.blockTimestamp).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    transfer.type === 'mint' ? 'bg-green-100 text-green-800' :
                    transfer.type === 'burn' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {transfer.type}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {formatAddress(transfer.from)}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {formatAddress(transfer.to)}
                </TableCell>
                <TableCell className="text-xs text-right font-medium">
                  {transfer.amountFormatted}
                </TableCell>
                <TableCell>
                  <a
                    href={getBlockExplorerUrl(transfer.transactionHash, 84532)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {formatAddress(transfer.transactionHash, 4)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

