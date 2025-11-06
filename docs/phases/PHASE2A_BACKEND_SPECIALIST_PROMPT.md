# Phase 2A: Backend API Development - ChainEquity

**Role**: Backend API Specialist Sub-Agent  
**Model Recommendation**: Claude Sonnet 4.5 or Composer  
**Estimated Duration**: 4-6 hours  
**Workspace**: `/Users/mylessjs/Desktop/ChainEquity`  
**Dependencies**: Phase 2B Event Indexer MUST be complete and running

---

## 🎯 Your Mission

Implement the **ChainEquity Backend API** - an Express/TypeScript REST API that:
1. **Queries** the PostgreSQL database (populated by the Phase 2B Indexer) for cap-table data
2. **Submits transactions** to the Base Sepolia blockchain via the deployed GatedToken contract
3. **Provides** endpoints for both data retrieval and transaction submission
4. **Validates** requests and handles errors gracefully

**You are the implementation specialist** - write production-quality TypeScript code with proper validation and error handling.

---

## 📚 Required Reading Before Starting

**CRITICAL**: Read these memory bank files first to understand the full context:
1. `/Users/mylessjs/Desktop/ChainEquity/memory-bank/projectbrief.md` - Project overview and goals
2. `/Users/mylessjs/Desktop/ChainEquity/memory-bank/systemPatterns.md` - Architecture and data flow
3. `/Users/mylessjs/Desktop/ChainEquity/memory-bank/techContext.md` - Tech stack and constraints
4. `/Users/mylessjs/Desktop/ChainEquity/memory-bank/progress.md` - Current project status

**Phase 1 Details**:
- `/Users/mylessjs/Desktop/ChainEquity/PHASE1_COMPLETION_REPORT.md` - Contract deployment details

**Phase 2B Details**:
- `/Users/mylessjs/Desktop/ChainEquity/PHASE2B_INDEXER_COMPLETION_REPORT.md` - Database schema and indexer implementation

---

## 📦 Phase 1 & 2B Outputs (Use These Values)

### Deployed Contract Information
```typescript
CONTRACT_ADDRESS = "0xFCc9E74019a2be5808d63A941a84dEbE0fC39964"
SAFE_ADDRESS = "0x6264F29968e8fd2810cB79fb806aC65dAf9db73d"
CHAIN_ID = 84532
BASE_SEPOLIA_RPC = "https://sepolia.base.org"
DEPLOYMENT_BLOCK = 33313307
```

### Database Schema (Phase 2B)
The indexer maintains these tables in Railway PostgreSQL:

**transfers** - All token transfer events
```sql
id SERIAL PRIMARY KEY
transaction_hash TEXT NOT NULL UNIQUE
block_number BIGINT NOT NULL
block_timestamp TIMESTAMP NOT NULL
from_address TEXT NOT NULL
to_address TEXT NOT NULL
amount TEXT NOT NULL
created_at TIMESTAMP DEFAULT NOW()

INDEXES: from_address, to_address, block_number
```

**balances** - Current token balances (derived from transfers)
```sql
address TEXT PRIMARY KEY
balance TEXT NOT NULL
updated_at TIMESTAMP DEFAULT NOW()
```

**approvals** - Wallet allowlist status
```sql
address TEXT PRIMARY KEY
is_approved BOOLEAN NOT NULL
approved_at TIMESTAMP
revoked_at TIMESTAMP
updated_at TIMESTAMP DEFAULT NOW()
```

**corporate_actions** - Stock splits, symbol changes, mints, burns
```sql
id SERIAL PRIMARY KEY
action_type TEXT NOT NULL  -- 'stock_split', 'symbol_change', 'mint', 'burn'
transaction_hash TEXT NOT NULL UNIQUE
block_number BIGINT NOT NULL
block_timestamp TIMESTAMP NOT NULL
details JSONB NOT NULL
created_at TIMESTAMP DEFAULT NOW()

INDEXES: action_type, block_number
```

