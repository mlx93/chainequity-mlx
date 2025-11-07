# ChainEquity - System Architecture

**Version**: 1.0  
**Last Updated**: November 7, 2025

---

## Executive Summary

ChainEquity is a tokenized securities prototype demonstrating compliant digital equity management on blockchain infrastructure. The system consists of four main components: a gated ERC-20 smart contract, an event indexer, a backend API service, and a React frontend interface.

---

## Technology Stack

### Smart Contracts
- **Language**: Solidity ^0.8.20
- **Framework**: Foundry (forge, cast, anvil)
- **Libraries**: OpenZeppelin Contracts 5.x
  - `ERC20.sol` - Base token implementation
  - `Ownable.sol` - Access control
- **Network**: Base Sepolia Testnet (Chain ID: 84532)
- **Testing**: Foundry's forge test framework with gas reporting

**Why Foundry + OpenZeppelin?**
- Foundry offers faster compilation and testing than Hardhat, with built-in gas reporting critical for success criteria
- OpenZeppelin contracts are industry-standard, audited, and provide proven security
- Base Sepolia provides OP-Stack maturity with EVM equivalence, ready for mainnet migration

### Event Indexer
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Blockchain Library**: viem 2.7.0 (modern alternative to ethers.js)
- **Database Client**: pg (node-postgres) 8.11.0
- **Database**: PostgreSQL 17 (Railway-hosted)
- **Deployment**: Railway containerized service

**Why viem + PostgreSQL?**
- viem provides type-safe, modern blockchain interactions with 10x smaller bundles than ethers.js
- PostgreSQL offers robust query capabilities for historical cap-table reconstruction
- Railway provides seamless deployment with managed PostgreSQL

### Backend API
- **Framework**: Express.js 4.18
- **Language**: TypeScript 5.3
- **Blockchain Library**: viem 2.7.0
- **Database Client**: pg 8.11.0
- **Validation**: zod 3.22.0
- **Deployment**: Railway containerized service

**Why Express + viem?**
- Express is simple and proven for REST APIs
- viem ensures consistent blockchain interaction patterns across services
- TypeScript catches errors at compile time

### Frontend
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Language**: TypeScript 5.9.3 (strict mode)
- **Wallet Integration**: wagmi 2.19.2 + @wagmi/connectors
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind CSS 3.4.17)
- **Data Fetching**: @tanstack/react-query 5.90.7
- **Deployment**: Vercel (serverless)

**Why React + wagmi + shadcn/ui?**
- Job interview context demands polished, professional appearance
- shadcn/ui provides production-quality components with animations
- wagmi makes wallet connection trivial with React hooks
- Vite ensures fast development and builds

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vercel)                      │
│                  React + Vite + wagmi                       │
└───────────────┬──────────────────────┬──────────────────────┘
                │                      │
                │ (Read State)         │ (Write Txns)
                │                      │
                ▼                      ▼
┌────────────────────────┐   ┌─────────────────────────────────┐
│   BACKEND API          │   │   BASE SEPOLIA BLOCKCHAIN       │
│   (Railway)            │   │                                 │
│   Express + TypeScript │   │  ┌───────────────────────────┐  │
│   + viem + PostgreSQL  │   │  │  GatedToken Contract      │  │
│                        │   │  │  (Source of Truth)        │  │
│   Reads: Database      │   │  │  Owned by Gnosis Safe     │  │
│   Writes: Blockchain   │   │  └───────────────────────────┘  │
└────────┬───────────────┘   └──────────────┬──────────────────┘
         │                                   │
         │ (Queries)                         │ (Events)
         │                                   │
         ▼                                   ▼
┌────────────────────────────────────────────────────────────┐
│              POSTGRESQL DATABASE (Railway)                 │
│                                                             │
│  Tables: transfers, balances, approvals, corporate_actions │
│  (Query Cache - derived from blockchain events)            │
└───────────────────────────▲────────────────────────────────┘
                            │
                            │ (Writes)
                            │
                    ┌───────┴────────┐
                    │  EVENT INDEXER │
                    │   (Railway)    │
                    │  Node.js +     │
                    │  viem + pg     │
                    └────────────────┘
