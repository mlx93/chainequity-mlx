# Phase 2B: Event Indexer Development - ChainEquity

**Role**: Event Indexer Specialist Sub-Agent  
**Model Recommendation**: Claude Sonnet 4.5 (better for async/database logic)  
**Estimated Duration**: 4-6 hours  
**Workspace**: `/Users/mylessjs/Desktop/ChainEquity`  
**Can Run in Parallel with**: Phase 2A (Backend API)

---

## Your Mission

Implement the **ChainEquity Event Indexer** - a Node.js/TypeScript service that listens to blockchain events from the deployed GatedToken contract, processes them in real-time, and maintains a PostgreSQL database with current balances, historical transfers, approvals, and corporate actions.

**You are the implementation specialist** - write production-quality TypeScript code with robust event handling and database management.

---

## Project Context

The indexer is the **data layer** of ChainEquity. It watches the blockchain for contract events, processes them, and updates the PostgreSQL database. The Phase 2A Backend queries this database for cap-table reports, transaction history, and approval status.

**Key Principle**: The database is a **query cache** that can be fully reconstructed from blockchain events. The blockchain remains the source of truth.

---

## Phase 1 Outputs (Use These Values)

### **Deployed Contract Information**
```typescript
CONTRACT_ADDRESS = "0xFCc9E74019a2be5808d63A941a84dEbE0fC39964"
DEPLOYMENT_BLOCK = 33313307  // Start indexing from here
CHAIN_ID = 84532
BASE_SEPOLIA_RPC = "https://sepolia.base.org"
```

### **Contract Events to Index**
```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event WalletApproved(address indexed wallet, uint256 timestamp);
event WalletRevoked(address indexed wallet, uint256 timestamp);
event TokensMinted(address indexed to, uint256 amount, address indexed minter);
event TokensBurned(address indexed from, uint256 amount, address indexed burner);
event StockSplit(uint256 multiplier, uint256 newTotalSupply, uint256 timestamp);
event SymbolChanged(string oldSymbol, string newSymbol, uint256 timestamp);
```

### **Contract ABI Location**
```bash
/Users/mylessjs/Desktop/ChainEquity/contracts/out/GatedToken.sol/GatedToken.json
```

### **Environment Variables**
From `/Users/mylessjs/Desktop/ChainEquity/.env`:
```bash
DATABASE_URL=postgresql://postgres:ITpPoRYgfwPwGkhtpysPwOBzczfKQDxQ@postgres.railway.internal:5432/railway
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
```

---

## Technical Stack

**Runtime**: Node.js v20.x LTS  
**Language**: TypeScript ^5.3.0  
**Web3 Library**: viem ^2.7.0 (event watching)  
**Database Client**: pg (node-postgres) ^8.11.0  
**Environment**: dotenv ^16.3.0  
**CSV Generation**: csv-writer ^1.6.0 (optional for exports)

---

## Database Schema

Create these 4 tables in PostgreSQL:

### **Table 1: transfers**
```sql
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    block_timestamp TIMESTAMP NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount NUMERIC(78, 0) NOT NULL,
    event_type VARCHAR(20) NOT NULL, -- 'mint', 'transfer', 'burn'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transfers_block_number ON transfers(block_number);
CREATE INDEX idx_transfers_from_address ON transfers(from_address);
CREATE INDEX idx_transfers_to_address ON transfers(to_address);
CREATE INDEX idx_transfers_timestamp ON transfers(block_timestamp);
```

