import { useState, useEffect, useRef } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { isAddress, parseUnits, formatUnits } from 'viem'
import { CONTRACT_ADDRESS, GatedTokenABI } from '@/config/contracts'
import { useApprovalStatus } from '@/hooks/useApprovalStatus'
import { useBalance } from '@/hooks/useBalance'
import { getBlockExplorerUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const transferSchema = z.object({
  to: z.string().refine(val => isAddress(val), 'Invalid Ethereum address'),
  amount: z.string().refine(val => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0
  }, 'Amount must be greater than 0'),
})

type TransferFormData = z.infer<typeof transferSchema>

export default function TransferForm() {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const [toAddress, setToAddress] = useState<string>('')
  const [showInlineError, setShowInlineError] = useState(false)
  const { data: recipientApproved } = useApprovalStatus(toAddress as `0x${string}` | undefined)
  const { data: balance, refetch: refetchBalance } = useBalance(address)
  const hasShownToast = useRef(false)
  
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset: resetWrite,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isReverted, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  })

  const amount = watch('amount')
  const amountError = amount && balance 
    ? parseFloat(amount) > parseFloat(formatUnits(balance as bigint, 18))
      ? 'Insufficient balance'
      : undefined
    : undefined

  // Handle successful transfer
  useEffect(() => {
    if (isConfirmed && hash && !hasShownToast.current) {
      hasShownToast.current = true
      toast.success('Transfer successful', {
        description: `Transaction confirmed`,
        duration: 6000,
        action: {
          label: 'View',
          onClick: () => window.open(getBlockExplorerUrl(hash, 84532), '_blank'),
        },
      })
      
      // Refresh balance, transaction history, and reset form
      setTimeout(() => {
        refetchBalance()
        // Invalidate transaction queries to refresh the history (only for this address)
        if (address) {
          queryClient.invalidateQueries({ 
            queryKey: ['transactions', { address }] 
          })
        }
        reset()
        setToAddress('')
        resetWrite()
        hasShownToast.current = false
      }, 1000)
    }
  }, [isConfirmed, hash, refetchBalance, reset, resetWrite, queryClient, address])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error('Transfer failed on-chain', {
        description: error.message,
        duration: 8000,
        action: hash ? {
          label: 'View on BaseScan',
          onClick: () => window.open(getBlockExplorerUrl(hash, 84532), '_blank'),
        } : undefined,
      })
    }
  }, [error, hash])

  // Handle reverted transactions (failed on-chain after mining)
  useEffect(() => {
    if (isReverted && hash && !hasShownToast.current) {
      hasShownToast.current = true
      setShowInlineError(true)
      toast.error('Transaction failed - Recipient not approved', {
        description: 'The smart contract rejected this transfer because the recipient wallet is not on the allowlist.',
        duration: 8000,
        action: {
          label: 'View on BaseScan',
          onClick: () => window.open(getBlockExplorerUrl(hash, 84532), '_blank'),
        },
      })
      
      // Reset form after a delay
      setTimeout(() => {
        reset()
        setToAddress('')
        resetWrite()
        setShowInlineError(false)
        hasShownToast.current = false
      }, 8000)
    }
  }, [isReverted, hash, receiptError, reset, resetWrite])

  const onSubmit = async (data: TransferFormData) => {
    if (amountError) {
      toast.error('Invalid amount', {
        description: amountError,
        duration: 6000,
      })
      return
    }

    // Warn about unapproved recipient, but allow transaction to proceed (for demo purposes)
    if (!recipientApproved) {
      toast.warning('Recipient not approved', {
        description: 'Transaction will be submitted but will fail on-chain. Check BaseScan for revert reason.',
        duration: 8000,
      })
    }

    try {
      const amountInWei = parseUnits(data.amount, 18)
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: GatedTokenABI,
        functionName: 'transfer',
        args: [data.to as `0x${string}`, amountInWei],
      })
    } catch (err) {
      toast.error('Transfer failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
        duration: 6000,
      })
    }
  }

  const checkAddress = () => {
    const addr = (document.getElementById('to') as HTMLInputElement)?.value
    if (addr && isAddress(addr)) {
      setToAddress(addr)
    } else {
      setToAddress('')
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="to" className="text-xs">Recipient Address</Label>
          <Input
            id="to"
            {...register('to')}
            placeholder="0x..."
            className="h-9 text-sm"
            onChange={(e) => {
              register('to').onChange(e)
              checkAddress()
            }}
          />
          {errors.to && (
            <p className="text-xs text-destructive">{errors.to.message}</p>
          )}
        </div>

        {toAddress && isAddress(toAddress) && (
          <div>
            {recipientApproved ? (
              <Badge variant="default" className="text-xs">Recipient Approved</Badge>
            ) : (
              <p className="text-xs text-destructive">
                Recipient wallet is not approved. Transfer will fail on-chain.
              </p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="amount" className="text-xs">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.000001"
            {...register('amount')}
            placeholder="100"
            className="h-9 text-sm"
          />
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount.message}</p>
          )}
          {amountError && (
            <p className="text-xs text-destructive">{amountError}</p>
          )}
          {balance !== undefined && balance !== null && (
            <p className="text-xs text-muted-foreground">
              Available: {formatUnits(balance as bigint, 18)}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending || isConfirming || !!amountError}
          className="w-full h-9 text-sm"
        >
          {isPending || isConfirming ? 'Processing...' : 'Transfer Tokens'}
        </Button>

        {showInlineError && (
          <div className="rounded-md bg-destructive/10 border border-destructive p-3">
            <p className="text-sm font-medium text-destructive">
              ⚠️ Transaction failed - Recipient not approved
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              Check the notification above for BaseScan link.
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

