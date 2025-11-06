import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string, length = 6): string {
  if (!address) return ""
  if (address.length < length * 2) return address
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`
}

export function formatBalance(balance: bigint | string, decimals = 18): string {
  const value = typeof balance === "string" ? BigInt(balance) : balance
  const divisor = BigInt(10 ** decimals)
  const whole = value / divisor
  const remainder = value % divisor
  const fractional = remainder.toString().padStart(decimals, "0")
  // Remove trailing zeros
  const trimmed = fractional.replace(/0+$/, "")
  return trimmed ? `${whole}.${trimmed}` : whole.toString()
}

export function getBlockExplorerUrl(txHash: string, chainId: number): string {
  if (chainId === 84532) {
    return `https://sepolia.basescan.org/tx/${txHash}`
  }
  return `https://basescan.org/tx/${txHash}`
}

