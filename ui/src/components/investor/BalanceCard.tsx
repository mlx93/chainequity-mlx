import { useAccount } from 'wagmi'
import { useBalance } from '@/hooks/useBalance'
import { useCapTable } from '@/hooks/useCapTable'
import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, GatedTokenABI } from '@/config/contracts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatBalance } from '@/lib/utils'

export default function BalanceCard() {
  const { address } = useAccount()
  const { data: balance, isLoading: balanceLoading } = useBalance(address)
  const { data: capTable, isLoading: capTableLoading } = useCapTable()
  const { data: symbol, isLoading: symbolLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'symbol',
  })

  if (balanceLoading || capTableLoading || symbolLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Balance</CardTitle>
          <CardDescription className="text-xs">Your token holdings</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-24 mt-2" />
        </CardContent>
      </Card>
    )
  }

  const balanceValue = balance ? BigInt(balance.toString()) : BigInt(0)
  const formattedBalance = formatBalance(balanceValue)
  
  const ownershipPercent = capTable && capTable.totalSupply && balanceValue > 0
    ? (Number(balanceValue) / Number(BigInt(capTable.totalSupply))) * 100
    : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-4xl font-bold">
            {formattedBalance} {symbol as string || 'TOKENS'}
          </p>
          {capTable && balanceValue > 0 && (
            <p className="text-muted-foreground">
              {ownershipPercent.toFixed(2)}% ownership
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

