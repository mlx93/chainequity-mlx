import { useState } from 'react'
import { useCapTable } from '@/hooks/useCapTable'
import CapTableGrid from '@/components/captable/CapTableGrid'
import ExportButtons from '@/components/captable/ExportButtons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function CapTable() {
  const { data: capTable, isLoading } = useCapTable()
  const [sortBy, setSortBy] = useState<'balance' | 'address'>('balance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!capTable) {
    return <div>Failed to load cap table</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cap Table</h1>
        <p className="text-muted-foreground">
          Current token holders as of block {capTable.blockNumber.toLocaleString()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Supply</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(parseFloat(capTable.totalSupply) / 1e18).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Holders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{capTable.holderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Block Number</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{capTable.blockNumber.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Token Holders</CardTitle>
              <CardDescription>
                Updated at {new Date(capTable.timestamp).toLocaleString()}
              </CardDescription>
            </div>
            <ExportButtons capTable={capTable} />
          </div>
        </CardHeader>
        <CardContent>
          <CapTableGrid
            capTable={capTable}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(by, order) => {
              setSortBy(by)
              setSortOrder(order)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

