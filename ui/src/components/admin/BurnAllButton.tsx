import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { burnAllTokens } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'

export default function BurnAllButton() {
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const handleBurnAll = async () => {
    setLoading(true)
    try {
      const result = await burnAllTokens()
      if (result.success) {
        toast.success('All tokens burned successfully', {
          description: `${result.transactions.length} transactions executed`,
          duration: 8000,
          action: result.transactions.length > 0 ? {
            label: 'View First Tx',
            onClick: () => window.open(`https://sepolia.basescan.org/tx/${result.transactions[0]}`, '_blank'),
          } : undefined,
        })
        // Invalidate relevant queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['cap-table'] })
        queryClient.invalidateQueries({ queryKey: ['balances'] })
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
      } else {
        toast.error('Failed to burn all tokens', {
          description: result.message || 'Unknown error',
          duration: 8000,
        })
      }
    } catch (error) {
      toast.error('Failed to burn all tokens', {
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 8000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={loading}>
          {loading ? 'Burning...' : 'Burn All Tokens'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will burn all tokens from all current holders on the cap table, effectively resetting the total supply to zero.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBurnAll} disabled={loading}>
            {loading ? 'Burning...' : 'Yes, Burn All Tokens'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

