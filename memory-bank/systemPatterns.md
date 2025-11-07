# ChainEquity - System Patterns

## Architecture Overview

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

## Component Relationships

### Smart Contracts (Phase 1)
**Location**: `/contracts/src/GatedToken.sol`

**Key Functions**:
- `transfer(to, amount)` - Gated transfer requiring recipient approval
- `approveWallet(address)` - Admin: Add address to allowlist
- `revokeWallet(address)` - Admin: Remove address from allowlist
- `executeStockSplit(multiplier)` - Admin: Virtual stock split
- `updateSymbol(newSymbol)` - Admin: Change token ticker
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
- Address: `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964`
- Network: Base Sepolia (Chain ID: 84532)
- Deployment Block: `33313307`
- Owner: **Admin Wallet** `0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6` (Demo Setup)
- Gnosis Safe: `0x6264F29968e8fd2810cB79fb806aC65dAf9db73d` (Created but not used as owner in demo)

### Event Indexer (Phase 2B)
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
transfers (id, transaction_hash, block_number, block_timestamp, 
           from_address, to_address, amount, created_at)

-- Stores current balance for each holder (derived from transfers)
balances (address PRIMARY KEY, balance, updated_at)

-- Stores wallet allowlist status
approvals (address PRIMARY KEY, is_approved, approved_at, 
           revoked_at, updated_at)

-- Stores stock splits, symbol changes, mints, burns
corporate_actions (id, action_type, transaction_hash, block_number,
                   block_timestamp, details JSONB, created_at)
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
- Environment: `DATABASE_URL`, `BASE_SEPOLIA_RPC`, `CONTRACT_ADDRESS`, `START_BLOCK`, `CHAIN_ID`

### Backend API (Phase 2A - Pending)
**Location**: `/backend/`

**Responsibilities**:
- Serve cap table data from PostgreSQL (fast queries)
- Submit transactions to blockchain (via viem)
- Validate requests before blockchain submission
- Handle transaction signing (Admin wallet for testing, Safe for production)

**API Endpoints** (Planned):
```
GET  /api/cap-table           → Current balances for all holders
GET  /api/transfers           → Historical transfer data
GET  /api/corporate-actions   → Stock splits, symbol changes, etc.
GET  /api/wallet/:address     → Specific wallet info
POST /api/transfer            → Submit transfer transaction
POST /api/approve-wallet      → Admin: Approve wallet
POST /api/revoke-wallet       → Admin: Revoke wallet
POST /api/stock-split         → Admin: Execute split
POST /api/update-symbol       → Admin: Change symbol
```

**Database Connection**: Uses PUBLIC Railway PostgreSQL URL (external connection)

### Frontend (Phase 3 - COMPLETE)
**Location**: `/ui/`

**Responsibilities**:
- Display cap table and transaction history
- Connect wallet via wagmi/MetaMask
- Show user's token balance and approval status
- Submit transactions via Backend API (admin) or direct contract calls (investor transfers)
- Display admin dashboard for wallet approval, minting, corporate actions
- Real-time data updates via React Query (5-second refresh for cap table)

**Technology Stack**:
- React 19 + Vite + TypeScript
- wagmi 2.19.2 for Web3 integration
- shadcn/ui + Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching and caching

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
- `useTransactions()` - Fetch transfer history
- `useIsAdmin()` - Check admin privileges
- `useWalletInfo()` - Fetch wallet details from API

**API Integration**:
- Base URL: `https://tender-achievement-production-3aa5.up.railway.app/api`
- All 10 backend endpoints wrapped in `lib/api.ts`
- Direct contract calls for investor transfers (better UX)

**Deployment**:
- Platform: Vercel
- URL: https://chainequity-mlx.vercel.app/
- Root Directory: `ui/`
- Build Command: `npm run build`
- Output Directory: `dist/`
- Environment Variables: VITE_* prefixed (exposed to client)

## Key Technical Decisions

### 1. Virtual Stock Split Implementation
**Decision**: Use a `splitMultiplier` state variable and override `balanceOf()` to multiply on read.

**Rationale**: Traditional approach of updating all balances would cost ~$100+ in gas for 100 holders. Virtual split costs ~$0.50 regardless of holder count.

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

**Rationale**: Securities compliance requires multi-party controls. No single person should control token issuance in production. Demo uses single-sig to avoid multi-sig coordination complexity during demonstrations.

**How It Works**:
- **Demo Setup**: 
  - Admin wallet (`0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6`) is the contract owner
  - Backend signs transactions directly with `ADMIN_PRIVATE_KEY`
  - All admin functions (mint, burn, approve, split, symbol change) work immediately
  - Gnosis Safe exists (`0x6264F29968e8fd2810cB79fb806aC65dAf9db73d`) but is not used as owner

- **Production Setup** (how it should be deployed):
  - Deploy contract with Gnosis Safe address as owner (change line 24 in `Deploy.s.sol`)
  - Backend submits transactions TO the Safe (not directly to contract)
  - Requires 2-of-3 signatures to execute any admin function
  - Admin wallet becomes one of the Safe signers, not the contract owner

**Migration Path**: To convert demo to production:
1. Deploy new GatedToken with Safe as owner: `new GatedToken("Name", "SYMBOL", SAFE_ADDRESS)`
2. Update backend to use Safe SDK for transaction submission
3. Configure Safe with appropriate signers and threshold
4. Test all admin operations with multi-sig workflow

**Tradeoff**: Demo requires trust in single admin key. Production distributes trust across multiple signers.

### 5. Allowlist Gating via `_update()` Hook
**Decision**: Override OpenZeppelin's `_update()` internal function to check recipient approval on all transfers.

**Rationale**: Centralized enforcement point catches transfers, mints, and burns. No bypass possible.

**Tradeoff**: Burns require allowlist approval (unusual). Addressed by allowing zero address explicitly.

## Design Patterns in Use

### Smart Contract Patterns
- **Access Control**: OpenZeppelin `Ownable` for admin functions
- **Hooks**: Override `_update()` for transfer gating
- **Events**: Comprehensive event emission for off-chain indexing
- **Virtual Functions**: Override `symbol()` for mutable ticker
- **Pausability**: Not implemented (out of scope for demo)

### Backend Patterns
- **Repository Pattern**: Database access layer abstraction (planned)
- **Service Layer**: Business logic separation from routes (planned)
- **Environment Configuration**: dotenv for secrets management
- **Error Handling**: Try-catch with proper error responses (planned)

### Database Patterns
- **Materialized View**: Balances table is derived from transfers
- **Event Sourcing**: Transfer history is complete event log
- **JSONB Storage**: Corporate action details stored as JSON for flexibility
- **Indexed Lookups**: B-tree indexes on addresses and block numbers

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