### **Table 2: balances**
```sql
CREATE TABLE balances (
    address VARCHAR(42) PRIMARY KEY,
    balance NUMERIC(78, 0) NOT NULL DEFAULT 0,
    ownership_percent DECIMAL(5, 2),
    last_updated_block BIGINT NOT NULL,
    last_updated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Table 3: approvals**
```sql
CREATE TABLE approvals (
    address VARCHAR(42) PRIMARY KEY,
    approved BOOLEAN NOT NULL DEFAULT false,
    approved_at TIMESTAMP,
    approved_at_block BIGINT,
    revoked_at TIMESTAMP,
    revoked_at_block BIGINT,
    transaction_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_approvals_approved ON approvals(approved);
```

### **Table 4: corporate_actions**
```sql
CREATE TABLE corporate_actions (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    block_timestamp TIMESTAMP NOT NULL,
    action_type VARCHAR(20) NOT NULL, -- 'split', 'symbol_change'
    action_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_corporate_actions_block_number ON corporate_actions(block_number);
CREATE INDEX idx_corporate_actions_type ON corporate_actions(action_type);
```

---

## Project Structure

```
ChainEquity/
├── indexer/
│   ├── src/
│   │   ├── index.ts              # Indexer entry point
│   │   ├── config/
│   │   │   ├── viem.ts           # Viem public client setup
│   │   │   ├── database.ts       # PostgreSQL connection
│   │   │   └── env.ts            # Environment variable validation
│   │   ├── abis/
│   │   │   └── GatedToken.json   # Contract ABI
│   │   ├── services/
│   │   │   ├── eventProcessor.ts # Process and store events
│   │   │   ├── balanceCalculator.ts # Calculate ownership %
│   │   │   └── backfiller.ts     # Backfill historical events
│   │   ├── db/
│   │   │   ├── schema.sql        # Database schema
│   │   │   └── queries.ts        # Database query functions
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

### **Step 1: Initialize Indexer Project** (10 minutes)

```bash
cd /Users/mylessjs/Desktop/ChainEquity
mkdir indexer && cd indexer

# Initialize npm project
npm init -y

# Install dependencies
npm install viem pg dotenv csv-writer
npm install -D typescript @types/node ts-node nodemon

# Initialize TypeScript
npx tsc --init
```

**Update `tsconfig.json`**: (same as Phase 2A)

**Update `package.json` scripts**:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "init-db": "ts-node src/db/initSchema.ts"
  }
}
```

### **Step 2: Copy Contract ABI** (2 minutes)

```bash
mkdir -p src/abis
cd /Users/mylessjs/Desktop/ChainEquity/contracts
cat out/GatedToken.sol/GatedToken.json | jq '.abi' > ../indexer/src/abis/GatedToken.json
cd ../indexer
```

### **Step 3: Create Environment Configuration** (5 minutes)

Create `indexer/.env`:
```bash
DATABASE_URL=postgresql://postgres:ITpPoRYgfwPwGkhtpysPwOBzczfKQDxQ@postgres.railway.internal:5432/railway
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
START_BLOCK=33313307
POLL_INTERVAL_MS=5000
CHAIN_ID=84532
NODE_ENV=development
```

Create `indexer/.env.example`: (sanitized version)

### **Step 4: Implement Configuration Files** (15 minutes)

**`src/config/env.ts`**: (similar to Phase 2A, add START_BLOCK)

**`src/config/viem.ts`**:
```typescript
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { env } from './env';

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(env.BASE_SEPOLIA_RPC),
});
```

**`src/config/database.ts`**: (same as Phase 2A)

### **Step 5: Create Database Schema File** (10 minutes)

**`src/db/schema.sql`**: Copy the 4 table CREATE statements from above.

**`src/db/initSchema.ts`**:
```typescript
import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';

