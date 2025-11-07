import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatAddress } from '@/lib/utils'
import { getDisplayName } from '@/hooks/useDisplayName'
import type { CapTableResponse } from '@/types'
import { ArrowUpDown, ArrowUp, ArrowDown, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

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
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      toast.success('Address copied to clipboard', { duration: 2000 })
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (error) {
      toast.error('Failed to copy address', { duration: 2000 })
    }
  }

  const sortedCapTable = [...(capTable?.capTable || [])].sort((a, b) => {
    if (sortBy === 'balance') {
      try {
        const balanceA = a?.balance ? BigInt(String(a.balance)) : BigInt(0)
        const balanceB = b?.balance ? BigInt(String(b.balance)) : BigInt(0)
        const diff = balanceA - balanceB
        return sortOrder === 'desc' ? Number(-diff) : Number(diff)
      } catch {
        return 0
      }
    } else {
      const diff = (a?.address || '').localeCompare(b?.address || '')
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
            <TableHead>Account Name</TableHead>
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
            <TableHead className="pl-2">
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
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No holders found
              </TableCell>
            </TableRow>
          ) : (
            sortedCapTable.map((entry) => {
              // Defensive parsing with fallbacks
              const balanceValue = entry?.balance ? parseFloat(String(entry.balance)) : 0
              const balanceNum = isNaN(balanceValue) || !isFinite(balanceValue) ? 0 : balanceValue / 1e18
              const balance = typeof balanceNum === 'number' && !isNaN(balanceNum) ? balanceNum : 0
              
              const ownershipValue = entry?.percentage ? parseFloat(String(entry.percentage)) : 0
              const ownership = isNaN(ownershipValue) || !isFinite(ownershipValue) ? 0 : ownershipValue
              
              return (
                <TableRow key={entry?.address || 'unknown'}>
                  <TableCell className="font-medium">
                    {getDisplayName(entry?.address || '')}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <span>{formatAddress(entry?.address || '')}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyAddress(entry?.address || '')}
                        className="h-6 w-6 p-0"
                      >
                        {copiedAddress === entry?.address ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="pl-4">
                    {balance?.toLocaleString?.() ?? '0'}
                  </TableCell>
                  <TableCell>
                    {ownership?.toFixed?.(2) ?? '0.00'}%
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