### Contract ABI Location
The full ABI is available at:
- `/Users/mylessjs/Desktop/ChainEquity/contracts/out/GatedToken.sol/GatedToken.json`

Extract with:
```bash
cd /Users/mylessjs/Desktop/ChainEquity/contracts
cat out/GatedToken.sol/GatedToken.json | jq '.abi' > ../backend/src/abis/GatedToken.json
```

### Environment Variables
From `/Users/mylessjs/Desktop/ChainEquity/wallet-addresses.txt`:
```bash
# Blockchain
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
CHAIN_ID=84532

# Database (use PUBLIC URL for Railway external connection)
DATABASE_URL=postgresql://postgres:opjpippLFhoVcIuuMllwtrKcSGTBJgar@yamanote.proxy.rlwy.net:23802/railway

# Admin Wallet (for demo transaction signing)
ADMIN_PRIVATE_KEY=0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe
ADMIN_ADDRESS=0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6

# Gnosis Safe (for production multi-sig)
SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d

# Server
PORT=3000
NODE_ENV=development
```

---

## 🛠️ Technical Stack

**Runtime**: Node.js v20.x LTS  
**Language**: TypeScript ^5.3.0  
**Framework**: Express ^4.18.0  
**Web3 Library**: viem ^2.7.0 (modern, type-safe Ethereum interactions)  
**Database Client**: pg (node-postgres) ^8.11.0  
**Validation**: zod ^3.22.0  
**Environment**: dotenv ^16.3.0  
**CORS**: cors ^2.8.5  
**Testing**: Vitest ^1.0.0 (optional)

**Why viem?** Modern alternative to ethers.js with better TypeScript support, smaller bundle size, and built-in support for account abstraction (useful for Gnosis Safe integration if needed).

---

## 🗂️ Project Structure

Create the backend in `/Users/mylessjs/Desktop/ChainEquity/backend/`:

```
backend/
├── src/
│   ├── index.ts                 # Express server entry point
│   ├── config/
│   │   ├── env.ts              # Environment variable validation
│   │   ├── database.ts         # PostgreSQL connection pool
│   │   └── viem.ts             # Blockchain client setup
│   ├── abis/
│   │   └── GatedToken.json     # Contract ABI
│   ├── routes/
│   │   ├── health.ts           # Health check endpoint
│   │   ├── data.ts             # GET endpoints (cap-table, transfers, etc.)
│   │   └── transactions.ts     # POST endpoints (submit txns)
│   ├── services/
│   │   ├── database.service.ts # Database queries
│   │   └── blockchain.service.ts # Transaction submission
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── middleware/
│       ├── errorHandler.ts     # Global error handling
│       └── validation.ts       # Request validation
├── package.json
├── tsconfig.json
├── .env                        # Local environment (copy from root .env)
└── README.md                   # API documentation

```

---

