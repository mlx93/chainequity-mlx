import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mintTokens } from '@/lib/api'
import { toast } from 'sonner'
import { isAddress, parseUnits } from 'viem'
import { useApprovalStatus } from '@/hooks/useApprovalStatus'
import { Badge } from '@/components/ui/badge'

const mintSchema = z.object({
  to: z.string().refine(val => isAddress(val), 'Invalid Ethereum address'),
  amount: z.string().refine(val => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0
  }, 'Amount must be greater than 0'),
})

type MintFormData = z.infer<typeof mintSchema>

export default function MintForm() {
  const [toAddress, setToAddress] = useState<string>('')
  const { data: isApproved } = useApprovalStatus(toAddress as `0x${string}` | undefined)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MintFormData>({
    resolver: zodResolver(mintSchema),
  })

  const onSubmit = async (data: MintFormData) => {
    if (!isApproved) {
      toast.error('Recipient not approved', {
        description: 'Please approve the wallet before minting tokens',
        duration: 6000,
      })
      return
    }

    setLoading(true)
    try {
      const amountInWei = parseUnits(data.amount, 18).toString()
      const result = await mintTokens(data.to, amountInWei)
      toast.success('Tokens minted', {
        description: `Minted ${data.amount} tokens to ${data.to}`,
        duration: 6000,
        action: {
          label: 'View',
          onClick: () => window.open(result.blockExplorerUrl, '_blank'),
        },
      })
      reset()
      setToAddress('')
    } catch (error) {
      toast.error('Failed to mint tokens', {
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 6000,
      })
    } finally {
      setLoading(false)
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
            {isApproved ? (
              <Badge variant="default" className="text-xs">Approved</Badge>
            ) : (
              <p className="text-xs text-destructive">Wallet not approved</p>
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
            placeholder="1000"
            className="h-9 text-sm"
          />
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <Button type="submit" disabled={loading || !isApproved} className="w-full h-9 text-sm">
          {loading ? 'Minting...' : 'Mint Tokens'}
        </Button>
      </form>
    </div>
  )
}

