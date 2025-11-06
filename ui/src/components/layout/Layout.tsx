import { useAccount, useChainId } from 'wagmi'
import type { ReactNode } from 'react'
import Header from './Header'
import NotConnected from '@/pages/NotConnected'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { isConnected } = useAccount()
  const chainId = useChainId()

  if (!isConnected) {
    return (
      <>
        <Header />
        <NotConnected />
      </>
    )
  }

  if (chainId !== 84532) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
            <h2 className="text-xl font-semibold text-destructive">Wrong Network</h2>
            <p className="mt-2 text-sm">
              Please switch to Base Sepolia testnet to use ChainEquity.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </>
  )
}

