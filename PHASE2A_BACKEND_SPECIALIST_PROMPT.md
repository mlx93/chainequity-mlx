# Phase 2A: Backend API Development - ChainEquity

**Role**: Backend API Specialist Sub-Agent  
**Model Recommendation**: Composer (fast Express/TypeScript generation)  
**Estimated Duration**: 4-6 hours  
**Workspace**: `/Users/mylessjs/Desktop/ChainEquity`  
**Can Run in Parallel with**: Phase 2B (Event Indexer)

---

## Your Mission

Implement the **ChainEquity Backend API** (Issuer Service) - an Express/TypeScript REST API that interfaces with the deployed GatedToken contract via Gnosis Safe multi-sig transactions. The backend provides endpoints for admin operations (wallet approvals, minting, corporate actions) and data queries (cap-table, transaction history).

**You are the implementation specialist** - write production-quality TypeScript code with proper validation and error handling.

---

## Project Context

ChainEquity's backend serves as the **issuer service** - the administrative interface for managing the tokenized equity. All admin operations go through the Gnosis Safe multi-signature wallet (2-of-3 threshold), requiring multiple approvals before execution.

**Key Principle**: The backend **submits transactions** and **queries the database** (populated by the Phase 2B Indexer). It does NOT directly index events.

---

## Phase 1 Outputs (Use These Values)

### **Deployed Contract Information**
```typescript
CONTRACT_ADDRESS = "0xFCc9E74019a2be5808d63A941a84dEbE0fC39964"
SAFE_ADDRESS = "0x6264F29968e8fd2810cB79fb806aC65dAf9db73d"
CHAIN_ID = 84532
BASE_SEPOLIA_RPC = "https://sepolia.base.org"
DEPLOYMENT_BLOCK = 33313307
```

### **Contract ABI Location**
The full ABI is in: `/Users/mylessjs/Desktop/ChainEquity/contracts/out/GatedToken.sol/GatedToken.json`

Extract with:
```bash
cd /Users/mylessjs/Desktop/ChainEquity/contracts
cat out/GatedToken.sol/GatedToken.json | jq '.abi' > ../backend/src/abis/GatedToken.json
```

### **Environment Variables**
From `/Users/mylessjs/Desktop/ChainEquity/.env`:
```bash
# Already available
ADMIN_PRIVATE_KEY=0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe
DATABASE_URL=postgresql://postgres:ITpPoRYgfwPwGkhtpysPwOBzczfKQDxQ@postgres.railway.internal:5432/railway
SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
```

---

## Technical Stack

**Runtime**: Node.js v20.x LTS  
**Language**: TypeScript ^5.3.0  
**Framework**: Express ^4.18.0  
**Web3 Library**: viem ^2.7.0 (modern Ethereum interactions)  
**Database Client**: pg (node-postgres) ^8.11.0  
**Validation**: zod ^3.22.0  
**Environment**: dotenv ^16.3.0  
**Testing**: Vitest ^1.0.0 (optional but recommended)

---

## API Specifications

### **Base URL**: `http://localhost:3000` (development)

Production will be deployed to Railway in Phase 4.

---

### **Endpoint 1: Health Check**
```
GET /health
```

**Response** (200):
```json
{
  "status": "ok",
  "timestamp": "2025-01-06T12:34:56Z",
  "blockchain": {
    "connected": true,
    "chainId": 84532,
    "blockNumber": 33313450
  },
  "database": {
    "connected": true
  }
}
```

---

### **Endpoint 2: Approve Wallet**
```
POST /admin/approve
```

