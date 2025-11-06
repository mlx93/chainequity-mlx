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
        <span className="text-xs font-medium">Wallet Status:</span>
        {isApproved ? (
          <Badge variant="default" className="text-xs">Approved</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">Not Approved</Badge>
        )}
        {!isApproved && (
          <p className="text-xs text-muted-foreground">
            Contact an admin to approve your wallet
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BalanceCard />
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Transfer Tokens</CardTitle>
            <CardDescription className="text-xs">
              Send tokens to other approved investors
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <TransferForm />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Transaction History</CardTitle>
          <CardDescription className="text-xs">Your recent transfers</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionHistory address={address} />
        </CardContent>
      </Card>
    </div>
  )
}

