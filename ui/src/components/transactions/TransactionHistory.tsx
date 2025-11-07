import { useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatAddress, getBlockExplorerUrl } from '@/lib/utils'
import type { Address } from 'viem'
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'

interface TransactionHistoryProps {
  address?: Address
}

export default function TransactionHistory({ address }: TransactionHistoryProps) {
  const [page, setPage] = useState(1)
  const limit = 15
  
  const { data, isLoading, isError, error } = useTransactions({ 
    address, 
    page,
    limit 
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    console.error('Transaction fetch error:', error)
    return <p className="text-sm text-muted-foreground">Unable to load transactions. Please refresh the page.</p>
  }

  if (!data || data.transfers.length === 0) {
    return <p className="text-sm text-muted-foreground">No transactions yet</p>
  }

  const { pagination } = data
  const showPagination = pagination.totalPages > 1
  const startRecord = (pagination.currentPage - 1) * pagination.limit + 1
  const endRecord = Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right pl-12">Amount</TableHead>
              <TableHead className="pl-8">Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.transfers.map((transfer) => (
              <TableRow key={transfer.transactionHash} className="hover:bg-muted/50">
                <TableCell className="whitespace-nowrap">
                  {new Date(transfer.blockTimestamp).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    transfer.type === 'mint' ? 'bg-green-100 text-green-800' :
                    transfer.type === 'burn' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {transfer.type}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatAddress(transfer.from)}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatAddress(transfer.to)}
                </TableCell>
                <TableCell className="text-right font-medium pl-12">
                  {transfer.amountFormatted}
                </TableCell>
                <TableCell className="pl-8">
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

      {showPagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {startRecord}-{endRecord} of {pagination.totalRecords}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