## 🌐 API Endpoint Specifications

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: Will be deployed to Railway (https://[service-name].railway.app)

---

### **1. Health Check**
```
GET /api/health
```

**Purpose**: Verify backend is running and can connect to database and blockchain.

**Response** (200):
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T12:34:56Z",
  "blockchain": {
    "connected": true,
    "chainId": 84532,
    "blockNumber": 33315200
  },
  "database": {
    "connected": true
  }
}
```

**Error** (503):
```json
{
  "status": "error",
  "message": "Database connection failed",
  "timestamp": "2025-11-06T12:34:56Z"
}
```

---

### **2. Cap Table (Current Balances)**
```
GET /api/cap-table
```

**Purpose**: Get current token balances for all holders (read from `balances` table).

**Query Parameters**:
- `minBalance` (optional): Minimum balance to include (default: 0)

**Response** (200):
```json
{
  "capTable": [
    {
      "address": "0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6",
      "balance": "10000000000000000000000000",
      "balanceFormatted": "10,000,000",
      "percentage": "100.00",
      "lastUpdated": "2025-11-06T12:30:00Z"
    }
  ],
  "totalSupply": "10000000000000000000000000",
  "totalHolders": 1,
  "timestamp": "2025-11-06T12:34:56Z"
}
```

**Implementation Notes**:
- Query `balances` table for all addresses with balance > 0
- Calculate percentages based on total supply
- Format large numbers for readability

---

### **3. Transfer History**
```
GET /api/transfers
```

**Purpose**: Get historical transfer events (read from `transfers` table).

**Query Parameters**:
- `address` (optional): Filter by from or to address
- `limit` (optional): Max records to return (default: 100, max: 1000)
- `offset` (optional): Pagination offset (default: 0)
- `fromBlock` (optional): Start block number
- `toBlock` (optional): End block number

**Response** (200):
```json
{
  "transfers": [
    {
      "transactionHash": "0xabc123...",
      "blockNumber": 33313500,
      "blockTimestamp": "2025-11-06T10:15:30Z",
      "from": "0x0000000000000000000000000000000000000000",
      "to": "0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6",
      "amount": "10000000000000000000000000",
      "amountFormatted": "10,000,000",
      "type": "mint"
    }
  ],
  "count": 1,
  "limit": 100,
  "offset": 0,
  "timestamp": "2025-11-06T12:34:56Z"
}
```

**Implementation Notes**:
- Query `transfers` table with filters
- Determine transfer type: mint (from=0x0), burn (to=0x0), or transfer
- Order by block_number DESC (most recent first)

---

### **4. Corporate Actions**
```
GET /api/corporate-actions
```

**Purpose**: Get stock splits, symbol changes, mints, burns (read from `corporate_actions` table).

**Query Parameters**:
- `type` (optional): Filter by action_type ('stock_split', 'symbol_change', 'mint', 'burn')
- `limit` (optional): Max records (default: 50, max: 500)
- `offset` (optional): Pagination offset

**Response** (200):
```json
{
  "actions": [
    {
      "id": 1,
      "actionType": "stock_split",
      "transactionHash": "0xdef456...",
      "blockNumber": 33313600,
      "blockTimestamp": "2025-11-06T11:00:00Z",
      "details": {
        "multiplier": 2,
        "newTotalSupply": "20000000000000000000000000"
      }
    }
  ],
  "count": 1,
  "limit": 50,
  "offset": 0,
  "timestamp": "2025-11-06T12:34:56Z"
}
```

---

### **5. Wallet Information**
```
GET /api/wallet/:address
```

**Purpose**: Get detailed info for a specific wallet (balance, approval status, transaction count).

**Response** (200):
```json
{
  "address": "0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6",
  "balance": "10000000000000000000000000",
  "balanceFormatted": "10,000,000",
  "isApproved": true,
  "approvedAt": "2025-11-05T09:00:00Z",
  "transferCount": 5,
  "firstTransferAt": "2025-11-05T09:30:00Z",
  "lastTransferAt": "2025-11-06T11:00:00Z",
  "timestamp": "2025-11-06T12:34:56Z"
}
```

**Error** (404):
```json
{
  "error": "Wallet not found",
  "address": "0x...",
  "timestamp": "2025-11-06T12:34:56Z"
}
```

---

### **6. Submit Transfer**
```
POST /api/transfer
```

**Purpose**: Submit a token transfer transaction to the blockchain.

**Request Body**:
```json
{
  "to": "0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e",
  "amount": "1000000000000000000000"  // 1000 tokens in wei
}
```

**Validation**:
- `to` must be valid Ethereum address
- `amount` must be positive integer string
- Recipient must be approved (check `approvals` table)

**Response** (200):
```json
{
  "success": true,
  "transactionHash": "0x789abc...",
  "from": "0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6",
  "to": "0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e",
  "amount": "1000000000000000000000",
  "blockExplorerUrl": "https://sepolia.basescan.org/tx/0x789abc...",
  "message": "Transfer submitted successfully",
  "timestamp": "2025-11-06T12:34:56Z"
}
```

**Error** (400):
```json
{
  "error": "Recipient wallet is not approved",
  "to": "0x...",
  "isApproved": false,
  "timestamp": "2025-11-06T12:34:56Z"
}
```

**Implementation Notes**:
- Check recipient approval in database before submitting transaction
- Sign transaction with ADMIN_PRIVATE_KEY
- Submit via viem's `writeContract`
- Wait for transaction hash (don't wait for confirmation)
- Return immediately with transaction hash

---

### **7. Approve Wallet (Admin)**
```
POST /api/admin/approve-wallet
```

**Purpose**: Add a wallet to the allowlist (admin function).

**Request Body**:
```json
{
  "address": "0xefd94a1534959e04630899abdd5d768601f4af5b"
}
```

**Response** (200):
```json
{
  "success": true,
  "transactionHash": "0x111222...",
  "address": "0xefd94a1534959e04630899abdd5d768601f4af5b",
  "blockExplorerUrl": "https://sepolia.basescan.org/tx/0x111222...",
  "message": "Wallet approval submitted",
  "timestamp": "2025-11-06T12:34:56Z"
}
```

**Implementation Notes**:
- Call `approveWallet(address)` on contract
- Sign with ADMIN_PRIVATE_KEY
- Indexer will update `approvals` table when event is detected

---

### **8. Revoke Wallet (Admin)**
```
POST /api/admin/revoke-wallet
```

**Purpose**: Remove a wallet from the allowlist (admin function).

**Request Body**:
```json
{
  "address": "0xefd94a1534959e04630899abdd5d768601f4af5b"
}
```

**Response** (200):
```json
{
  "success": true,
  "transactionHash": "0x333444...",
  "address": "0xefd94a1534959e04630899abdd5d768601f4af5b",
  "blockExplorerUrl": "https://sepolia.basescan.org/tx/0x333444...",
  "message": "Wallet revocation submitted",
  "timestamp": "2025-11-06T12:34:56Z"
}
```

---

### **9. Execute Stock Split (Admin)**
```
POST /api/admin/stock-split
```

**Purpose**: Execute a stock split (admin function).

**Request Body**:
```json
{
  "multiplier": 2
}
```

**Validation**:
- `multiplier` must be integer >= 2

**Response** (200):
```json
{
  "success": true,
  "transactionHash": "0x555666...",
  "multiplier": 2,
  "blockExplorerUrl": "https://sepolia.basescan.org/tx/0x555666...",
  "message": "Stock split submitted (2:1)",
  "timestamp": "2025-11-06T12:34:56Z"
}
```

**Implementation Notes**:
- Call `executeStockSplit(multiplier)` on contract
- Indexer will update `corporate_actions` table when event detected

---

### **10. Update Symbol (Admin)**
```
POST /api/admin/update-symbol
```

**Purpose**: Change the token symbol (admin function).

**Request Body**:
```json
{
  "newSymbol": "CHAINEQUITY-B"
}
```

**Validation**:
- `newSymbol` must be 1-11 characters, uppercase letters/numbers/hyphens only

**Response** (200):
```json
{
  "success": true,
  "transactionHash": "0x777888...",
  "oldSymbol": "CHAINEQUITY-A",
  "newSymbol": "CHAINEQUITY-B",
  "blockExplorerUrl": "https://sepolia.basescan.org/tx/0x777888...",
  "message": "Symbol update submitted",
  "timestamp": "2025-11-06T12:34:56Z"
}
```

---

## 🏗️ Implementation Guidelines

### 1. Project Initialization

```bash
cd /Users/mylessjs/Desktop/ChainEquity
mkdir backend && cd backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express viem pg dotenv zod cors
npm install -D typescript @types/express @types/node @types/cors @types/pg ts-node nodemon

