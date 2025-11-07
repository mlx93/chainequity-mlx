import { publicClient, walletClient } from '../config/viem';
import { env } from '../config/env';
import GatedTokenABI from '../abis/GatedToken.json';

const CONTRACT_ADDRESS = env.CONTRACT_ADDRESS as `0x${string}`;

export async function submitTransfer(to: string, amount: string) {
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI as any,
    functionName: 'transfer',
    args: [to as `0x${string}`, BigInt(amount)],
  });
  
  return hash;
}

export async function approveWallet(address: string) {
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI as any,
    functionName: 'approveWallet',
    args: [address as `0x${string}`],
  });
  
  return hash;
}

export async function revokeWallet(address: string) {
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI as any,
    functionName: 'revokeWallet',
    args: [address as `0x${string}`],
  });
  
  return hash;
}

export async function executeStockSplit(multiplier: number) {
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI as any,
    functionName: 'executeSplit',
    args: [BigInt(multiplier)],
  });
  
  return hash;
}

export async function updateSymbol(newSymbol: string) {
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI as any,
    functionName: 'changeSymbol',
    args: [newSymbol],
  });
  
  return hash;
}

export async function mintTokens(to: string, amount: string) {
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI as any,
    functionName: 'mint',
    args: [to as `0x${string}`, BigInt(amount)],
  });
  
  return hash;
}

export async function burnTokens(from: string, amount: string) {
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI as any,
    functionName: 'burn',
    args: [from as `0x${string}`, BigInt(amount)],
  });
  
  return hash;
}

export async function getCurrentBlockNumber(): Promise<bigint> {
  return await publicClient.getBlockNumber();
}

export async function getTokenSymbol(): Promise<string> {
  const symbol = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI as any,
    functionName: 'symbol',
    args: [],
  });
  
  return symbol as string;
}

export async function getBalanceOf(address: string): Promise<bigint> {
  const balance = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI as any,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  });
  
  return balance as bigint;
}

// Helper function to format large numbers
export function formatTokenAmount(amount: string, decimals: number = 18): string {
  const num = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const whole = num / divisor;
  const fraction = num % divisor;
  
  if (fraction === BigInt(0)) {
    return whole.toString();
  }
  
  // Format with commas
  return whole.toLocaleString('en-US') + '.' + fraction.toString().padStart(decimals, '0').replace(/\.?0+$/, '');
}

