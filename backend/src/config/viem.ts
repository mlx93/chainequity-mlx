import { createPublicClient, createWalletClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { env } from './env';

// Public client for reading blockchain state
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(env.BASE_SEPOLIA_RPC),
});

// Wallet client for sending transactions
const account = privateKeyToAccount(env.ADMIN_PRIVATE_KEY as `0x${string}`);

export const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(env.BASE_SEPOLIA_RPC),
});

console.log(`✅ Blockchain client initialized (Admin: ${account.address})`);




