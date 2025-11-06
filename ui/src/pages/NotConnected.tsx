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
              onClick={async () => {
                try {
                  console.log('Connect button clicked')
                  console.log('MetaMask connector:', metaMaskConnector)
                  console.log('hasMetaMask:', hasMetaMask)
                  console.log('window.ethereum:', window.ethereum)
                  
                  if (metaMaskConnector) {
                    console.log('Attempting to connect via wagmi connector...')
                    const result = await connect({ connector: metaMaskConnector })
                    console.log('Connection result:', result)
                  } else if (hasMetaMask) {
                    console.log('MetaMask detected but no connector, reloading...')
                    window.location.reload()
                  }
                } catch (error) {
                  console.error('Connection error:', error)
                  alert(`Connection failed: ${error instanceof Error ? error.message : String(error)}`)
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

