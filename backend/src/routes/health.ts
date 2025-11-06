import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import {
  getCurrentBlockNumber,
  getTokenSymbol,
} from '../services/blockchain.service';
import { env } from '../config/env';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    const timestamp = new Date().toISOString();
    
    // Test database connection
    let dbConnected = false;
    try {
      await pool.query('SELECT 1');
      dbConnected = true;
    } catch (error) {
      console.error('Database connection test failed:', error);
    }
    
    // Test blockchain connection
    let blockchainConnected = false;
    let blockNumber: bigint | null = null;
    let symbol: string | null = null;
    
    try {
      blockNumber = await getCurrentBlockNumber();
      symbol = await getTokenSymbol();
      blockchainConnected = true;
    } catch (error) {
      console.error('Blockchain connection test failed:', error);
    }
    
    if (!dbConnected || !blockchainConnected) {
      return res.status(503).json({
        status: 'error',
        message: 'Service unavailable',
        timestamp,
        blockchain: {
          connected: blockchainConnected,
          ...(blockNumber !== null && { blockNumber: Number(blockNumber) }),
        },
        database: {
          connected: dbConnected,
        },
      });
    }
    
    res.json({
      status: 'ok',
      timestamp,
      blockchain: {
        connected: true,
        chainId: env.CHAIN_ID,
        blockNumber: Number(blockNumber),
        contractAddress: env.CONTRACT_ADDRESS,
        tokenSymbol: symbol,
      },
      database: {
        connected: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;


