import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { getDisplayName } from '@/hooks/useDisplayName'
import type { CapTableResponse } from '@/types'

interface ExportButtonsProps {
  capTable: CapTableResponse
  isHistorical?: boolean
  blockNumber?: number
}

export default function ExportButtons({ capTable, isHistorical = false, blockNumber }: ExportButtonsProps) {
  const getFilename = (extension: string) => {
    if (isHistorical && blockNumber) {
      const date = capTable.timestamp ? new Date(capTable.timestamp).toISOString().split('T')[0] : 'unknown'
      return `captable_block_${blockNumber}_${date}.${extension}`
    }
    return `captable_${Date.now()}.${extension}`
  }

  const downloadCSV = () => {
    const headers = ['Account Name', 'Address', 'Balance', 'Ownership %']
    if (isHistorical && blockNumber) {
      headers.push('Block Number')
    }
    
    const rows = capTable.capTable.map(entry => {
      const row = [
        getDisplayName(entry.address),
        entry.address,
        entry.balanceFormatted,
        entry.percentage + '%',
      ]
      if (isHistorical && blockNumber) {
        row.push(blockNumber.toString())
      }
      return row
    })
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = getFilename('csv')
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadJSON = () => {
    // Add account names to JSON export
    const enrichedCapTable = {
      ...capTable,
      ...(isHistorical && blockNumber ? { historicalBlockNumber: blockNumber } : {}),
      capTable: capTable.capTable.map(entry => ({
        accountName: getDisplayName(entry.address),
        ...entry,
      })),
    }
    
    const jsonContent = JSON.stringify(enrichedCapTable, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = getFilename('json')
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={downloadCSV}>
        <Download className="mr-2 h-4 w-4" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={downloadJSON}>
        <Download className="mr-2 h-4 w-4" />
        JSON
      </Button>
    </div>
  )
}

