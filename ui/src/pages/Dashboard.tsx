import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ApprovalForm from '@/components/admin/ApprovalForm'
import MintForm from '@/components/admin/MintForm'
import CorporateActions from '@/components/admin/CorporateActions'
import { useCapTable } from '@/hooks/useCapTable'

export default function Dashboard() {
  const { address } = useAccount()
  const isAdmin = useIsAdmin()
  const { data: capTable } = useCapTable()

  // If not admin, show message (routing handles redirect)
  if (!isAdmin && address) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            You do not have admin privileges. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage approvals, minting, and corporate actions</p>
      </div>

      {/* Stats */}
      {capTable && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">Total Supply</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {capTable.totalSupply ? (parseFloat(capTable.totalSupply) / 1e18).toLocaleString() : '0'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">tokens</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">Holders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{capTable.totalHolders ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">approved wallets</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">Current Block</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{capTable.blockNumber?.toLocaleString() ?? 'N/A'}</p>
              <p className="text-xs text-muted-foreground mt-1">Base Sepolia</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Actions - Three Column Layout */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Wallet Approval</CardTitle>
            <CardDescription>Approve or revoke wallet addresses</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ApprovalForm />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Mint Tokens</CardTitle>
            <CardDescription>Mint tokens to approved wallets</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <MintForm />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Corporate Actions</CardTitle>
            <CardDescription>Execute stock splits and symbol changes</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <CorporateActions />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

