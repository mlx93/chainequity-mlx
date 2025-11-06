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

const router = Router();

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
    
    // Get current block number
    const blockNumber = await publicClient.getBlockNumber();
    
    // Calculate total supply
    let totalSupply = BigInt(0);
    const filteredBalances = balances.filter((b) => {
      const balance = BigInt(b.balance);
      if (balance < minBalance) return false;
      totalSupply += balance;
      return true;
    });
    
    // Format response
    const capTable = filteredBalances.map((b) => {
      const balance = BigInt(b.balance);
      const percentage = totalSupply > 0
        ? Number((balance * BigInt(10000)) / totalSupply / BigInt(100)).toFixed(2)
        : '0.00';
      
      return {
        address: b.address,
        balance: b.balance,
        balanceFormatted: formatTokenAmount(b.balance),
        percentage,
        lastUpdated: b.updated_at.toISOString(),
      };
    });
    
    res.json({
      capTable,
      totalSupply: totalSupply.toString(),
      totalHolders: capTable.length,
      blockNumber: Number(blockNumber),
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
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const fromBlock = req.query.fromBlock ? parseInt(req.query.fromBlock as string, 10) : undefined;
    const toBlock = req.query.toBlock ? parseInt(req.query.toBlock as string, 10) : undefined;
    
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
      count: formattedTransfers.length,
      limit,
      offset,
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

