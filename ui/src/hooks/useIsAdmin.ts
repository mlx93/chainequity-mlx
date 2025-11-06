import { useAccount } from 'wagmi'
import { ADMIN_ADDRESSES } from '@/config/contracts'

export function useIsAdmin(): boolean {
  const { address } = useAccount()
  if (!address) return false
  return ADMIN_ADDRESSES.some(admin => admin.toLowerCase() === address.toLowerCase())
}

