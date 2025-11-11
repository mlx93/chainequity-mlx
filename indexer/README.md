# ChainEquity Event Indexer

Real-time blockchain event indexer for the ChainEquity GatedToken contract on Base Sepolia.

## Overview

The indexer watches the deployed GatedToken contract for events and maintains a PostgreSQL database with:
- **Transfers**: All token transfers, mints, and burns
- **Balances**: Current token balances with ownership percentages
- **Approvals**: Wallet approval/revocation status
- **Corporate Actions**: Stock splits and symbol changes

## Features

- ✅ Real-time event watching with `viem`
- ✅ Historical event backfilling from deployment block
- ✅ Automatic balance calculations with ownership percentages
- ✅ Handles all 7 contract event types
- ✅ PostgreSQL with proper indexes for fast queries
- ✅ TypeScript with strict type checking
- ✅ Graceful error handling and recovery

## Architecture

```
┌─────────────────────┐
│  Base Sepolia RPC   │
│  (Blockchain)       │
└──────────┬──────────┘
           │ Events
           ▼
┌─────────────────────┐
│   Event Indexer     │
│   (This Service)    │
└──────────┬──────────┘
           │ SQL Writes
           ▼
┌─────────────────────┐
│   PostgreSQL DB     │
│   (Railway)         │
└──────────┬──────────┘
           │ Queries
           ▼
┌─────────────────────┐
│   Backend API       │
│   (Phase 2A)        │
└─────────────────────┘
```

## Prerequisites

- Node.js v20.x LTS
- PostgreSQL database (Railway)
- Base Sepolia RPC access
- Deployed GatedToken contract

## Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

## Environment Variables

```bash
# Database connection (Railway PostgreSQL)
DATABASE_URL=postgresql://username:password@host:5432/database

# Base Sepolia RPC endpoint
BASE_SEPOLIA_RPC=https://sepolia.base.org

# GatedToken contract address
CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964

# Block to start indexing from (contract deployment block)
START_BLOCK=33313307

# Polling interval in milliseconds
POLL_INTERVAL_MS=5000

# Chain ID (Base Sepolia)
CHAIN_ID=84532

# Environment
NODE_ENV=development
```

## Database Schema

### Tables

1. **transfers**: All transfer events with metadata
2. **balances**: Current token balances per address
3. **approvals**: Wallet approval status
4. **corporate_actions**: Stock splits and symbol changes

### Initialize Database

```bash
# Run schema initialization (creates tables and indexes)
npm run init-db
```

This creates:
- 4 tables with proper constraints
- 6 indexes for query optimization
- JSONB support for flexible corporate action data

## Usage

### Development Mode

```bash
# Start with hot-reload
npm run dev
```

### Production Mode

```bash
# Build TypeScript
npm run build

# Start compiled version
npm start
```

### Expected Output

```
🚀 ChainEquity Event Indexer Starting...
📜 Contract: 0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
📊 Starting from block: 33313307
⛓️  Current block: 33315000
⏪ Backfilling historical events...
📥 Found 42 Transfer events
✅ Processed mint: 1000000 from 0x0000... to 0x6264...
✅ Processed transfer: 500000 from 0x6264... to 0x1234...
✅ Backfill complete
👀 Watching for new events...
✅ Indexer running
📡 Listening for blockchain events...
```

## Database Queries

### Check Indexed Data

```sql
-- View all transfers
SELECT * FROM transfers ORDER BY block_timestamp DESC LIMIT 10;

-- View current balances
SELECT 
  address,
  balance,
  ownership_percent,
  last_updated_at
FROM balances
ORDER BY balance DESC;

-- View approved wallets
SELECT * FROM approvals WHERE approved = true;

-- View corporate actions
SELECT 
  action_type,
  action_data,
  block_timestamp
FROM corporate_actions
ORDER BY block_timestamp DESC;

-- Calculate total supply
SELECT SUM(balance) as total_supply FROM balances;
```

## Events Indexed

| Event | Description | Indexed Fields |
|-------|-------------|----------------|
| `Transfer` | Token transfers, mints, burns | `from`, `to` |
| `WalletApproved` | Wallet approved for trading | `wallet` |
| `WalletRevoked` | Wallet revoked from trading | `wallet` |
| `TokensMinted` | New tokens created | `to`, `minter` |
| `TokensBurned` | Tokens destroyed | `from`, `burner` |
| `StockSplit` | Virtual stock split executed | none |
| `SymbolChanged` | Token symbol changed | none |

