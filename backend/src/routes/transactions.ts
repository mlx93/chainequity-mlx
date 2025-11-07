import { Router, Request, Response } from 'express';
import {
  submitTransfer,
  approveWallet,
  revokeWallet,
  executeStockSplit,
  updateSymbol,
  getTokenSymbol,
  mintTokens,
} from '../services/blockchain.service';
import { isWalletApproved } from '../services/database.service';
import { env } from '../config/env';
import {
  validateBody,
  validateAddressParam,
  transferRequestSchema,
  approveWalletRequestSchema,
  revokeWalletRequestSchema,
  stockSplitRequestSchema,
  updateSymbolRequestSchema,
  mintTokensRequestSchema,
} from '../middleware/validation';

const router = Router();

const BLOCK_EXPLORER_BASE = 'https://sepolia.basescan.org/tx';

// Helper to create block explorer URL
function getBlockExplorerUrl(txHash: string): string {
  return `${BLOCK_EXPLORER_BASE}/${txHash}`;
}

// POST /api/transfer
router.post(
  '/transfer',
  validateBody(transferRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const { to, amount } = req.body;
      
      // Check if recipient is approved
      const isApproved = await isWalletApproved(to);
      
      if (!isApproved) {
        return res.status(400).json({
          error: 'Recipient wallet is not approved',
          to,
          isApproved: false,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Submit transaction
      const transactionHash = await submitTransfer(to, amount);
      
      res.json({
        success: true,
        transactionHash,
        from: env.ADMIN_ADDRESS,
        to,
        amount,
        blockExplorerUrl: getBlockExplorerUrl(transactionHash),
        message: 'Transfer submitted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Transfer error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to submit transfer',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// POST /api/admin/approve-wallet
router.post(
  '/admin/approve-wallet',
  validateBody(approveWalletRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const { address } = req.body;
      
      const transactionHash = await approveWallet(address);
      
      res.json({
        success: true,
        transactionHash,
        address,
        blockExplorerUrl: getBlockExplorerUrl(transactionHash),
        message: 'Wallet approval submitted',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Approve wallet error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to approve wallet',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// POST /api/admin/revoke-wallet
router.post(
  '/admin/revoke-wallet',
  validateBody(revokeWalletRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const { address } = req.body;
      
      const transactionHash = await revokeWallet(address);
      
      res.json({
        success: true,
        transactionHash,
        address,
        blockExplorerUrl: getBlockExplorerUrl(transactionHash),
        message: 'Wallet revocation submitted',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Revoke wallet error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to revoke wallet',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// POST /api/admin/stock-split
router.post(
  '/admin/stock-split',
  validateBody(stockSplitRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const { multiplier } = req.body;
      
      const transactionHash = await executeStockSplit(multiplier);
      
      res.json({
        success: true,
        transactionHash,
        multiplier,
        blockExplorerUrl: getBlockExplorerUrl(transactionHash),
        message: `Stock split submitted (${multiplier}:1)`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Stock split error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to execute stock split',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// POST /api/admin/update-symbol
router.post(
  '/admin/update-symbol',
  validateBody(updateSymbolRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const { newSymbol } = req.body;
      
      // Get current symbol before updating
      const oldSymbol = await getTokenSymbol();
      
      const transactionHash = await updateSymbol(newSymbol);
      
      res.json({
        success: true,
        transactionHash,
        oldSymbol,
        newSymbol,
        blockExplorerUrl: getBlockExplorerUrl(transactionHash),
        message: 'Symbol update submitted',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Update symbol error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to update symbol',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// POST /api/admin/mint
router.post(
  '/admin/mint',
  validateBody(mintTokensRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const { to, amount } = req.body;
      
      // Check if recipient is approved
      const isApproved = await isWalletApproved(to);
      
      if (!isApproved) {
        return res.status(400).json({
          error: 'Recipient wallet is not approved',
          to,
          isApproved: false,
          timestamp: new Date().toISOString(),
        });
      }
      
      const transactionHash = await mintTokens(to, amount);
      
      res.json({
        success: true,
        transactionHash,
        to,
        amount,
        blockExplorerUrl: getBlockExplorerUrl(transactionHash),
        message: 'Token minting submitted',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Mint tokens error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to mint tokens',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// POST /api/admin/burn-all - Burn tokens from all cap table holders
router.post('/admin/burn-all', async (req: Request, res: Response) => {
  try {
    const { getCapTable } = require('../services/database.service');
    const { burnTokens, getBalanceOf } = require('../services/blockchain.service');
    
    // Get all holders from cap table
    const holders = await getCapTable();
    
    if (holders.length === 0) {
      return res.json({
        success: true,
        transactions: [],
        message: 'No tokens to burn (cap table is empty)',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Burn from each holder
    const transactions: string[] = [];
    const errors: any[] = [];
    
    for (const holder of holders) {
      try {
        // Get actual on-chain balance (includes split multiplier)
        const onChainBalance = await getBalanceOf(holder.address);
        
        if (onChainBalance > 0n) {
          console.log(`Burning ${onChainBalance.toString()} tokens from ${holder.address}`);
          const txHash = await burnTokens(holder.address, onChainBalance.toString());
          transactions.push(txHash);
          
          // Wait 2 seconds between transactions to avoid nonce issues
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Failed to burn from ${holder.address}:`, error);
        errors.push({
          address: holder.address,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    res.json({
      success: true,
      transactions,
      burned: transactions.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Burned tokens from ${transactions.length} holders`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Burn all tokens error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to burn tokens',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

