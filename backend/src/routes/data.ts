import { Router, Request, Response } from 'express';
import {
  getCapTable,
  getTransfers,
  getCorporateActions,
  getWalletInfo,
} from '../services/database.service';
import { formatTokenAmount } from '../services/blockchain.service';
import { TransferRow, CorporateActionRow } from '../types';
import { publicClient } from '../config/viem';
import { env } from '../config/env';
import GatedTokenABI from '../abis/GatedToken.json';

const router = Router();

// Helper to get split multiplier from contract
async function getSplitMultiplier(): Promise<bigint> {
  try {
    const multiplier = await publicClient.readContract({
      address: env.CONTRACT_ADDRESS as `0x${string}`,
      abi: GatedTokenABI as any,
      functionName: 'splitMultiplier',
      args: [],
    }) as bigint;
    return multiplier;
  } catch (error) {
    console.error('Failed to read split multiplier:', error);
    return BigInt(1); // Default to 1 if read fails
  }
}

// Helper to format transfer type
function getTransferType(from: string, to: string): 'mint' | 'burn' | 'transfer' {
  if (from === '0x0000000000000000000000000000000000000000') return 'mint';
  if (to === '0x0000000000000000000000000000000000000000') return 'burn';
  return 'transfer';
}

// GET /api/cap-table
router.get('/cap-table', async (req: Request, res: Response) => {
  try {
    const minBalance = req.query.minBalance ? BigInt(req.query.minBalance as string) : BigInt(0);
    const balances = await getCapTable();
    
    // Get current block number and split multiplier
    const [blockNumber, splitMultiplier] = await Promise.all([
      publicClient.getBlockNumber(),
      getSplitMultiplier(),
    ]);
    
    // Calculate total supply (applying split multiplier)
    let totalSupply = BigInt(0);
    const filteredBalances = balances.filter((b) => {
      const baseBalance = BigInt(b.balance);
      const adjustedBalance = baseBalance * splitMultiplier;
      if (adjustedBalance < minBalance) return false;
      totalSupply += adjustedBalance;
      return true;
    });
    
    // Format response
    const capTable = filteredBalances.map((b) => {
      const baseBalance = BigInt(b.balance);
      const adjustedBalance = baseBalance * splitMultiplier;
      const percentage = totalSupply > 0
        ? ((Number(adjustedBalance) / Number(totalSupply)) * 100).toFixed(2)
        : '0.00';
      
      return {
        address: b.address,
        balance: adjustedBalance.toString(),
        balanceFormatted: formatTokenAmount(adjustedBalance.toString()),
        percentage,
        lastUpdated: b.updated_at.toISOString(),
      };
    });
    
    res.json({
      capTable,
      totalSupply: totalSupply.toString(),
      totalHolders: capTable.length,
      blockNumber: Number(blockNumber),
      splitMultiplier: Number(splitMultiplier),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch cap table',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/transfers
router.get('/transfers', async (req: Request, res: Response) => {
  try {
    const address = req.query.address as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 100) : 15;
    const offset = (page - 1) * limit;
    const fromBlock = req.query.fromBlock ? parseInt(req.query.fromBlock as string, 10) : undefined;
    const toBlock = req.query.toBlock ? parseInt(req.query.toBlock as string, 10) : undefined;
    
    // Get total count for pagination
    const { getTransfersCount } = require('../services/database.service');
    const totalRecords = await getTransfersCount({ address, fromBlock, toBlock });
    const totalPages = Math.ceil(totalRecords / limit);
    
    // Get paginated transfers
    const transfers = await getTransfers({
      address,
      limit,
      offset,
      fromBlock,
      toBlock,
    });
    
    const formattedTransfers = transfers.map((t: TransferRow) => ({
      transactionHash: t.transaction_hash,
      blockNumber: parseInt(t.block_number, 10),
      blockTimestamp: t.block_timestamp.toISOString(),
      from: t.from_address,
      to: t.to_address,
      amount: t.amount,
      amountFormatted: formatTokenAmount(t.amount),
      type: getTransferType(t.from_address, t.to_address),
    }));
    
    res.json({
      transfers: formattedTransfers,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        limit,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch transfers',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/corporate-actions
router.get('/corporate-actions', async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    
    const actions = await getCorporateActions({ type, limit, offset });
    
    const formattedActions = actions.map((a: CorporateActionRow) => ({
      id: a.id,
      actionType: a.action_type,
      transactionHash: a.transaction_hash,
      blockNumber: parseInt(a.block_number, 10),
      blockTimestamp: a.block_timestamp.toISOString(),
      details: a.details,
    }));
    
    res.json({
      actions: formattedActions,
      count: formattedActions.length,
      limit,
      offset,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch corporate actions',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/cap-table/historical?blockNumber=X
router.get('/cap-table/historical', async (req: Request, res: Response) => {
  try {
    const blockNumberParam = req.query.blockNumber as string | undefined;
    
    if (!blockNumberParam) {
      return res.status(400).json({
        error: 'blockNumber query parameter is required',
        timestamp: new Date().toISOString(),
      });
    }
    
    const blockNumber = parseInt(blockNumberParam, 10);
    
    if (isNaN(blockNumber) || blockNumber < 0) {
      return res.status(400).json({
        error: 'blockNumber must be a positive integer',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Validate block number range
    const CONTRACT_DEPLOYMENT_BLOCK = 33313307;
    const currentBlock = await publicClient.getBlockNumber();
    
    if (blockNumber < CONTRACT_DEPLOYMENT_BLOCK) {
      return res.status(400).json({
        error: `blockNumber must be >= contract deployment block (${CONTRACT_DEPLOYMENT_BLOCK})`,
        timestamp: new Date().toISOString(),
      });
    }
    
    if (blockNumber > Number(currentBlock)) {
      return res.status(400).json({
        error: `blockNumber must be <= current block (${currentBlock})`,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Reconstruct historical balances from transfers
    const { getHistoricalBalances, getHistoricalSplitMultiplier } = require('../services/database.service');
    const historicalBalances = await getHistoricalBalances(blockNumber);
    const splitMultiplier = await getHistoricalSplitMultiplier(blockNumber);
    
    // Calculate total supply
    let totalSupply = BigInt(0);
    historicalBalances.forEach((b: any) => {
      const balance = BigInt(b.balance);
      totalSupply += balance;
    });
    
    // Get block timestamp
    const { getBlockTimestamp } = require('../services/database.service');
    const timestamp = await getBlockTimestamp(blockNumber);
    
    // Format response
    const capTable = historicalBalances.map((b: any) => {
      const balance = BigInt(b.balance);
      const percentage = totalSupply > 0
        ? ((Number(balance) / Number(totalSupply)) * 100).toFixed(2)
        : '0.00';
      
      return {
        address: b.address,
        balance: balance.toString(),
        balanceFormatted: formatTokenAmount(balance.toString()),
        percentage,
      };
    });
    
    res.json({
      blockNumber,
      timestamp: timestamp || new Date().toISOString(),
      totalSupply: totalSupply.toString(),
      holderCount: capTable.length,
      splitMultiplier: Number(splitMultiplier),
      capTable,
    });
  } catch (error) {
    console.error('Historical cap table error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch historical cap table',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/wallet/:address
router.get('/wallet/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const info = await getWalletInfo(address);
    
    // Check if wallet exists (has balance or approval record)
    if (
      info.balance.balance === '0' &&
      !info.approval.is_approved &&
      info.transfers.count === '0'
    ) {
      return res.status(404).json({
        error: 'Wallet not found',
        address,
        timestamp: new Date().toISOString(),
      });
    }
    
    res.json({
      address,
      balance: info.balance.balance,
      balanceFormatted: formatTokenAmount(info.balance.balance),
      isApproved: info.approval.is_approved,
      approvedAt: info.approval.approved_at?.toISOString() || null,
      transferCount: parseInt(info.transfers.count, 10),
      firstTransferAt: info.transfers.first_transfer?.toISOString() || null,
      lastTransferAt: info.transfers.last_transfer?.toISOString() || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch wallet info',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