```

### Data Flow Principles

**Blockchain as Source of Truth**
- All state-changing operations go through smart contracts
- Database is a read-optimized cache, not primary storage
- If database and blockchain disagree, blockchain is correct

**Event-Driven Synchronization**
- Smart contracts emit events for every state change
- Indexer listens for events 24/7 and writes to database
- Backend reads from database for fast queries
- Backend writes to blockchain for state changes

**Multi-Signature Control**
- Admin functions can only be called by Gnosis Safe contract
- Gnosis Safe requires 2-of-3 signatures for execution
- Frontend doesn't have admin capabilities (view-only)

---

## Project Structure

### Repository Layout

```
ChainEquity/
├── contracts/              # Smart contract development
│   ├── src/
│   │   └── GatedToken.sol  # Main ERC-20 contract
│   ├── test/
│   │   └── GatedToken.t.sol # Foundry test suite
│   ├── script/
│   │   └── Deploy.s.sol    # Deployment script
│   └── foundry.toml        # Foundry configuration
│
├── indexer/                # Event indexing service
│   ├── src/
│   │   ├── index.ts        # Main entry point
│   │   ├── config/         # Environment & viem config
│   │   ├── db/             # Database schema & client
│   │   └── services/       # Event processing logic
│   ├── Dockerfile          # Railway deployment
│   └── package.json
│
├── backend/                # REST API service
│   ├── src/
│   │   ├── index.ts        # Express server
│   │   ├── config/         # Environment & database config
│   │   ├── routes/         # API endpoint handlers
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Error handling & validation
│   ├── Dockerfile          # Railway deployment
│   └── package.json
│
├── ui/                     # React frontend
│   ├── src/
│   │   ├── pages/          # Route pages (Dashboard, InvestorView, CapTable)
│   │   ├── components/     # React components
│   │   │   ├── admin/      # Admin-specific components
│   │   │   ├── investor/   # Investor-specific components
│   │   │   ├── captable/   # Cap table components
│   │   │   ├── transactions/ # Transaction history
│   │   │   ├── layout/     # Header, Layout wrapper
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities & API client
│   │   ├── config/         # wagmi, contracts, API config
│   │   └── types/          # TypeScript interfaces
│   ├── vercel.json         # Vercel deployment config
│   └── package.json
│
├── memory-bank/            # Project knowledge base
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── activeContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   └── progress.md
│
├── docs/                   # Documentation
│   ├── deployment/         # Deployment guides
│   ├── phases/             # Phase completion reports
│   ├── railway/            # Railway-specific docs
│   └── testing/            # Test documentation
│
└── submissionDocs/         # Submission materials
    ├── ARCHITECTURE.md     # This file
    └── TECHNICAL_WRITEUP.md # Technical summary
```

---

## Component Details

### Smart Contract: GatedToken.sol

**Location**: `/contracts/src/GatedToken.sol`

**Key Features**:
- ERC-20 compliant with allowlist-based transfer restrictions
- Virtual stock split implementation (gas-efficient)
- Mutable token symbol
- Multi-sig admin controls via Gnosis Safe

**Key Functions**:
- `transfer(to, amount)` - Gated transfer requiring recipient approval
- `approveWallet(address)` - Admin: Add address to allowlist
- `revokeWallet(address)` - Admin: Remove address from allowlist
- `executeSplit(multiplier)` - Admin: Virtual stock split
- `changeSymbol(newSymbol)` - Admin: Change token ticker
- `mint(to, amount)` - Admin: Create new tokens
- `burn(from, amount)` - Admin: Destroy tokens

**Events Emitted**:
- `Transfer(from, to, value)` - Standard ERC-20
- `WalletApproved(wallet, timestamp)`
- `WalletRevoked(wallet, timestamp)`
- `StockSplit(multiplier, newTotalSupply, timestamp)`
- `SymbolChanged(oldSymbol, newSymbol, timestamp)`
- `TokensMinted(to, amount, minter)`
- `TokensBurned(from, amount, burner)`

**Deployment**:
- Address: `0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e`
- Network: Base Sepolia (Chain ID: 84532)
- Deployment Block: `33313307`
- Owner: **Admin Wallet** `0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6` (Demo Setup)
- Gnosis Safe: `0x6264F29968e8fd2810cB79fb806aC65dAf9db73d` (Created but not used as owner in demo)

**⚠️ Demo vs Production Note**: See "Demo vs Production Deployment" section below for ownership architecture details.

### Event Indexer

**Location**: `/indexer/`

**Responsibilities**:
- Listen for all GatedToken events from block 33313307 onward
- Write events to PostgreSQL database
- Maintain derived state (balances, approval status)
- Backfill historical events on startup
- Run continuously 24/7

**Database Schema**:
```sql
-- Stores all token transfers
transfers (
    id, transaction_hash, block_number, block_timestamp,
    from_address, to_address, amount, event_type, created_at
)

