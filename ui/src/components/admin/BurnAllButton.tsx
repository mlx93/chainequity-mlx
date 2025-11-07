import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { burnAllTokens } from '@/lib/api'
import { toast } from 'sonner'
import { Flame } from 'lucide-react'
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

export default function BurnAllButton() {
  const [loading, setLoading] = useState(false)

  const handleBurnAll = async () => {
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <Flame className="h-4 w-4" />
          Burn All Tokens
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Burn All Tokens?</AlertDialogTitle>
          <AlertDialogDescription>
            This will burn ALL tokens from ALL holders, resetting the total supply to 0.
            This action is <strong>irreversible</strong> and will be recorded on the blockchain.
            <br /><br />
            Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBurnAll} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {loading ? 'Burning...' : 'Yes, Burn All Tokens'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