async function initializeSchema() {
  try {
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf-8'
    );

    await pool.query(schemaSQL);
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Schema initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeSchema();
```

**Run schema initialization**:
```bash
npm run init-db
```

### **Step 6: Implement Event Processor** (60 minutes)

**`src/services/eventProcessor.ts`**:
```typescript
import { Log } from 'viem';
import { pool } from '../config/database';

export async function processTransferEvent(
  log: Log,
  blockTimestamp: bigint
) {
  const { from, to, value } = log.args as any;
  const fromAddress = (from as string).toLowerCase();
  const toAddress = (to as string).toLowerCase();
  const amount = value as bigint;

  // Determine event type
  let eventType = 'transfer';
  if (fromAddress === '0x0000000000000000000000000000000000000000') {
    eventType = 'mint';
  } else if (toAddress === '0x0000000000000000000000000000000000000000') {
    eventType = 'burn';
  }

  // Insert transfer record
  await pool.query(`
    INSERT INTO transfers (
      transaction_hash,
      block_number,
      block_timestamp,
      from_address,
      to_address,
      amount,
      event_type
    ) VALUES ($1, $2, to_timestamp($3), $4, $5, $6, $7)
    ON CONFLICT (transaction_hash) DO NOTHING
  `, [
    log.transactionHash,
    Number(log.blockNumber),
    Number(blockTimestamp),
    fromAddress,
    toAddress,
    amount.toString(),
    eventType,
  ]);

  // Update balances
  await updateBalances(fromAddress, toAddress, amount);

  console.log(`✅ Processed ${eventType}: ${amount.toString()} from ${fromAddress} to ${toAddress}`);
}

async function updateBalances(
  fromAddress: string,
  toAddress: string,
  amount: bigint
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Decrease sender balance (if not mint)
    if (fromAddress !== '0x0000000000000000000000000000000000000000') {
      await client.query(`
        UPDATE balances
        SET balance = balance - $1,
            last_updated_block = $2,
            last_updated_at = NOW(),
            updated_at = NOW()
        WHERE address = $3
      `, [amount.toString(), 0, fromAddress]); // TODO: Get actual block number
    }

    // Increase recipient balance (if not burn)
    if (toAddress !== '0x0000000000000000000000000000000000000000') {
      await client.query(`
        INSERT INTO balances (address, balance, last_updated_block, last_updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (address)
        DO UPDATE SET
          balance = balances.balance + $2,
          last_updated_block = $3,
          last_updated_at = NOW(),
          updated_at = NOW()
      `, [toAddress, amount.toString(), 0]); // TODO: Get actual block number
    }

    // Recalculate ownership percentages
    await recalculateOwnershipPercentages(client);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function recalculateOwnershipPercentages(client: any) {
  await client.query(`
    UPDATE balances
    SET ownership_percent = (
      balance::numeric / NULLIF((SELECT SUM(balance) FROM balances), 0) * 100
    )
    WHERE balance > 0
  `);
}

export async function processWalletApprovedEvent(
  log: Log,
  blockTimestamp: bigint
) {
  const { wallet, timestamp } = log.args as any;
  const address = (wallet as string).toLowerCase();

  await pool.query(`
    INSERT INTO approvals (
      address,
      approved,
      approved_at,
      approved_at_block,
      transaction_hash
    ) VALUES ($1, true, to_timestamp($2), $3, $4)
    ON CONFLICT (address)
    DO UPDATE SET
      approved = true,
      approved_at = to_timestamp($2),
      approved_at_block = $3,
      transaction_hash = $4,
      updated_at = NOW()
  `, [
    address,
    Number(timestamp),
    Number(log.blockNumber),
    log.transactionHash,
  ]);

  console.log(`✅ Wallet approved: ${address}`);
}

export async function processWalletRevokedEvent(
  log: Log,
  blockTimestamp: bigint
) {
  const { wallet, timestamp } = log.args as any;
  const address = (wallet as string).toLowerCase();

  await pool.query(`
    UPDATE approvals
    SET approved = false,
        revoked_at = to_timestamp($1),
        revoked_at_block = $2,
        updated_at = NOW()
    WHERE address = $3
  `, [
    Number(timestamp),
    Number(log.blockNumber),
    address,
  ]);

  console.log(`✅ Wallet revoked: ${address}`);
}

export async function processStockSplitEvent(
  log: Log,
  blockTimestamp: bigint
) {
  const { multiplier, newTotalSupply, timestamp } = log.args as any;

  await pool.query(`
    INSERT INTO corporate_actions (
      transaction_hash,
      block_number,
      block_timestamp,
      action_type,
      action_data
    ) VALUES ($1, $2, to_timestamp($3), 'split', $4)
    ON CONFLICT (transaction_hash) DO NOTHING
  `, [
    log.transactionHash,
    Number(log.blockNumber),
    Number(blockTimestamp),
    JSON.stringify({ multiplier: Number(multiplier), newTotalSupply: newTotalSupply.toString() }),
  ]);

  console.log(`✅ Stock split processed: ${multiplier}x multiplier`);
}

export async function processSymbolChangedEvent(
  log: Log,
  blockTimestamp: bigint
) {
  const { oldSymbol, newSymbol, timestamp } = log.args as any;

  await pool.query(`
    INSERT INTO corporate_actions (
      transaction_hash,
      block_number,
      block_timestamp,
      action_type,
      action_data
    ) VALUES ($1, $2, to_timestamp($3), 'symbol_change', $4)
    ON CONFLICT (transaction_hash) DO NOTHING
  `, [
    log.transactionHash,
    Number(log.blockNumber),
    Number(blockTimestamp),
    JSON.stringify({ oldSymbol, newSymbol }),
  ]);

  console.log(`✅ Symbol changed: ${oldSymbol} → ${newSymbol}`);
}
```

### **Step 7: Implement Main Indexer** (45 minutes)

**`src/index.ts`**:
```typescript
import { publicClient } from './config/viem';
import { env } from './config/env';
import GatedTokenABI from './abis/GatedToken.json';
import {
  processTransferEvent,
  processWalletApprovedEvent,
  processWalletRevokedEvent,
  processStockSplitEvent,
  processSymbolChangedEvent,
} from './services/eventProcessor';

const CONTRACT_ADDRESS = env.CONTRACT_ADDRESS as `0x${string}`;

async function startIndexer() {
  console.log('🚀 ChainEquity Event Indexer Starting...');
  console.log(`📜 Contract: ${CONTRACT_ADDRESS}`);
  console.log(`📊 Starting from block: ${env.START_BLOCK}`);

  // Get current block
  const currentBlock = await publicClient.getBlockNumber();
  console.log(`⛓️  Current block: ${currentBlock}`);

  // Backfill historical events
  console.log('⏪ Backfilling historical events...');
  await backfillEvents(BigInt(env.START_BLOCK), currentBlock);
  console.log('✅ Backfill complete');

  // Watch for new events
  console.log('👀 Watching for new events...');

  // Watch Transfer events
  publicClient.watchEvent({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    eventName: 'Transfer',
    onLogs: async (logs) => {
      for (const log of logs) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
        await processTransferEvent(log, block.timestamp);
      }
    },
  });

  // Watch WalletApproved events
  publicClient.watchEvent({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    eventName: 'WalletApproved',
    onLogs: async (logs) => {
      for (const log of logs) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
        await processWalletApprovedEvent(log, block.timestamp);
      }
    },
  });

  // Watch WalletRevoked events
  publicClient.watchEvent({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    eventName: 'WalletRevoked',
    onLogs: async (logs) => {
      for (const log of logs) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
        await processWalletRevokedEvent(log, block.timestamp);
      }
    },
  });

  // Watch StockSplit events
  publicClient.watchEvent({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    eventName: 'StockSplit',
    onLogs: async (logs) => {
      for (const log of logs) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
        await processStockSplitEvent(log, block.timestamp);
      }
    },
  });

  // Watch SymbolChanged events
  publicClient.watchEvent({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    eventName: 'SymbolChanged',
    onLogs: async (logs) => {
      for (const log of logs) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
        await processSymbolChangedEvent(log, block.timestamp);
      }
    },
  });

  console.log('✅ Indexer running');
}