## File Structure

```
indexer/
├── src/
│   ├── index.ts              # Main indexer entry point
│   ├── config/
│   │   ├── env.ts            # Environment validation
│   │   ├── viem.ts           # Viem client setup
│   │   └── database.ts       # PostgreSQL connection
│   ├── services/
│   │   └── eventProcessor.ts # Event processing logic
│   ├── db/
│   │   ├── schema.sql        # Database schema
│   │   └── initSchema.ts     # Schema initialization
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   └── abis/
│       └── GatedToken.json   # Contract ABI
├── package.json
├── tsconfig.json
├── .env
└── README.md
```

## Deployment (Railway)

### Option 1: Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Connect Railway to repository
3. Railway auto-deploys on push
4. Set environment variables in Railway dashboard

### Environment Variables on Railway

Set these in the Railway dashboard:

```
DATABASE_URL=<provided by Railway PostgreSQL>
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
START_BLOCK=33313307
CHAIN_ID=84532
NODE_ENV=production
```

## Performance

- **Backfill Speed**: ~100 blocks/second
- **Real-time Latency**: <5 seconds on Base Sepolia
- **Memory Usage**: ~50MB steady state
- **Database Writes**: Batched with transactions

## Error Handling

- Network failures: Automatic reconnection
- Database errors: Transaction rollbacks
- Invalid events: Logged and skipped
- Graceful shutdown: SIGINT/SIGTERM handlers

## Monitoring

### Health Checks

```bash
# Check if indexer is running
ps aux | grep "node.*index"

# Check database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM transfers;"

# View recent logs
tail -f indexer.log
```

### Key Metrics

- Total transfers indexed
- Current block number vs chain tip
- Balance table accuracy (compare with contract)
- Event processing errors

## Troubleshooting

### Issue: Events not being processed

**Solution**: 
- Check START_BLOCK matches contract deployment
- Verify RPC connection: `curl $BASE_SEPOLIA_RPC`
- Check contract address is correct

### Issue: Database connection fails

**Solution**:
- Verify DATABASE_URL is correct
- Check Railway PostgreSQL status
- Ensure database exists and is accessible

### Issue: Balance calculations incorrect

**Solution**:
- Verify all Transfer events are indexed
- Check for duplicate transactions (ON CONFLICT)
- Recalculate ownership percentages manually

### Issue: Duplicate key errors

**Solution**: All INSERT statements use `ON CONFLICT DO NOTHING` or `DO UPDATE` - check logs for actual error

## Testing Strategy

1. **Backfill Test**: Clear database, restart indexer, verify all historical events processed
2. **Balance Accuracy**: Compare database balances with `contract.balanceOf(address)`
3. **Ownership Percentages**: Verify they sum to 100%
4. **Event Coverage**: Generate test events on-chain, verify indexed

## Known Limitations

1. **No Reorg Handling**: Base Sepolia has a centralized sequencer with virtually zero reorg risk (acceptable for MVP)
2. **Virtual Splits**: Indexer stores raw balances; backend must apply `splitMultiplier` from contract for accurate cap tables
3. **Network-Only Database**: Railway DATABASE_URL uses internal hostname; only accessible from deployed services

## Integration with Backend (Phase 2A)

The backend queries this database for:
- Cap table reports (balances + ownership %)
- Transaction history (transfers table)
- Approval status (approvals table)
- Corporate action history (corporate_actions table)

**Important**: Backend must read `splitMultiplier()` from the contract and multiply database balances to get current balances.

## Phase 1 Contract Information

- **Contract Address**: `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964`
- **Deployment Block**: `33313307`
- **Network**: Base Sepolia (Chain ID: 84532)
- **Basescan**: https://sepolia.basescan.org/address/0xFCc9E74019a2be5808d63A941a84dEbE0fC39964

## Resources

- [Viem Documentation](https://viem.sh/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Base Sepolia Explorer](https://sepolia.basescan.org/)
- [Phase 1 Contract README](/Users/mylessjs/Desktop/ChainEquity/contracts/README.md)

## License

MIT

---

**Built with ❤️ for ChainEquity Phase 2B**




