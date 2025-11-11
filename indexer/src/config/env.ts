import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  DATABASE_URL: string;
  BASE_SEPOLIA_RPC: string;
  CONTRACT_ADDRESS: string;
  START_BLOCK: number;
  POLL_INTERVAL_MS: number;
  CHAIN_ID: number;
  NODE_ENV: string;
}

function validateEnv(): EnvConfig {
  const required = [
    'DATABASE_URL',
    'BASE_SEPOLIA_RPC',
    'CONTRACT_ADDRESS',
    'START_BLOCK',
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    BASE_SEPOLIA_RPC: process.env.BASE_SEPOLIA_RPC!,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS!,
    START_BLOCK: parseInt(process.env.START_BLOCK || '0', 10),
    POLL_INTERVAL_MS: parseInt(process.env.POLL_INTERVAL_MS || '5000', 10),
    CHAIN_ID: parseInt(process.env.CHAIN_ID || '84532', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

export const env = validateEnv();




