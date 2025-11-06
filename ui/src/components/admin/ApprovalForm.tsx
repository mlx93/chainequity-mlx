import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { approveWallet, revokeWallet } from '@/lib/api'
import { toast } from 'sonner'
import { isAddress } from 'viem'
import { useApprovalStatus } from '@/hooks/useApprovalStatus'
import { Badge } from '@/components/ui/badge'

const approvalSchema = z.object({
  address: z.string().refine(val => isAddress(val), 'Invalid Ethereum address'),
})

type ApprovalFormData = z.infer<typeof approvalSchema>

export default function ApprovalForm() {
  const [address, setAddress] = useState<string>('')
  const { data: isApproved, refetch } = useApprovalStatus(address as `0x${string}` | undefined)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
  })

  const onSubmit = async (data: ApprovalFormData) => {
    setLoading(true)
    try {
      const result = await approveWallet(data.address)
      toast.success('Wallet approved', {
        description: `Transaction: ${result.transactionHash}`,
        action: {
          label: 'View',
          onClick: () => window.open(result.blockExplorerUrl, '_blank'),
        },
      })
      reset()
      setAddress('')
      refetch()
    } catch (error) {
      toast.error('Failed to approve wallet', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async () => {
    if (!address || !isAddress(address)) return
    setLoading(true)
    try {
      const result = await revokeWallet(address)
      toast.success('Wallet revoked', {
        description: `Transaction: ${result.transactionHash}`,
        action: {
          label: 'View',
          onClick: () => window.open(result.blockExplorerUrl, '_blank'),
        },
      })
      reset()
      setAddress('')
      refetch()
    } catch (error) {
      toast.error('Failed to revoke wallet', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = () => {
    const addr = (document.getElementById('address') as HTMLInputElement)?.value
    if (addr && isAddress(addr)) {
      setAddress(addr)
    } else {
      setAddress('')
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-xs">Wallet Address</Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="0x..."
            className="h-9 text-sm"
            onChange={(e) => {
              register('address').onChange(e)
              checkStatus()
            }}
          />
          {errors.address && (
            <p className="text-xs text-destructive">{errors.address.message}</p>
          )}
        </div>

        {address && isAddress(address) && (
          <div className="flex items-center gap-2">
            {isApproved === true ? (
              <Badge variant="default" className="text-xs">Approved</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">Not Approved</Badge>
            )}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full h-9 text-sm">
          {loading ? 'Approving...' : 'Approve Wallet'}
        </Button>
        {isApproved === true && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRevoke}
            disabled={loading}
            className="w-full h-9 text-sm"
          >
            Revoke
          </Button>
        )}
      </form>
    </div>
  )
}

