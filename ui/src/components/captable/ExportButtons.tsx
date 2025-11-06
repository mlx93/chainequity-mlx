import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { getDisplayName } from '@/hooks/useDisplayName'
import type { CapTableResponse } from '@/types'

interface ExportButtonsProps {
  capTable: CapTableResponse
}

export default function ExportButtons({ capTable }: ExportButtonsProps) {
  const downloadCSV = () => {
    const headers = ['Account Name', 'Address', 'Balance', 'Ownership %']
    const rows = capTable.capTable.map(entry => [
      getDisplayName(entry.address),
      entry.address,
      entry.balanceFormatted,
      entry.percentage + '%',
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `captable_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadJSON = () => {
    // Add account names to JSON export as well
    const enrichedCapTable = {
      ...capTable,
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
    a.download = `captable_${Date.now()}.json`
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

