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

interface BurnAllButtonProps {
  symbol: string
}

export default function BurnAllButton({ symbol }: BurnAllButtonProps) {
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
          <AlertDialogTitle>Are you sure you want to burn all {symbol} tokens?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>This operation is not reversible if you burn all tokens.</p>
            <p className="text-sm">This will burn all tokens from all current holders on the cap table, effectively resetting the total supply to zero.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-2 border-black">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleBurnAll} 
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Burning...' : 'Burn'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

