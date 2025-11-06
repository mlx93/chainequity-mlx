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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Investor Dashboard</h1>
        <p className="text-muted-foreground">View your balance and transfer tokens</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">Wallet Status:</span>
        {isApproved ? (
          <Badge variant="default">Approved</Badge>
        ) : (
          <Badge variant="secondary">Not Approved</Badge>
        )}
        {!isApproved && (
          <p className="text-sm text-muted-foreground">
            Contact an admin to approve your wallet
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BalanceCard />
        <Card>
          <CardHeader>
            <CardTitle>Transfer Tokens</CardTitle>
            <CardDescription>
              Send tokens to other approved investors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransferForm />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent transfers</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionHistory address={address} />
        </CardContent>
      </Card>
    </div>
  )
}