**Request Body**:
```json
{
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

**Validation** (using zod):
- `walletAddress` must be valid Ethereum address
- Wallet must NOT already be approved (query contract or DB)

**Response** (200):
```json
{
  "success": true,
  "transactionHash": "0xabc...",
  "status": "pending",
  "message": "Approval transaction submitted, awaiting Safe signatures (2/3 required)"
}
```

**Errors**:
- `400`: Invalid wallet address format
- `409`: Wallet already approved
- `500`: Transaction submission failed

**Implementation Notes**:
- Use `viem` to call contract's `approveWallet()` function
- Transaction goes through Safe (manual signing for demo)
- For this phase, submit transaction from admin wallet directly (Safe integration is manual)

---

### **Endpoint 3: Revoke Wallet**
```
POST /admin/revoke
```

**Request Body**:
```json
{
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

**Response**: Same structure as approve

---

### **Endpoint 4: Mint Tokens**
```
POST /admin/mint
```

**Request Body**:
```json
{
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "10000"
}
```

**Validation**:
- `to` must be approved wallet (check contract's `allowlist` mapping)
- `amount` must be positive integer string (handles large numbers)

**Response** (200):
```json
{
  "success": true,
  "transactionHash": "0xdef...",
  "tokensMinted": "10000",
  "recipient": "0x1234..."
}
```

**Errors**:
- `400`: Invalid inputs
- `403`: Recipient not approved
- `500`: Transaction failed

---

### **Endpoint 5: Check Approval Status**
```
GET /wallet/:address/status
```

**Example**: `GET /wallet/0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6/status`

**Response** (200):
```json
{
  "address": "0x4f10...",
  "approved": true,
  "approvedAt": "2025-01-06T10:20:30Z",
  "approvedAtBlock": 33313320
}
```

**Data Source**: Query `approvals` table in PostgreSQL (populated by Phase 2B Indexer)

---

### **Endpoint 6: Execute Stock Split**
```
POST /admin/corporate-actions/split
```

**Request Body**:
```json
{
  "multiplier": 7
}
```

**Validation**: multiplier must be integer >= 2

**Response** (200):
```json
{
  "success": true,
  "transactionHash": "0xghi...",
  "multiplier": 7,
  "newTotalSupply": "70000",
  "message": "Stock split executed: all balances multiplied by 7"
}
```

---

### **Endpoint 7: Change Symbol**
```
POST /admin/corporate-actions/symbol
```

**Request Body**:
```json
{
  "newSymbol": "ACMEX"
}
```

**Validation**: Symbol must be 2-6 alphanumeric characters

**Response** (200):
```json
{
  "success": true,
  "transactionHash": "0xjkl...",
  "oldSymbol": "ACME",
  "newSymbol": "ACMEX"
}
```

---

### **Endpoint 8: Get Current Cap-Table**
```
GET /cap-table
```

**Response** (200):
```json
{
  "totalSupply": "70000",
  "holderCount": 8,
  "blockNumber": 33313500,
  "timestamp": "2025-01-06T14:30:00Z",
  "holders": [
    {
      "address": "0xAAA...",
      "balance": "49000",
      "ownershipPercent": "70.00"
    },
    {
      "address": "0xBBB...",
      "balance": "21000",
      "ownershipPercent": "30.00"
    }
  ]
}
```

**Data Source**: Query `balances` table (populated by indexer)

**SQL Query**:
```sql
SELECT
    address,
    balance,
    ownership_percent,
    last_updated_block
FROM balances
WHERE balance > 0
ORDER BY balance DESC;
```

---

### **Endpoint 9: Get Historical Cap-Table**
```
GET /cap-table/historical?blockNumber=33313400
```

**Query Params**:
- `blockNumber` (required): Block height for snapshot

**Response**: Same format as current cap-table, calculated at specified block

**SQL Query**:
```sql
-- Reconstruct balances from transfers up to block N
WITH historical_transfers AS (
    SELECT
        from_address AS address,
        -SUM(amount) AS net_change
    FROM transfers
    WHERE block_number <= $1 AND from_address != '0x0000000000000000000000000000000000000000'
    GROUP BY from_address
    UNION ALL
    SELECT
        to_address AS address,
        SUM(amount) AS net_change
    FROM transfers
    WHERE block_number <= $1
    GROUP BY to_address
)
SELECT
    address,
    SUM(net_change) AS balance
FROM historical_transfers
GROUP BY address
HAVING SUM(net_change) > 0
ORDER BY balance DESC;
```

---

### **Endpoint 10: Export Cap-Table**
```
GET /cap-table/export?format=csv
GET /cap-table/export?format=json
```

**Query Params**:
- `format`: "csv" or "json"
- `blockNumber` (optional): Historical snapshot

**Response** (CSV):
```
Content-Type: text/csv
Content-Disposition: attachment; filename="captable_2025-01-06_143045.csv"

Address,Balance,Ownership %
0xAAA...,49000,70.00
0xBBB...,21000,30.00
```

**Response** (JSON): Same as `/cap-table` endpoint

---

### **Endpoint 11: Transaction History**
```
GET /transactions?page=1&limit=50&address=0xAAA...
```

**Query Params**:
- `page`: Page number (default 1)
- `limit`: Results per page (default 50, max 100)
- `address` (optional): Filter by wallet

**Response** (200):
```json
{
  "transactions": [
    {
      "hash": "0xabc...",
      "blockNumber": 33313450,
      "timestamp": "2025-01-06T12:00:00Z",
      "type": "transfer",
      "from": "0xAAA...",
      "to": "0xBBB...",
      "amount": "3000"
    },
    {
      "hash": "0xdef...",
      "blockNumber": 33313420,
      "timestamp": "2025-01-06T11:50:00Z",
      "type": "split",
      "multiplier": 7
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 234
  }
}
```

**Data Source**: Query `transfers` and `corporate_actions` tables

---

## Project Structure

Create the following structure:

```
ChainEquity/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app entry point
│   │   ├── config/
│   │   │   ├── viem.ts           # Viem client setup
│   │   │   ├── database.ts       # PostgreSQL connection
│   │   │   └── env.ts            # Environment variable validation
│   │   ├── abis/
│   │   │   └── GatedToken.json   # Contract ABI
│   │   ├── routes/
│   │   │   ├── health.ts         # Health check endpoint
│   │   │   ├── admin.ts          # Admin operations (approve, mint, etc.)
│   │   │   ├── wallet.ts         # Wallet status queries
│   │   │   ├── capTable.ts       # Cap-table endpoints
│   │   │   └── transactions.ts   # Transaction history
│   │   ├── services/
│   │   │   ├── contractService.ts    # Contract interaction logic
│   │   │   ├── databaseService.ts    # Database queries
│   │   │   └── exportService.ts      # CSV/JSON generation
│   │   ├── middleware/
│   │   │   ├── validation.ts     # Input validation (zod schemas)
│   │   │   ├── errorHandler.ts   # Error handling middleware
│   │   │   └── logger.ts         # Request logging
│   │   └── types/
│   │       └── index.ts          # TypeScript type definitions
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
```

---

## Step-by-Step Implementation Guide

### **Step 1: Initialize Backend Project** (10 minutes)

```bash
cd /Users/mylessjs/Desktop/ChainEquity
mkdir backend && cd backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express viem pg zod dotenv cors
npm install -D typescript @types/node @types/express @types/pg ts-node nodemon

# Initialize TypeScript
npx tsc --init
```

**Update `tsconfig.json`**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**Update `package.json` scripts**:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### **Step 2: Copy Contract ABI** (2 minutes)

```bash
mkdir -p src/abis
cd /Users/mylessjs/Desktop/ChainEquity/contracts
cat out/GatedToken.sol/GatedToken.json | jq '.abi' > ../backend/src/abis/GatedToken.json
cd ../backend
```

### **Step 3: Create Environment Configuration** (5 minutes)

Create `backend/.env`:
```bash
# Copy from root .env
ADMIN_PRIVATE_KEY=0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe
DATABASE_URL=postgresql://postgres:ITpPoRYgfwPwGkhtpysPwOBzczfKQDxQ@postgres.railway.internal:5432/railway
SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
CHAIN_ID=84532
PORT=3000
NODE_ENV=development
```

Create `backend/.env.example`:
```bash
ADMIN_PRIVATE_KEY=0xYourPrivateKeyHere
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SAFE_ADDRESS=0xYourSafeAddress
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xYourContractAddress
CHAIN_ID=84532
PORT=3000
NODE_ENV=development
```

### **Step 4: Implement Configuration Files** (15 minutes)

**`src/config/env.ts`**:
```typescript
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  ADMIN_PRIVATE_KEY: z.string().startsWith('0x'),
  DATABASE_URL: z.string().url(),
  SAFE_ADDRESS: z.string().startsWith('0x'),
  BASE_SEPOLIA_RPC: z.string().url(),
  CONTRACT_ADDRESS: z.string().startsWith('0x'),
  CHAIN_ID: z.coerce.number(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
});

export const env = envSchema.parse(process.env);
```

**`src/config/viem.ts`**:
```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { env } from './env';

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(env.BASE_SEPOLIA_RPC),
});

const account = privateKeyToAccount(env.ADMIN_PRIVATE_KEY as `0x${string}`);

export const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(env.BASE_SEPOLIA_RPC),
});
```

**`src/config/database.ts`**:
```typescript
import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
```

### **Step 5: Implement Health Check** (10 minutes)

**`src/routes/health.ts`**:
```typescript
import { Router } from 'express';
import { publicClient } from '../config/viem';
import { testDatabaseConnection } from '../config/database';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    const [blockNumber, dbConnected] = await Promise.all([
      publicClient.getBlockNumber(),
      testDatabaseConnection(),
    ]);

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      blockchain: {
        connected: true,
        chainId: 84532,
        blockNumber: Number(blockNumber),
      },
      database: {
        connected: dbConnected,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
```

### **Step 6: Implement Contract Service** (30 minutes)

**`src/services/contractService.ts`**:
```typescript
import { publicClient, walletClient } from '../config/viem';
import { env } from '../config/env';
import GatedTokenABI from '../abis/GatedToken.json';

const CONTRACT_ADDRESS = env.CONTRACT_ADDRESS as `0x${string}`;

export async function approveWallet(walletAddress: string) {
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'approveWallet',
    args: [walletAddress as `0x${string}`],
    account: walletClient.account,
  });

  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function revokeWallet(walletAddress: string) {
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'revokeWallet',
    args: [walletAddress as `0x${string}`],
    account: walletClient.account,
  });

  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function mintTokens(to: string, amount: bigint) {
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'mint',
    args: [to as `0x${string}`, amount],
    account: walletClient.account,
  });

  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function executeSplit(multiplier: number) {
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'executeSplit',
    args: [BigInt(multiplier)],
    account: walletClient.account,
  });

  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function changeSymbol(newSymbol: string) {
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'changeSymbol',
    args: [newSymbol],
    account: walletClient.account,
  });

  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function isApproved(walletAddress: string): Promise<boolean> {
  const result = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'allowlist',
    args: [walletAddress as `0x${string}`],
  });

  return result as boolean;
}

export async function getTotalSupply(): Promise<bigint> {
  const result = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'totalSupply',
  });

  return result as bigint;
}
```

### **Step 7: Implement Database Service** (30 minutes)

**`src/services/databaseService.ts`**:
```typescript
import { pool } from '../config/database';

export async function getApprovalStatus(address: string) {
  const result = await pool.query(
    'SELECT * FROM approvals WHERE address = $1',
    [address.toLowerCase()]
  );

  return result.rows[0] || null;
}

export async function getCurrentCapTable() {
  const result = await pool.query(`
    SELECT
      address,
      balance,
      ownership_percent,
      last_updated_block,
      last_updated_at
    FROM balances
    WHERE balance > 0
    ORDER BY balance DESC
  `);

  return result.rows;
}

export async function getHistoricalCapTable(blockNumber: number) {
  const result = await pool.query(`
    WITH historical_transfers AS (
      SELECT
        from_address AS address,
        -SUM(amount) AS net_change
      FROM transfers
      WHERE block_number <= $1 AND from_address != '0x0000000000000000000000000000000000000000'
      GROUP BY from_address
      UNION ALL
      SELECT
        to_address AS address,
        SUM(amount) AS net_change
      FROM transfers
      WHERE block_number <= $1
      GROUP BY to_address
    )
    SELECT
      address,
      SUM(net_change) AS balance
    FROM historical_transfers
    GROUP BY address
    HAVING SUM(net_change) > 0
    ORDER BY balance DESC
  `, [blockNumber]);

  return result.rows;
}

export async function getTransactionHistory(
  page: number = 1,
  limit: number = 50,
  address?: string
) {
  const offset = (page - 1) * limit;

  let query = `
    SELECT
      transaction_hash,
      block_number,
      block_timestamp,
      event_type,
      from_address,
      to_address,
      amount
    FROM transfers
  `;

  const params: any[] = [];

  if (address) {
    query += ` WHERE from_address = $1 OR to_address = $1`;
    params.push(address.toLowerCase());
  }

  query += ` ORDER BY block_number DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  // Get total count
  const countQuery = address
    ? 'SELECT COUNT(*) FROM transfers WHERE from_address = $1 OR to_address = $1'
    : 'SELECT COUNT(*) FROM transfers';
  const countResult = await pool.query(countQuery, address ? [address.toLowerCase()] : []);

  const totalRecords = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalRecords / limit);

  return {
    transactions: result.rows,
    pagination: {
      currentPage: page,
      totalPages,
      totalRecords,
    },
  };
}
```

### **Step 8: Implement Admin Routes** (45 minutes)

**`src/routes/admin.ts`**:
```typescript
import { Router } from 'express';
import { z } from 'zod';
import * as contractService from '../services/contractService';

