import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { env } from './env';

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(env.BASE_SEPOLIA_RPC),
});




