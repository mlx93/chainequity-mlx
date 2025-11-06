import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatAddress } from '@/lib/utils'
import type { CapTableResponse } from '@/types'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CapTableGridProps {
  capTable: CapTableResponse
  sortBy: 'balance' | 'address'
  sortOrder: 'asc' | 'desc'
  onSortChange: (by: 'balance' | 'address', order: 'asc' | 'desc') => void
}

export default function CapTableGrid({
  capTable,
  sortBy,
  sortOrder,
  onSortChange,
}: CapTableGridProps) {
  const sortedCapTable = [...capTable.capTable].sort((a, b) => {
    if (sortBy === 'balance') {
      const diff = BigInt(a.balance) - BigInt(b.balance)
      return sortOrder === 'desc' ? Number(-diff) : Number(diff)
    } else {
      const diff = a.address.localeCompare(b.address)
      return sortOrder === 'desc' ? -diff : diff
    }
  })

  const handleSort = (column: 'balance' | 'address') => {
    if (sortBy === column) {
      onSortChange(column, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      onSortChange(column, 'desc')
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('address')}
                className="h-8 px-2"
              >
                Address
                {sortBy === 'address' ? (
                  sortOrder === 'asc' ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-2 h-4 w-4" />
                  )
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('balance')}
                className="h-8 px-2"
              >
                Balance
                {sortBy === 'balance' ? (
                  sortOrder === 'asc' ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-2 h-4 w-4" />
                  )
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </TableHead>
            <TableHead>Ownership %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCapTable.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No holders found
              </TableCell>
            </TableRow>
          ) : (
            sortedCapTable.map((entry) => (
              <TableRow key={entry.address}>
                <TableCell className="font-mono text-sm">
                  {formatAddress(entry.address)}
                </TableCell>
                <TableCell>
                  {(parseFloat(entry.balance) / 1e18).toLocaleString()}
                </TableCell>
                <TableCell>
                  {parseFloat(entry.ownershipPercent).toFixed(4)}%
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

