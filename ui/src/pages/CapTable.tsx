import { useState } from 'react'
import { useCapTable } from '@/hooks/useCapTable'
import { useHistoricalCapTable } from '@/hooks/useHistoricalCapTable'
import CapTableGrid from '@/components/captable/CapTableGrid'
import ExportButtons from '@/components/captable/ExportButtons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function CapTable() {
  const { data: currentCapTable, isLoading: isLoadingCurrent, error: currentError } = useCapTable()
  const [viewMode, setViewMode] = useState<'current' | 'historical'>('current')
  const [blockNumberInput, setBlockNumberInput] = useState('')
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null)
  
  const { data: historicalCapTable, isLoading: isLoadingHistorical, error: historicalError } = useHistoricalCapTable(selectedBlock)
  
  const [sortBy, setSortBy] = useState<'balance' | 'address'>('balance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Determine which data to display
  const capTable = viewMode === 'historical' && historicalCapTable 
    ? {
        totalSupply: historicalCapTable.totalSupply,
        totalHolders: historicalCapTable.holderCount,
        blockNumber: historicalCapTable.blockNumber,
        timestamp: historicalCapTable.timestamp,
        capTable: historicalCapTable.capTable,
        splitMultiplier: historicalCapTable.splitMultiplier,
      }
    : currentCapTable

  const isLoading = viewMode === 'historical' ? isLoadingHistorical : isLoadingCurrent
  const error = viewMode === 'historical' ? historicalError : currentError

  const handleQueryHistorical = () => {
    const blockNum = parseInt(blockNumberInput, 10)
    if (!isNaN(blockNum) && blockNum > 0) {
      setSelectedBlock(blockNum)
      setViewMode('historical')
    }
  }

  const handleBackToCurrent = () => {
    setViewMode('current')
    setSelectedBlock(null)
    setBlockNumberInput('')
  }

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
        <p className="text-muted-foreground">
          {viewMode === 'historical' 
            ? `Historical snapshot at block ${selectedBlock?.toLocaleString() ?? 'N/A'}`
            : 'Current token holders'
          }
        </p>
      </div>

      {/* Version Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Version</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="version-select" className="text-xs">View Mode</Label>
              <Select 
                value={viewMode} 
                onValueChange={(value: string) => {
                  if (value === 'current') {
                    handleBackToCurrent()
                  }
                  setViewMode(value as 'current' | 'historical')
                }}
              >
                <SelectTrigger id="version-select" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="historical">Historical (enter block number)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {viewMode === 'historical' && (
              <>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="block-input" className="text-xs">Block Number</Label>
                  <Input
                    id="block-input"
                    type="number"
                    placeholder="e.g. 33313400"
                    value={blockNumberInput}
                    onChange={(e) => setBlockNumberInput(e.target.value)}
                    className="h-9"
                    min="33313307"
                  />
                </div>
                <Button onClick={handleQueryHistorical} className="h-9">
                  Query
                </Button>
              </>
            )}
          </div>

          {viewMode === 'historical' && selectedBlock && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Viewing snapshot at block {selectedBlock.toLocaleString()}
                {historicalCapTable?.timestamp && (
                  <> ({new Date(historicalCapTable.timestamp).toLocaleString()})</>
                )}
              </p>
              <Button variant="outline" size="sm" onClick={handleBackToCurrent}>
                Back to Current
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Token Holders</CardTitle>
              <CardDescription>
                Updated at {capTable.timestamp ? new Date(capTable.timestamp).toLocaleString() : 'N/A'}
              </CardDescription>
            </div>
            <ExportButtons 
              capTable={capTable} 
              isHistorical={viewMode === 'historical'}
              blockNumber={selectedBlock ?? undefined}
            />
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

