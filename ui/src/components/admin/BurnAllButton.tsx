import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { burnAllTokens } from '@/lib/api'
import { toast } from 'sonner'
import { Flame } from 'lucide-react'

export default function BurnAllButton() {
  const [loading, setLoading] = useState(false)

  const handleBurnAll = async () => {
    // Browser native confirmation dialog
    const confirmed = window.confirm(
      'Burn All Tokens?\n\n' +
      'This will burn ALL tokens from ALL holders, resetting the total supply to 0.\n\n' +
      'This action is IRREVERSIBLE and will be recorded on the blockchain.\n\n' +
      'Are you sure you want to continue?'
    )

    if (!confirmed) return

    setLoading(true)
    try {
      const result = await burnAllTokens()
      toast.success('All tokens burned successfully', {
        description: `${result.transactions.length} transactions executed`,
        duration: 8000,
        action: result.transactions.length > 0 ? {
          label: 'View First',
          onClick: () => window.open(`https://sepolia.basescan.org/tx/${result.transactions[0]}`, '_blank'),
        } : undefined,
      })
    } catch (error) {
      toast.error('Failed to burn tokens', {
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 6000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      className="gap-2"
      onClick={handleBurnAll}
      disabled={loading}
    >
      <Flame className="h-4 w-4" />
      {loading ? 'Burning...' : 'Burn All Tokens'}
    </Button>
  )
}

