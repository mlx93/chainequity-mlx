import { useConnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet } from 'lucide-react'

export default function NotConnected() {
  const { connect, connectors } = useConnect()

  const metaMaskConnector = connectors.find(c => c.id === 'metaMask')

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>
            Connect to Base Sepolia testnet to access ChainEquity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metaMaskConnector ? (
            <Button
              className="w-full"
              onClick={() => connect({ connector: metaMaskConnector })}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect MetaMask
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              MetaMask not detected. Please install MetaMask extension.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