-- Stores current balance for each holder (derived from transfers)
balances (
    address PRIMARY KEY, balance, ownership_percent,
    last_updated_block, last_updated_at, created_at, updated_at
)

-- Stores wallet allowlist status
approvals (
    address PRIMARY KEY, approved, approved_at, approved_at_block,
    revoked_at, revoked_at_block, transaction_hash, created_at, updated_at
)

-- Stores stock splits, symbol changes, mints, burns
corporate_actions (
    id, transaction_hash, block_number, block_timestamp,
    action_type, action_data JSONB, created_at
)
```

**Process Flow**:
1. Connect to Base Sepolia via public RPC
2. Check database for last processed block (or use START_BLOCK)
3. Backfill: Fetch all historical events from START_BLOCK to current
4. Process each event: Parse → Validate → Write to appropriate table(s)
5. Watch: Subscribe to new blocks and process events real-time
6. For Transfer events: Update `transfers` table AND recalculate `balances`
7. For corporate actions: Write to `corporate_actions` with JSONB details

**Deployment**:
- Platform: Railway
- Service: Node.js app (TypeScript compiled to JavaScript)
- Database: Railway PostgreSQL (internal connection)
- Start Command: `node dist/index.js`

### Backend API

**Location**: `/backend/`

**Responsibilities**:
- Serve cap table data from PostgreSQL (fast queries)
- Submit transactions to blockchain (via viem)
- Validate requests before blockchain submission
- Handle transaction signing (Admin wallet for testing, Safe for production)

**API Endpoints**:
```
GET  /api/health              → Service health check
GET  /api/cap-table           → Current balances for all holders
GET  /api/cap-table/historical → Historical cap table at block
GET  /api/cap-table/snapshots → Available historical snapshots
GET  /api/transfers           → Historical transfer data (paginated)
GET  /api/corporate-actions   → Stock splits, symbol changes, etc.
GET  /api/wallet/:address     → Specific wallet info
POST /api/admin/approve-wallet → Admin: Approve wallet
POST /api/admin/revoke-wallet    → Admin: Revoke wallet
POST /api/admin/mint             → Admin: Mint tokens
POST /api/admin/stock-split      → Admin: Execute split
POST /api/admin/update-symbol    → Admin: Change symbol
POST /api/admin/burn-all         → Admin: Burn all tokens (demo reset)
```

**Database Connection**: Uses PUBLIC Railway PostgreSQL URL (external connection)

**Deployment**:
- Platform: Railway
- URL: https://tender-achievement-production-3aa5.up.railway.app/api
- Port: 3001 (Railway auto-assigned)

### Frontend

**Location**: `/ui/`

**Responsibilities**:
- Display cap table and transaction history
- Connect wallet via wagmi/MetaMask
- Show user's token balance and approval status
- Submit transactions via Backend API (admin) or direct contract calls (investor transfers)
- Display admin dashboard for wallet approval, minting, corporate actions
- Real-time data updates via React Query (5-second refresh for cap table)

**Key Components**:
- **Pages**: Dashboard (admin), InvestorView, CapTable, NotConnected
- **Admin Components**: ApprovalForm, MintForm, CorporateActions, BurnAllButton
- **Investor Components**: BalanceCard, TransferForm
- **Shared Components**: TransactionHistory, CapTableGrid, ExportButtons
- **Layout**: Header (wallet connection), Layout (network validation)

**Custom Hooks**:
- `useBalance()` - Query token balance via wagmi
- `useApprovalStatus()` - Check wallet approval
- `useCapTable()` - Fetch cap-table with auto-refresh
- `useHistoricalCapTable()` - Fetch historical cap-table
- `useTransactions()` - Fetch transfer history
- `useIsAdmin()` - Check admin privileges
- `useWalletInfo()` - Fetch wallet details from API

**Deployment**:
- Platform: Vercel
- URL: https://chainequity-mlx.vercel.app/
- Root Directory: `ui/`
- Build Command: `npm run build`
- Output Directory: `dist/`

---

## Key Architectural Decisions

### 1. Virtual Stock Split Implementation

**Decision**: Use a `splitMultiplier` state variable and override `balanceOf()` to multiply on read.

**Rationale**: Traditional approach of updating all balances would cost ~$100+ in gas for 100 holders. Virtual split costs ~$0.50 regardless of holder count. This is how real tokenized securities would implement splits at scale.

**Tradeoff**: Block explorers may show incorrect "base" balances until they implement symbol() caching awareness. Acceptable for demo, would need explorer API updates for production.

### 2. Database as Query Cache

**Decision**: Blockchain is source of truth, database is derived state for fast queries.

**Rationale**: Blockchain queries are slow and rate-limited. Frequent cap-table requests would hit RPC limits. Database allows instant queries.

**Tradeoff**: Slight delay (1-2 seconds) between blockchain state change and database update. Acceptable for cap-table use case (not HFT).

### 3. Event Indexing Start Block

**Decision**: Start indexing from deployment block 33313307, not block 0.

**Rationale**: Contract didn't exist before deployment. Starting from deployment block reduces backfill time from hours to seconds.

**Tradeoff**: None - this is strictly better.

### 4. Gnosis Safe Ownership (Production) vs Single-Sig (Demo)

**Production Design**: All admin functions use `onlyOwner` modifier, contract owned by Gnosis Safe (2-of-3 multi-sig).

**Demo Implementation**: Contract deployed with admin wallet as owner for simplified demonstration.

**Rationale**: Securities compliance requires multi-party controls. No single person should control token issuance. Industry standard for real tokenized securities. Demo uses single-sig to avoid multi-sig coordination complexity during demonstrations.

**Tradeoff**: Demo requires trust in single admin key. Production distributes trust across multiple signers. Admin operations in production require coordination between 2-of-3 signers.

### 5. Allowlist Gating via `_update()` Hook

**Decision**: Override OpenZeppelin's `_update()` internal function to check recipient approval on all transfers.

**Rationale**: Centralized enforcement point catches transfers, mints, and burns. No bypass possible.

**Tradeoff**: Burns require allowlist approval (unusual). Addressed by allowing zero address explicitly.

---

## Design Patterns

### Smart Contract Patterns
- **Access Control**: OpenZeppelin `Ownable` for admin functions
- **Hooks**: Override `_update()` for transfer gating
- **Events**: Comprehensive event emission for off-chain indexing
- **Virtual Functions**: Override `symbol()` for mutable ticker

### Backend Patterns
- **Service Layer**: Business logic separation from routes
- **Environment Configuration**: dotenv for secrets management
- **Error Handling**: Try-catch with proper error responses

### Database Patterns
- **Materialized View**: Balances table is derived from transfers
- **Event Sourcing**: Transfer history is complete event log
- **JSONB Storage**: Corporate action details stored as JSON for flexibility
- **Indexed Lookups**: B-tree indexes on addresses and block numbers

---

## Performance Considerations

### Gas Optimization
- Virtual stock split: O(1) vs O(n) traditional approach
- Transfer gating: Single SLOAD for approval check
- Event emission: Minimal gas overhead

### Query Optimization
- Database indexes on: from_address, to_address, block_number
- Balance lookups: O(1) via primary key
- Cap table query: Single table scan of `balances`

### Scalability Bottlenecks (Acceptable for Demo)
- Public RPC rate limiting: ~100 req/sec
- PostgreSQL connection pool: Limited to Railway tier
- Single-threaded indexer: Processes events sequentially

---

## Deployment Architecture

### Smart Contracts
- **Network**: Base Sepolia Testnet
- **Deployment**: Foundry scripts with manual ownership transfer to Gnosis Safe
- **Verification**: Manual via Basescan UI (optional)

### Backend Services
- **Platform**: Railway
- **Services**: 
  - PostgreSQL Database (managed)
  - Indexer Service (Node.js container)
  - Backend API Service (Node.js container)
- **Deployment**: Git push triggers auto-deploy

### Frontend
- **Platform**: Vercel
- **Deployment**: Git push triggers auto-deploy
- **Build**: Vite production build
- **CDN**: Global edge network

---

## Demo vs Production Deployment

### Current Demo Setup

**Smart Contract Ownership**:
- Contract owner: Admin wallet (`0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6`)
- Deployment script uses: `new GatedToken("ACME Corp Equity", "ACME", adminAddress)`
- Backend signs transactions directly with `ADMIN_PRIVATE_KEY`
- All admin functions (mint, burn, approve, split, symbol) execute immediately with single signature

**Rationale**:
- Simplifies demonstration and testing
- Avoids multi-sig coordination delays during live demos
- Allows rapid iteration during development
- Gnosis Safe exists but is not used as contract owner

**Trust Model**: 
- Single admin key has full control
- Suitable for prototype/demo only
- NOT suitable for production with real securities

### Production Deployment (Recommended)

**Smart Contract Ownership**:
- Contract owner: Gnosis Safe (`0x6264F29968e8fd2810cB79fb806aC65dAf9db73d`)
- Deployment script uses: `new GatedToken("ACME Corp Equity", "ACME", SAFE_ADDRESS)`
- Backend submits transactions TO the Safe (not directly to contract)
- Requires 2-of-3 signatures from Safe signers to execute admin functions

**Migration Steps**:
1. **Update Deployment Script** (`contracts/script/Deploy.s.sol`):
   ```solidity
   // Change line 24 from:
   adminAddress
   
   // To:
   vm.envAddress("SAFE_ADDRESS")
   ```

2. **Update Backend** (`backend/src/config/viem.ts`):
   ```typescript
   // Replace walletClient with Safe SDK integration
   import Safe from '@safe-global/protocol-kit';
   
   const safe = await Safe.create({
     safeAddress: env.SAFE_ADDRESS,
     provider: env.BASE_SEPOLIA_RPC,
   });
   ```

3. **Configure Gnosis Safe**:
   - Add 3 signer addresses
   - Set threshold to 2-of-3
   - Fund Safe with gas ETH
   - Test multi-sig workflow

4. **Update Transaction Submission Flow**:
   - Backend creates transaction data
   - Backend submits to Safe API for signing
   - 2 signers review and approve
   - Transaction executes on-chain

**Benefits**:
- No single point of failure
- Industry-standard security model
- Regulatory compliance alignment
- Audit trail for all admin actions

**Tradeoffs**:
- Slower admin operations (requires coordination)
- More complex backend integration
- Requires multiple signers to be available
- Higher operational overhead

### Comparison Table

| Aspect | Demo Setup | Production Setup |
|--------|------------|------------------|
| **Owner** | Admin wallet (single-sig) | Gnosis Safe (2-of-3 multi-sig) |
| **Transaction Time** | Immediate | Minutes (requires 2 signatures) |
| **Backend Complexity** | Simple (direct signing) | Complex (Safe SDK integration) |
| **Security** | Single key compromise = full control lost | Requires 2 of 3 keys compromised |
| **Compliance** | ❌ Not suitable for production | ✅ Industry standard |
| **Gas Cost** | Lower (single signature) | Higher (multi-sig execution) |
| **Use Case** | Prototype/demo only | Production securities |

---

## Security Considerations

### Multi-Signature Control

**Demo Setup**: 
- Single admin wallet owns contract
- Suitable for prototype demonstration only
- ⚠️ Single point of failure

**Production Setup**:
- All admin functions require Gnosis Safe (2-of-3 signatures)
- No single point of failure for administrative actions
- Industry standard for tokenized securities

### Environment Variables
- All secrets stored in environment variables
- Never committed to Git
- `.env.example` provided as template

### Access Control
- Smart contract enforces allowlist at transfer level
- Backend validates all inputs before blockchain submission
- Frontend provides client-side validation to prevent failed transactions

### Disclaimer
**This is a technical prototype, NOT regulatory-compliant for production use.** Real securities issuance requires legal review, regulatory compliance, and security audits.

---

*Last Updated: November 7, 2025*

