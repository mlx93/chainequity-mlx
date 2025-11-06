import { useAccount, useDisconnect, useChainId } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatAddress } from '@/lib/utils'
import { Wallet, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useIsAdmin } from '@/hooks/useIsAdmin'

export default function Header() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const isAdmin = useIsAdmin()

  const isBaseSepolia = chainId === 84532

  if (!isConnected) {
    return (
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="text-xl font-bold">
            ChainEquity
          </Link>
          <div className="flex items-center gap-2">
            {!isBaseSepolia && (
              <Badge variant="destructive">Wrong Network</Badge>
            )}
            <Button variant="outline" disabled>
              <Wallet className="mr-2 h-4 w-4" />
              Not Connected
            </Button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold">
          ChainEquity
        </Link>
        <nav className="flex items-center gap-4">
          {isAdmin && (
            <Link to="/" className="text-sm hover:underline">Dashboard</Link>
          )}
          <Link to="/investor" className="text-sm hover:underline">Investor</Link>
          <Link to="/captable" className="text-sm hover:underline">Cap Table</Link>
        </nav>
        <div className="flex items-center gap-2">
          {!isBaseSepolia && (
            <Badge variant="destructive">Wrong Network</Badge>
          )}
          {isBaseSepolia && (
            <Badge variant="secondary">Base Sepolia</Badge>
          )}
          <Badge variant="outline">{formatAddress(address!)}</Badge>
          <Button variant="outline" size="sm" onClick={() => disconnect()}>
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </div>
    </header>
  )
}

