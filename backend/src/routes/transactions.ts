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

export default router;

