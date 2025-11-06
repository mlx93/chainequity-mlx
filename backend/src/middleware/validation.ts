import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Ethereum address validation
const ethereumAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/i);

// Transfer request schema
export const transferRequestSchema = z.object({
  to: ethereumAddressSchema,
  amount: z.string().regex(/^\d+$/).refine((val) => BigInt(val) > 0, {
    message: 'Amount must be positive',
  }),
});

// Approve wallet request schema
export const approveWalletRequestSchema = z.object({
  address: ethereumAddressSchema,
});

// Revoke wallet request schema
export const revokeWalletRequestSchema = z.object({
  address: ethereumAddressSchema,
});

// Stock split request schema
export const stockSplitRequestSchema = z.object({
  multiplier: z.number().int().min(2),
});

// Update symbol request schema
export const updateSymbolRequestSchema = z.object({
  newSymbol: z.string().min(1).max(11).regex(/^[A-Z0-9-]+$/),
});

// Mint tokens request schema
export const mintTokensRequestSchema = z.object({
  to: ethereumAddressSchema,
  amount: z.string().regex(/^\d+$/).refine((val) => BigInt(val) > 0, {
    message: 'Amount must be positive',
  }),
});

// Validation middleware factory
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };
}

// Validate Ethereum address parameter
export function validateAddressParam(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { address } = req.params;
    ethereumAddressSchema.parse(address.toLowerCase());
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Invalid Ethereum address',
      timestamp: new Date().toISOString(),
    });
  }
}

