import { useEffect, useState } from 'react'
import { useConnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet } from 'lucide-react'

export default function NotConnected() {
  const { connect, connectors } = useConnect()
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side for MetaMask detection
  useEffect(() => {
    setIsClient(true)
  }, [])

  const metaMaskConnector = connectors.find(c => c.id === 'metaMask')
  const hasMetaMask = typeof window !== 'undefined' && window.ethereum?.isMetaMask

  // Wait for client-side hydration before checking connectors
  if (!isClient) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Loading wallet providers...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

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
          {metaMaskConnector || hasMetaMask ? (
            <Button
              className="w-full"
              onClick={() => {
                if (metaMaskConnector) {
                  connect({ connector: metaMaskConnector })
                } else if (hasMetaMask) {
                  // Fallback: try to detect and connect manually
                  window.location.reload()
                }
              }}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect MetaMask
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                MetaMask not detected. Please install MetaMask extension.
              </p>
              <p className="text-xs text-muted-foreground">
                Make sure MetaMask is installed and enabled in your browser.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