# Initialize TypeScript
npx tsc --init
```

**tsconfig.json** (update generated file):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**package.json** scripts:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest"
  }
}
```

---

### 2. Environment Configuration

**`src/config/env.ts`**:
```typescript
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
```

---

### 3. Database Connection

**`src/config/database.ts`**:
```typescript
import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('👋 Database connection pool closed');
  process.exit(0);
});
```

---

### 4. Blockchain Client

**`src/config/viem.ts`**:
```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { env } from './env';

// Public client for reading blockchain state
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(env.BASE_SEPOLIA_RPC),
});

// Wallet client for sending transactions
const account = privateKeyToAccount(env.ADMIN_PRIVATE_KEY as `0x${string}`);

export const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(env.BASE_SEPOLIA_RPC),
});

console.log(`✅ Blockchain client initialized (Admin: ${account.address})`);
```

---

### 5. Error Handling Middleware

**`src/middleware/errorHandler.ts`**:
```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('❌ Error:', error);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}
```

---

### 6. Main Server

**`src/index.ts`**:
```typescript
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Import routes (create these next)
import healthRouter from './routes/health';
import dataRouter from './routes/data';
import transactionsRouter from './routes/transactions';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', healthRouter);
app.use('/api', dataRouter);
app.use('/api', transactionsRouter);

// Error handling
app.use(errorHandler);

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 ChainEquity Backend API running on port ${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`⛓️  Network: Base Sepolia (Chain ID: ${env.CHAIN_ID})`);
  console.log(`📜 Contract: ${env.CONTRACT_ADDRESS}`);
});
```

