import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useApprovalStatus } from '@/hooks/useApprovalStatus'
import { ADMIN_ADDRESSES } from '@/config/contracts'
import BalanceCard from '@/components/investor/BalanceCard'
import TransferForm from '@/components/investor/TransferForm'
import TransactionHistory from '@/components/transactions/TransactionHistory'
import DisplayNameEditor from '@/components/profile/DisplayNameEditor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function InvestorView() {
  const { address } = useAccount()
  const navigate = useNavigate()
  const { data: isApproved } = useApprovalStatus(address)
  const isAdmin = address && ADMIN_ADDRESSES.includes(address.toLowerCase())

  // Redirect admins to their dashboard
  useEffect(() => {
    if (isAdmin) {
      navigate('/', { replace: true })
    }
  }, [isAdmin, navigate])

  if (!address) {
    return <div>Please connect your wallet</div>
  }

  if (isAdmin) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="space-y-6">
      {/* Header with Portfolio on left, name centered, badge on right */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-foreground mb-3">Portfolio</h1>
          <p className="text-base text-muted-foreground">Manage your token holdings</p>
        </div>
        <div className="flex-1 flex justify-center items-start pt-1">
          <DisplayNameEditor />
        </div>
        <div className="flex-1 flex justify-end items-start pt-1">
          {isApproved ? (
            <Badge variant="default">✓ Approved</Badge>
          ) : (
            <Badge variant="secondary">Pending Approval</Badge>
          )}
        </div>
      </div>

      {/* Top Row: Balance and Transfer side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        <BalanceCard />
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Transfer Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <TransferForm />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Transaction History full width */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionHistory address={address} />
        </CardContent>
      </Card>
    </div>
  )
}

