import { useAccount, useDisconnect, useChainId } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatAddress } from '@/lib/utils'
import { Wallet, LogOut, LayoutDashboard, User, Table2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { cn } from '@/lib/utils'

export default function Header() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const isAdmin = useIsAdmin()
  const isBaseSepolia = chainId === 84532

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
    )

  if (!isConnected) {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <NavLink to="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity">
            <span>ChainEquity</span>
          </NavLink>
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <NavLink 
          to="/" 
          className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity"
        >
          <span>ChainEquity</span>
        </NavLink>
        
        <nav className="flex items-center gap-1">
          {isAdmin && (
            <NavLink
              to="/"
              className={navLinkClass}
              end
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </NavLink>
          )}
          <NavLink
            to="/investor"
            className={navLinkClass}
          >
            <User className="h-4 w-4" />
            <span>Investor</span>
          </NavLink>
          <NavLink
            to="/captable"
            className={navLinkClass}
          >
            <Table2 className="h-4 w-4" />
            <span>Cap Table</span>
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {!isBaseSepolia && (
            <Badge variant="destructive" className="hidden sm:inline-flex">
              Wrong Network
            </Badge>
          )}
          {isBaseSepolia && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Base Sepolia
            </Badge>
          )}
          <Badge variant="outline" className="font-mono text-xs">
            {formatAddress(address!)}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => disconnect()}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Disconnect</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