---

### 7. Database Service

**`src/services/database.service.ts`**:
```typescript
import { pool } from '../config/database';

export async function getCapTable() {
  const result = await pool.query(`
    SELECT 
      address,
      balance,
      updated_at
    FROM balances
    WHERE balance::numeric > 0
    ORDER BY balance::numeric DESC
  `);
  
  return result.rows;
}

export async function getTransfers(filters: {
  address?: string;
  limit?: number;
  offset?: number;
  fromBlock?: number;
  toBlock?: number;
}) {
  let query = 'SELECT * FROM transfers WHERE 1=1';
  const params: any[] = [];
  
  if (filters.address) {
    params.push(filters.address, filters.address);
    query += ` AND (from_address = $${params.length - 1} OR to_address = $${params.length})`;
  }
  
  if (filters.fromBlock) {
    params.push(filters.fromBlock);
    query += ` AND block_number >= $${params.length}`;
  }
  
  if (filters.toBlock) {
    params.push(filters.toBlock);
    query += ` AND block_number <= $${params.length}`;
  }
  
  query += ' ORDER BY block_number DESC, id DESC';
  
  const limit = Math.min(filters.limit || 100, 1000);
  params.push(limit);
  query += ` LIMIT $${params.length}`;
  
  if (filters.offset) {
    params.push(filters.offset);
    query += ` OFFSET $${params.length}`;
  }
  
  const result = await pool.query(query, params);
  return result.rows;
}

export async function getCorporateActions(filters: {
  type?: string;
  limit?: number;
  offset?: number;
}) {
  let query = 'SELECT * FROM corporate_actions WHERE 1=1';
  const params: any[] = [];
  
  if (filters.type) {
    params.push(filters.type);
    query += ` AND action_type = $${params.length}`;
  }
  
  query += ' ORDER BY block_number DESC, id DESC';
  
  const limit = Math.min(filters.limit || 50, 500);
  params.push(limit);
  query += ` LIMIT $${params.length}`;
  
  if (filters.offset) {
    params.push(filters.offset);
    query += ` OFFSET $${params.length}`;
  }
  
  const result = await pool.query(query, params);
  return result.rows;
}

export async function getWalletInfo(address: string) {
  // Get balance
  const balanceResult = await pool.query(
    'SELECT balance, updated_at FROM balances WHERE address = $1',
    [address.toLowerCase()]
  );
  
  // Get approval status
  const approvalResult = await pool.query(
    'SELECT is_approved, approved_at, revoked_at FROM approvals WHERE address = $1',
    [address.toLowerCase()]
  );
  
  // Get transfer count and dates
  const transfersResult = await pool.query(`
    SELECT 
      COUNT(*) as count,
      MIN(block_timestamp) as first_transfer,
      MAX(block_timestamp) as last_transfer
    FROM transfers
    WHERE from_address = $1 OR to_address = $1
  `, [address.toLowerCase()]);
  
  return {
    balance: balanceResult.rows[0] || { balance: '0', updated_at: null },
    approval: approvalResult.rows[0] || { is_approved: false, approved_at: null, revoked_at: null },
    transfers: transfersResult.rows[0],
  };
}

export async function isWalletApproved(address: string): Promise<boolean> {
  const result = await pool.query(
    'SELECT is_approved FROM approvals WHERE address = $1',
    [address.toLowerCase()]
  );
  
  return result.rows[0]?.is_approved || false;
}
```