const router = Router();

// Validation schemas
const addressSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

const mintSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amount: z.string().regex(/^\d+$/),
});

const splitSchema = z.object({
  multiplier: z.number().int().min(2),
});

const symbolSchema = z.object({
  newSymbol: z.string().regex(/^[A-Z0-9]{2,6}$/),
});

// POST /admin/approve
router.post('/admin/approve', async (req, res) => {
  try {
    const { walletAddress } = addressSchema.parse(req.body);

    // Check if already approved
    const isCurrentlyApproved = await contractService.isApproved(walletAddress);
    if (isCurrentlyApproved) {
      return res.status(409).json({
        success: false,
        message: 'Wallet is already approved',
      });
    }

    const hash = await contractService.approveWallet(walletAddress);

    res.json({
      success: true,
      transactionHash: hash,
      status: 'pending',
      message: 'Approval transaction submitted',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }
    res.status(500).json({
      error: 'Transaction failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /admin/revoke
router.post('/admin/revoke', async (req, res) => {
  try {
    const { walletAddress } = addressSchema.parse(req.body);

    const hash = await contractService.revokeWallet(walletAddress);

    res.json({
      success: true,
      transactionHash: hash,
      status: 'pending',
      message: 'Revoke transaction submitted',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }
    res.status(500).json({
      error: 'Transaction failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /admin/mint
router.post('/admin/mint', async (req, res) => {
  try {
    const { to, amount } = mintSchema.parse(req.body);

    // Check if recipient is approved
    const isApproved = await contractService.isApproved(to);
    if (!isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Recipient wallet is not approved',
      });
    }

    const amountBigInt = BigInt(amount);
    const hash = await contractService.mintTokens(to, amountBigInt);

    res.json({
      success: true,
      transactionHash: hash,
      tokensMinted: amount,
      recipient: to,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid inputs' });
    }
    res.status(500).json({
      error: 'Transaction failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /admin/corporate-actions/split
router.post('/admin/corporate-actions/split', async (req, res) => {
  try {
    const { multiplier } = splitSchema.parse(req.body);

    const hash = await contractService.executeSplit(multiplier);
    const newTotalSupply = await contractService.getTotalSupply();

    res.json({
      success: true,
      transactionHash: hash,
      multiplier,
      newTotalSupply: newTotalSupply.toString(),
      message: `Stock split executed: all balances multiplied by ${multiplier}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Multiplier must be an integer >= 2' });
    }
    res.status(500).json({
      error: 'Transaction failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /admin/corporate-actions/symbol
router.post('/admin/corporate-actions/symbol', async (req, res) => {
  try {
    const { newSymbol } = symbolSchema.parse(req.body);

    const hash = await contractService.changeSymbol(newSymbol);

    res.json({
      success: true,
      transactionHash: hash,
      oldSymbol: 'ACME', // Could read from contract
      newSymbol,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Symbol must be 2-6 alphanumeric characters' });
    }
    res.status(500).json({
      error: 'Transaction failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
```

### **Step 9: Implement Remaining Routes** (45 minutes)

Create these route files:
- `src/routes/wallet.ts` - Wallet status endpoint
- `src/routes/capTable.ts` - Cap-table endpoints (current, historical, export)
- `src/routes/transactions.ts` - Transaction history

Follow similar patterns as admin routes.

### **Step 10: Create Main Express App** (20 minutes)

**`src/index.ts`**:
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import adminRouter from './routes/admin';
import walletRouter from './routes/wallet';
import capTableRouter from './routes/capTable';
import transactionsRouter from './routes/transactions';
import { env } from './config/env';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', healthRouter);
app.use('/', adminRouter);
app.use('/', walletRouter);
app.use('/', capTableRouter);
app.use('/', transactionsRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${env.PORT}`);
  console.log(`📊 Health check: http://localhost:${env.PORT}/health`);
  console.log(`⛓️  Contract: ${env.CONTRACT_ADDRESS}`);
  console.log(`🔐 Safe: ${env.SAFE_ADDRESS}`);
});
```

### **Step 11: Test Locally** (15 minutes)

```bash
# Start development server
npm run dev

# Test health endpoint
curl http://localhost:3000/health

# Should see:
# {
#   "status": "ok",
#   "blockchain": { "connected": true, ... },
#   "database": { "connected": true }
# }
```

**Note**: Database queries will fail until Phase 2B (Indexer) creates the tables and populates data.

---

## Success Criteria

Your Phase 2A is complete when ALL of the following are true:

- [ ] All 11 API endpoints implemented
- [ ] Input validation using zod schemas
- [ ] Contract interactions via viem working
- [ ] Database queries implemented (will be tested in Phase 4)
- [ ] Health check endpoint responds correctly
- [ ] Error handling middleware in place
- [ ] TypeScript compiles with no errors
- [ ] Development server runs locally
- [ ] README.md with API documentation
- [ ] `.env.example` created

---

## Report Template

When you complete Phase 2A, generate this report for the Orchestrator:

```markdown
# Phase 2A: Backend API Development - COMPLETE

## Status
✅ Complete

## Deliverables

### 1. API Endpoints Implemented
- ✅ GET /health
- ✅ POST /admin/approve
- ✅ POST /admin/revoke
- ✅ POST /admin/mint
- ✅ POST /admin/corporate-actions/split
- ✅ POST /admin/corporate-actions/symbol
- ✅ GET /wallet/:address/status
- ✅ GET /cap-table
- ✅ GET /cap-table/historical
- ✅ GET /cap-table/export
- ✅ GET /transactions

**Total**: 11 endpoints

### 2. Local Testing Results
- Health check: ✅ Working
- Contract interactions: ✅ Tested with admin wallet
- Database queries: ⏳ Pending Phase 2B (indexer must create tables)

### 3. Files Created
- `backend/src/index.ts` (XX lines)
- `backend/src/config/` (3 files)
- `backend/src/routes/` (5 files)
- `backend/src/services/` (3 files)
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/README.md`

**Total**: ~XXX lines of TypeScript

### 4. Dependencies
- express ^4.18.0
- viem ^2.7.0
- pg ^8.11.0
- zod ^3.22.0
- dotenv ^16.3.0
- cors ^4.0.0

### 5. Next Phase Requirements

**For Phase 2B (Indexer) - Must Create Tables:**
```sql
CREATE TABLE transfers (...);
CREATE TABLE balances (...);
CREATE TABLE approvals (...);
CREATE TABLE corporate_actions (...);
```

**For Phase 3 (Frontend):**
```typescript
BACKEND_URL = "http://localhost:3000" // Local dev
BACKEND_URL = "https://chainequity-backend.up.railway.app" // Production
```

### 6. Ready for Railway Deployment
- [x] Build script configured
- [x] Start script configured
- [x] Environment variables documented
- [x] PORT configurable via env

## Blockers
None - waiting for Phase 2B to create database tables

## Notes
- All admin operations go through contract (Safe ownership verified)
- Database queries will work once Phase 2B creates tables and indexes events
- CSV export implemented using built-in JSON-to-CSV conversion
- Ready for Railway deployment in Phase 4
```

---

## Important Notes

### **Database Tables**
Phase 2B (Indexer) will create these tables:
- `transfers` - All transfer events
- `balances` - Current state per wallet
- `approvals` - Allowlist state with timestamps
- `corporate_actions` - Splits, symbol changes

Your queries are ready, but they'll fail until Phase 2B runs.

### **Safe Integration**
For demo purposes, transactions are submitted from the admin wallet directly. In production, you'd integrate with Safe Transaction Service API for multi-sig proposal/approval workflows.

### **Testing Strategy**
- Test health check immediately
- Test contract interactions with admin wallet
- Database endpoints will be tested in Phase 4 after Phase 2B completes

---

## Troubleshooting

**Issue**: Database connection fails
- **Solution**: Check DATABASE_URL format, ensure Phase 2B has created tables

**Issue**: Contract interactions fail with "insufficient funds"
- **Solution**: Check admin wallet balance on Base Sepolia

**Issue**: TypeScript compilation errors
- **Solution**: Run `npm install` to ensure all @types packages are installed

---

## Resources

- **viem Documentation**: https://viem.sh
- **Express Documentation**: https://expressjs.com
- **Zod Documentation**: https://zod.dev
- **PostgreSQL node-postgres**: https://node-postgres.com

---

**BEGIN IMPLEMENTATION NOW!**

Start with Step 1 (Initialize Backend Project) and work through each step methodically. Focus on clean code structure and proper error handling. When complete, provide the report template filled out with your actual results.

Good luck! 🚀

