import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
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
  const [toAddress, setToAddress] = useState<string>('')
  const { data: recipientApproved } = useApprovalStatus(toAddress as `0x${string}` | undefined)
  const { data: balance } = useBalance(address)
  
  const {
    writeContract,
    data: hash,
    isPending,
    error,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
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

  const onSubmit = async (data: TransferFormData) => {
    if (!recipientApproved) {
      toast.error('Recipient not approved', {
        description: 'The recipient wallet is not approved to receive tokens',
      })
      return
    }

    if (amountError) {
      toast.error('Invalid amount', {
        description: amountError,
      })
      return
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

  // Handle successful transfer
  if (isConfirmed && hash) {
    toast.success('Transfer successful', {
      description: `Transaction confirmed`,
      action: {
        label: 'View',
        onClick: () => window.open(getBlockExplorerUrl(hash, 84532), '_blank'),
      },
    })
    setTimeout(() => {
      reset()
      setToAddress('')
    }, 1000)
  }

  // Handle errors
  if (error) {
    toast.error('Transfer failed', {
      description: error.message,
    })
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
          disabled={isPending || isConfirming || !recipientApproved || !!amountError}
          className="w-full h-9 text-sm"
        >
          {isPending || isConfirming ? 'Processing...' : 'Transfer Tokens'}
        </Button>
      </form>
    </div>
  )
}