---

### 8. Blockchain Service

**`src/services/blockchain.service.ts`**:
```typescript
import { publicClient, walletClient } from '../config/viem';
import { env } from '../config/env';
import GatedTokenABI from '../abis/GatedToken.json';

const CONTRACT_ADDRESS = env.CONTRACT_ADDRESS as `0x${string}`;

export async function submitTransfer(to: string, amount: string) {
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'transfer',
    args: [to as `0x${string}`, BigInt(amount)],
  });
  
  return hash;
}

export async function approveWallet(address: string) {
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'approveWallet',
    args: [address as `0x${string}`],
  });
  
  return hash;
}

export async function revokeWallet(address: string) {
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'revokeWallet',
    args: [address as `0x${string}`],
  });
  
  return hash;
}

export async function executeStockSplit(multiplier: number) {
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'executeStockSplit',
    args: [BigInt(multiplier)],
  });
  
  return hash;
}

export async function updateSymbol(newSymbol: string) {
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'updateSymbol',
    args: [newSymbol],
  });
  
  return hash;
}

export async function getCurrentBlockNumber(): Promise<bigint> {
  return await publicClient.getBlockNumber();
}

export async function getTokenSymbol(): Promise<string> {
  const symbol = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'symbol',
  });
  
  return symbol as string;
}
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist
- [ ] Health endpoint returns 200 with blockchain and database status
- [ ] Cap table endpoint returns current balances
- [ ] Transfer history endpoint returns all transfers
- [ ] Wallet info endpoint returns balance and approval status
- [ ] Submit transfer succeeds for approved recipient
- [ ] Submit transfer fails for non-approved recipient (400 error)
- [ ] Approve wallet submits transaction successfully
- [ ] Stock split submits transaction successfully
- [ ] Update symbol submits transaction successfully
- [ ] All admin endpoints return transaction hashes and block explorer links

### Testing Script
Create `/backend/test-api.sh`:
```bash
#!/bin/bash
BASE_URL="http://localhost:3000/api"

echo "🧪 Testing ChainEquity Backend API"
echo ""

echo "1. Health Check"
curl -X GET "$BASE_URL/health" | jq
echo ""

echo "2. Cap Table"
curl -X GET "$BASE_URL/cap-table" | jq
echo ""

echo "3. Transfers"
curl -X GET "$BASE_URL/transfers?limit=10" | jq
echo ""

echo "4. Wallet Info"
curl -X GET "$BASE_URL/wallet/0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6" | jq
echo ""

echo "✅ Basic tests complete"
```

---

## 🚀 Deployment to Railway

### Prerequisites
- Phase 2B indexer must be running and database schema must exist
- Railway CLI installed: `npm install -g @railway/cli`
- Logged in: `railway login`

### Deploy Steps
```bash
cd /Users/mylessjs/Desktop/ChainEquity/backend

# Link to Railway project
railway link
# Select: ChainEquity-Indexer
# Select: production
# Create new service: backend

