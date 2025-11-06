import { useEffect, useState } from 'react'
import { useConnect } from 'wagmi'
import { wagmiConfig } from '@/config/wagmi'
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

  // wagmi uses 'metaMaskSDK' as the connector ID, not 'metaMask'
  const metaMaskConnector = connectors.find(c => c.id === 'metaMaskSDK' || c.id === 'metaMask')
  const hasMetaMask = typeof window !== 'undefined' && window.ethereum?.isMetaMask

  // Debug: Log connector state
  useEffect(() => {
    console.log('=== Wagmi Connector Debug ===')
    console.log('All connectors:', connectors)
    console.log('Connector IDs:', connectors.map(c => c.id))
    console.log('MetaMask connector found:', metaMaskConnector)
    console.log('hasMetaMask:', hasMetaMask)
    console.log('window.ethereum:', window.ethereum)
    console.log('wagmiConfig connectors:', wagmiConfig?.connectors)
  }, [connectors, metaMaskConnector, hasMetaMask])

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
                    console.error('MetaMask detected but no wagmi connector found!')
                    console.error('This should not happen - wagmi connector should be initialized')
                    console.error('Available connectors:', connectors)
                    console.error('Trying to create connector manually...')
                    
                    // Try to connect directly via window.ethereum as last resort
                    try {
                      const accounts = await window.ethereum.request({ 
                        method: 'eth_requestAccounts' 
                      })
                      console.log('Direct connection successful:', accounts)
                      // Force page reload to let wagmi pick up the connection
                      window.location.reload()
                    } catch (err) {
                      console.error('Direct connection also failed:', err)
                      alert(`MetaMask connection failed: ${err instanceof Error ? err.message : String(err)}\n\nCheck console for details.`)
                    }
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

