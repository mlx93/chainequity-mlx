import { config } from 'dotenv';
import { z } from 'zod';

config(); // Load .env file

const envSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Blockchain
  BASE_SEPOLIA_RPC: z.string().url(),
  CONTRACT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  CHAIN_ID: z.string().transform(Number),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Admin (for demo transaction signing)
  ADMIN_PRIVATE_KEY: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  ADMIN_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  
  // Gnosis Safe (optional, for future multi-sig)
  SAFE_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

export const env = envSchema.parse(process.env);