# Set environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set BASE_SEPOLIA_RPC=https://sepolia.base.org
railway variables set CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
railway variables set CHAIN_ID=84532
railway variables set ADMIN_PRIVATE_KEY=0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe
railway variables set ADMIN_ADDRESS=0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6
railway variables set SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d

# Use the PUBLIC database URL (Railway will set DATABASE_URL automatically if using their Postgres)
# If not auto-set:
railway variables set DATABASE_URL=postgresql://postgres:opjpippLFhoVcIuuMllwtrKcSGTBJgar@yamanote.proxy.rlwy.net:23802/railway

# Deploy
railway up

# Check logs
railway logs
```

### Create railway.json (Optional)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run build && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 📋 Completion Report Format

When you finish Phase 2A implementation, provide a report in this format:

### Phase 2A: Backend API - COMPLETION REPORT

#### ✅ Implementation Summary
- **Status**: Complete / Partial / Blocked
- **Duration**: [X] hours
- **API Base URL (local)**: http://localhost:3000/api
- **API Base URL (Railway)**: https://[service-name].railway.app/api

#### 📊 Endpoints Implemented
- [ ] GET /api/health
- [ ] GET /api/cap-table
- [ ] GET /api/transfers
- [ ] GET /api/corporate-actions
- [ ] GET /api/wallet/:address
- [ ] POST /api/transfer
- [ ] POST /api/admin/approve-wallet
- [ ] POST /api/admin/revoke-wallet
- [ ] POST /api/admin/stock-split
- [ ] POST /api/admin/update-symbol

#### 🧪 Testing Results
- Manual testing completed: Yes / No
- Health check working: Yes / No
- Database queries working: Yes / No
- Transaction submission working: Yes / No
- Error handling tested: Yes / No

#### 📁 Files Created
List all files created with brief descriptions.

#### 🐛 Known Issues / Limitations
List any bugs, edge cases not handled, or areas needing improvement.

#### 🚀 Deployment Status
- Deployed to Railway: Yes / No
- Railway URL: [URL]
- Environment variables set: Yes / No
- Deployment logs checked: Yes / No

#### 📦 Required for Phase 3 (Frontend)
Provide these values to the frontend developer:
- **Backend API URL**: [Railway URL]
- **Contract Address**: 0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
- **Contract ABI Location**: /Users/mylessjs/Desktop/ChainEquity/contracts/out/GatedToken.sol/GatedToken.json
- **Available Endpoints**: [List with brief descriptions]
- **CORS Configuration**: Enabled for all origins (update for production)

#### 🔄 Next Steps
- Phase 3 (Frontend) can begin immediately
- Recommended: Test all endpoints with Postman/Insomnia before handing off to frontend
- Consider: Add rate limiting and authentication for production

#### 💡 Recommendations
- Any suggestions for improving the API
- Performance optimizations to consider
- Security enhancements for production

---

## 🎯 Success Criteria

Your Phase 2A implementation is complete when:
- [ ] All 10 API endpoints are implemented and tested
- [ ] Backend can query database successfully (cap-table, transfers, corporate actions)
- [ ] Backend can submit transactions to blockchain (transfer, approve wallet, etc.)
- [ ] Error handling works for common failure cases (unapproved recipient, invalid address, RPC errors)
- [ ] Backend is deployed to Railway and accessible via HTTPS
- [ ] Completion report is provided with all required information for Phase 3

---

## 🤝 Questions or Issues?

If you encounter blockers:
1. **Database connection fails**: Verify Phase 2B indexer is running and database tables exist
2. **Transaction submission fails**: Check ADMIN_PRIVATE_KEY has sufficient testnet ETH
3. **RPC rate limiting**: Public RPC is sufficient for demo, but consider Alchemy/QuickNode for production
4. **CORS errors**: Ensure cors middleware is configured correctly

Document all issues in your completion report.

---

**Good luck! You're building the critical backend layer that connects the blockchain to the frontend. Let's make it robust and developer-friendly! 🚀**
