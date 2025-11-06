import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin && address) {
      navigate('/investor')
    }
  }, [isAdmin, address, navigate])

  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            You do not have admin privileges. Redirecting to investor view...
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
            <CardHeader>
              <CardTitle>Total Supply</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {parseFloat(capTable.totalSupply) / 1e18} tokens
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Holders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{capTable.holderCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Current Block</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{capTable.blockNumber.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Approval</CardTitle>
            <CardDescription>Approve or revoke wallet addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <ApprovalForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mint Tokens</CardTitle>
            <CardDescription>Mint tokens to approved wallets</CardDescription>
          </CardHeader>
          <CardContent>
            <MintForm />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Corporate Actions</CardTitle>
          <CardDescription>Execute stock splits and symbol changes</CardDescription>
        </CardHeader>
        <CardContent>
          <CorporateActions />
        </CardContent>
      </Card>
    </div>
  )
}

