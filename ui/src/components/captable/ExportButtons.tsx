import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { CapTableResponse } from '@/types'

interface ExportButtonsProps {
  capTable: CapTableResponse
}

// Map addresses to account names
const getAccountName = (address: string): string => {
  const addr = address.toLowerCase()
  
  // Known addresses
  const addressMap: Record<string, string> = {
    '0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6': 'Admin',
    '0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e': 'Investor A',
    '0xefd94a1534959e04630899abdd5d768601f4af5b': 'Investor B',
    '0x6264f29968e8fd2810cb79fb806ac65daf9db73d': 'Gnosis Safe',
  }
  
  return addressMap[addr] || 'Unknown Wallet'
}

export default function ExportButtons({ capTable }: ExportButtonsProps) {
  const downloadCSV = () => {
    const headers = ['Account Name', 'Address', 'Balance', 'Ownership %']
    const rows = capTable.capTable.map(entry => [
      getAccountName(entry.address),
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
        accountName: getAccountName(entry.address),
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