async function backfillEvents(fromBlock: bigint, toBlock: bigint) {
  // Fetch all historical Transfer events
  const transferLogs = await publicClient.getLogs({
    address: CONTRACT_ADDRESS,
    event: {
      type: 'event',
      name: 'Transfer',
      inputs: [
        { type: 'address', indexed: true, name: 'from' },
        { type: 'address', indexed: true, name: 'to' },
        { type: 'uint256', indexed: false, name: 'value' },
      ],
    },
    fromBlock,
    toBlock,
  });

  console.log(`📥 Found ${transferLogs.length} Transfer events`);

  for (const log of transferLogs) {
    const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
    await processTransferEvent(log as any, block.timestamp);
  }

  // Fetch approval events (similar pattern)
  // ... implement for other event types
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down indexer...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down indexer...');
  process.exit(0);
});

// Start the indexer
startIndexer().catch((error) => {
  console.error('❌ Indexer failed to start:', error);
  process.exit(1);
});
```

### **Step 8: Run Locally** (10 minutes)

```bash
# Initialize database schema
npm run init-db

# Start indexer
npm run dev

# Should see:
# 🚀 ChainEquity Event Indexer Starting...
# ⏪ Backfilling historical events...
# ✅ Backfill complete
# 👀 Watching for new events...
# ✅ Indexer running
```

### **Step 9: Verify Database** (10 minutes)

```bash
# Connect to database
psql $DATABASE_URL

