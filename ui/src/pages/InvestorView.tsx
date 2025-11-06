import { useAccount } from 'wagmi'
import { useApprovalStatus } from '@/hooks/useApprovalStatus'
import BalanceCard from '@/components/investor/BalanceCard'
import TransferForm from '@/components/investor/TransferForm'
import TransactionHistory from '@/components/transactions/TransactionHistory'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function InvestorView() {
  const { address } = useAccount()
  const { data: isApproved } = useApprovalStatus(address)

  if (!address) {
    return <div>Please connect your wallet</div>
  }

  return (
    <div className="space-y-4">
      {/* Header with status badge inline */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-muted-foreground">Manage your token holdings</p>
        </div>
        {isApproved ? (
          <Badge variant="default">✓ Approved</Badge>
        ) : (
          <Badge variant="secondary">Pending Approval</Badge>
        )}
      </div>

      {/* Two-column layout: Left = Balance + Transfer, Right = History */}
      <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
        {/* Left Column: Balance and Transfer in compact vertical stack */}
        <div className="space-y-4">
          <BalanceCard />
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Transfer Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <TransferForm />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Transaction History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recent Activity</CardTitle>
            <CardDescription className="text-xs">Your transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistory address={address} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

