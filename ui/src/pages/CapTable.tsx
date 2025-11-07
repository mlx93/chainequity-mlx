import { useState, useEffect } from 'react'
import { useCapTable } from '@/hooks/useCapTable'
import { useHistoricalCapTable } from '@/hooks/useHistoricalCapTable'
import { useQuery } from '@tanstack/react-query'
import { getCapTableSnapshots } from '@/lib/api'
import CapTableGrid from '@/components/captable/CapTableGrid'
import ExportButtons from '@/components/captable/ExportButtons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function CapTable() {
  const { data: currentCapTable, isLoading: isLoadingCurrent, error: currentError } = useCapTable()
  const { data: snapshotsData } = useQuery({
    queryKey: ['capTableSnapshots'],
    queryFn: getCapTableSnapshots,
    staleTime: 60000, // Cache for 1 minute
  })
  
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>('current')
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null)
  
  const { data: historicalCapTable, isLoading: isLoadingHistorical, error: historicalError } = useHistoricalCapTable(selectedBlock)
  
  const [sortBy, setSortBy] = useState<'balance' | 'address'>('balance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Update selected block when snapshot changes
  useEffect(() => {
    if (selectedSnapshotId === 'current') {
      setSelectedBlock(null)
    } else {
      const blockNum = parseInt(selectedSnapshotId, 10)
      if (!isNaN(blockNum)) {
        setSelectedBlock(blockNum)
      }
    }
  }, [selectedSnapshotId])

  // Determine which data to display
  const isHistorical = selectedSnapshotId !== 'current'
  const capTable = isHistorical && historicalCapTable 
    ? {
        totalSupply: historicalCapTable.totalSupply,
        totalHolders: historicalCapTable.holderCount,
        blockNumber: historicalCapTable.blockNumber,
        timestamp: historicalCapTable.timestamp,
        capTable: historicalCapTable.capTable,
        splitMultiplier: historicalCapTable.splitMultiplier,
      }
    : currentCapTable

  const isLoading = isHistorical ? isLoadingHistorical : isLoadingCurrent
  const error = isHistorical ? historicalError : currentError

  const selectedSnapshot = snapshotsData?.snapshots.find(s => s.blockNumber.toString() === selectedSnapshotId)

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

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cap Table</h1>
          <p className="text-muted-foreground">Current token holders</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-destructive font-semibold">Failed to load cap table</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Unable to fetch data from backend'}
              </p>
              <p className="text-xs text-muted-foreground">
                Make sure the backend API is running and accessible
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!capTable || !capTable.capTable || capTable.capTable.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cap Table</h1>
          <p className="text-muted-foreground">Current token holders</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No token holders found</p>
              <p className="text-xs text-muted-foreground">
                Tokens haven't been minted yet or the indexer hasn't processed any transfers
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cap Table</h1>
        <p className="text-muted-foreground">View current and historical ownership distribution</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Supply</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {capTable.totalSupply ? (parseFloat(capTable.totalSupply) / 1e18).toLocaleString() : '0'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Holders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{capTable.totalHolders ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Block Number</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{capTable.blockNumber?.toLocaleString() ?? 'N/A'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="mb-3">Token Holders</CardTitle>
              <CardDescription>
                {isHistorical && selectedSnapshot
                  ? `Snapshot from ${new Date(selectedSnapshot.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}`
                  : `Updated at ${capTable?.timestamp ? new Date(capTable.timestamp).toLocaleString() : 'N/A'}`
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="snapshot-select" className="text-sm text-muted-foreground whitespace-nowrap">
                  Version:
                </Label>
                <Select 
                  value={selectedSnapshotId} 
                  onValueChange={setSelectedSnapshotId}
                >
                  <SelectTrigger id="snapshot-select" className="h-9 w-[240px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current</SelectItem>
                    {snapshotsData?.snapshots.map((snapshot) => (
                      <SelectItem key={snapshot.blockNumber} value={snapshot.blockNumber.toString()}>
                        {new Date(snapshot.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {snapshot.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col items-end gap-1">
                <ExportButtons 
                  capTable={capTable!} 
                  isHistorical={isHistorical}
                  blockNumber={selectedBlock ?? undefined}
                />
                {isHistorical && selectedSnapshot && (
                  <span className="text-xs text-muted-foreground">
                    Block {selectedSnapshot.blockNumber.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
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