# Check tables
\dt

# Check for data
SELECT COUNT(*) FROM transfers;
SELECT * FROM balances;
SELECT * FROM approvals;
```

---

## Success Criteria

Your Phase 2B is complete when ALL of the following are true:

- [ ] All 4 database tables created
- [ ] Event processors for all 7 event types implemented
- [ ] Backfilling historical events working
- [ ] Real-time event watching active
- [ ] Balance calculations accurate (with ownership %)
- [ ] Database populated with initial contract state
- [ ] Indexer recovers from disconnections
- [ ] TypeScript compiles with no errors
- [ ] README.md with setup instructions

---

## Report Template

```markdown
# Phase 2B: Event Indexer Development - COMPLETE

## Status
✅ Complete

## Deliverables

### 1. Database Schema
- ✅ transfers table (with indexes)
- ✅ balances table
- ✅ approvals table
- ✅ corporate_actions table

### 2. Event Processors
- ✅ Transfer events
- ✅ WalletApproved events
- ✅ WalletRevoked events
- ✅ TokensMinted events
- ✅ TokensBurned events
- ✅ StockSplit events
- ✅ SymbolChanged events

### 3. Database State
- **Transfers indexed**: XX
- **Current balances tracked**: XX wallets
- **Approvals tracked**: XX wallets
- **Corporate actions**: XX

### 4. Files Created
- `indexer/src/index.ts` (XXX lines)
- `indexer/src/services/eventProcessor.ts` (XXX lines)
- `indexer/src/db/schema.sql`
- `indexer/package.json`
- `indexer/README.md`

**Total**: ~XXX lines of TypeScript

### 5. Next Phase Requirements

**For Phase 2A (Backend) - Database Ready:**
All tables populated and queryable ✅

**For Phase 3 (Frontend):**
No direct dependencies - frontend queries backend

## Blockers
None

## Notes
- Indexer starting from block 33313307 (contract deployment)
- Real-time event processing with <5s latency on Base Sepolia
- Balance ownership percentages calculated automatically
- Database can be fully reconstructed by re-running indexer from START_BLOCK
```

---

## Important Notes

### **Naive Indexer Approach**
As discussed in design decisions, we're not handling chain reorgs. Base Sepolia has a centralized sequencer with virtually zero reorg risk.

### **Virtual Split Handling**
The indexer stores raw balances. The contract applies the split multiplier on reads. For accurate cap-tables, the backend must read the contract's `splitMultiplier` and apply it to database balances.

### **Testing Strategy**
- Test with actual contract transactions
- Verify balances match contract's `balanceOf()`
- Confirm ownership percentages sum to 100%

---

## Troubleshooting

**Issue**: Events not being processed
- **Solution**: Check START_BLOCK matches deployment, verify RPC connection

**Issue**: Duplicate key errors
- **Solution**: Check ON CONFLICT clauses in INSERT statements

**Issue**: Balance calculations incorrect
- **Solution**: Verify transfer event processing order, check arithmetic

---

**BEGIN IMPLEMENTATION NOW!**

Start with Step 1 and work methodically. Focus on accurate event processing and data integrity. When complete, provide the filled report template.

Good luck! 🚀

