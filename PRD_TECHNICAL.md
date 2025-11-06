# ChainEquity - Technical Specification Document

**Version**: 1.0  
**Project**: Tokenized Security Prototype - Technical Architecture  
**Last Updated**: 2025-01-06

---

## System Architecture

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                     BASE SEPOLIA BLOCKCHAIN                  │
│                    (Source of Truth - Immutable)             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         GatedToken Smart Contract                   │    │
│  │  - ERC-20 with Allowlist                           │    │
│  │  - Transfer Restrictions                           │    │
│  │  - Corporate Actions (Split, Symbol)              │    │
│  │  - Owner: Gnosis Safe (2-of-3 Multi-Sig)         │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▲                                   │
│                          │ Transactions                      │
└──────────────────────────┼───────────────────────────────────┘
                           │ Events (Transfer, Approved, etc.)
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌──────────────────┐              ┌──────────────────────┐
│  Backend Service │              │   Event Indexer      │
│  (Issuer API)    │              │   (Read-Only)        │
├──────────────────┤              ├──────────────────────┤
│ - Wallet Approval│              │ - Listen to Events   │
│ - Token Minting  │              │ - Calculate Balances │
│ - Corp. Actions  │◄─────────────┤ - Historical Queries │
│ - Safe Interface │   Reads DB   │ - Cap-Table Export   │
└──────────────────┘              └──────────────────────┘
        │                                     │
        │ Writes                             │ Writes
        ▼                                     ▼
┌─────────────────────────────────────────────────────┐
│            PostgreSQL Database (Railway)             │
│              (Query Cache - Reconstructible)         │
├─────────────────────────────────────────────────────┤
│  Tables:                                            │
│  - transfers (all historical Transfer events)        │
│  - balances (current state per wallet)              │
│  - approvals (allowlist state with timestamps)      │
│  - corporate_actions (splits, symbol changes)       │
└─────────────────────────────────────────────────────┘
                           │
                           │ Reads
                           ▼
┌──────────────────────────────────────────────────────┐
│         React Frontend (Vercel)                      │
├──────────────────────────────────────────────────────┤
│  - wagmi (wallet connection)                        │
│  - Admin Dashboard (approve, mint, corp actions)    │
│  - Investor View (balance, transfer)                │
│  - Cap-Table View (export, historical)              │
└──────────────────────────────────────────────────────┘
                           │
                           │ MetaMask
                           ▼
                    ┌──────────────┐
                    │  User Wallet │
                    │ (3 test keys) │
                    └──────────────┘
```

### **Data Flow Examples**

**Flow 1: Admin Approves Wallet**
1. Admin clicks "Approve" in UI → Frontend calls backend API
2. Backend validates input → Prepares Safe transaction
3. Safe requires 2/3 signatures → Admin signs in MetaMask
4. Second signer approves → Transaction submitted to blockchain
5. Contract emits `WalletApproved` event
6. Indexer catches event → Updates approvals table in DB
7. Frontend polls DB → Shows "Approved" status

**Flow 2: Investor Transfers Tokens**
1. Investor enters recipient + amount in UI → Frontend validates both are approved
2. Frontend calls contract directly via wagmi (no backend)
3. Contract checks sender AND recipient on allowlist
4. If both approved → Transfer succeeds, emits `Transfer` event
5. Indexer catches event → Updates balances table
6. Both wallets see updated balances in UI

**Flow 3: Export Historical Cap-Table**
1. User enters block number in UI → Frontend calls backend API
2. Backend queries DB: `SELECT * FROM transfers WHERE block_number <= N`
3. Backend calculates balances at that point in time
4. Backend generates CSV/JSON file
5. Frontend downloads file to user

---

## Tech Stack

### **Smart Contracts**
- **Solidity**: `^0.8.20` (latest stable)
- **Foundry**: `v0.2.0+` (development framework)
  - `forge`: Compilation, testing, deployment
  - `cast`: CLI interactions with contracts
  - `anvil`: Local testnet (optional for local dev)
- **OpenZeppelin Contracts**: `v5.0.0`
  - `@openzeppelin/contracts/token/ERC20/ERC20.sol`
  - `@openzeppelin/contracts/access/Ownable.sol`
- **Gnosis Safe**: Deployed manually via Safe UI (no SDK needed)

### **Backend (Issuer Service)**
- **Runtime**: Node.js `v20.x` LTS
- **Language**: TypeScript `^5.3.0`
- **Framework**: Express `^4.18.0`
- **Web3 Library**: viem `^2.7.0` (modern Ethereum interactions)
- **Database Client**: node-postgres `pg ^8.11.0`
- **Validation**: zod `^3.22.0` (input validation)
- **Environment**: dotenv `^16.3.0`

### **Event Indexer**
- **Runtime**: Node.js `v20.x` LTS
- **Language**: TypeScript `^5.3.0`
- **Web3 Library**: viem `^2.7.0`
- **Database Client**: node-postgres `pg ^8.11.0`
- **CSV Generation**: csv-writer `^1.6.0`

### **Frontend**
- **Framework**: React `^18.2.0`
- **Build Tool**: Vite `^5.0.0`
- **Language**: TypeScript `^5.3.0`
- **Web3**: wagmi `^2.4.0` (React hooks for Ethereum)
- **Wallet Connector**: @wagmi/core, @wagmi/connectors
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind)
  - Radix UI: `@radix-ui/react-*` (accessible components)
  - Lucide Icons: `lucide-react` (icon library)
- **Styling**: Tailwind CSS `^3.4.0`
- **Forms**: react-hook-form `^7.49.0`
- **Routing**: react-router-dom `^6.21.0`

### **Database**
- **System**: PostgreSQL `15.x`
- **Hosting**: Railway (managed Postgres addon)
- **Local Dev**: Docker container or native install

### **Deployment & DevOps**
- **Frontend Hosting**: Vercel (serverless, edge deployment)
- **Backend Hosting**: Railway (containerized deployment)
- **Container Orchestration**: Docker Compose (local dev)
- **CI/CD**: GitHub Actions (optional, manual deployment acceptable)
- **RPC Provider**: Public Base Sepolia RPC + Alchemy/QuickNode backup

---

## Smart Contract Specification

### **GatedToken.sol - Core Contract**

**Purpose**: ERC-20 token with allowlist-based transfer restrictions

**Inheritance**:
```solidity
contract GatedToken is ERC20, Ownable
```

**State Variables**:
```solidity
// Allowlist mapping: address => approved status
mapping(address => bool) public allowlist;

// Virtual split multiplier (starts at 1, multiply for splits)
uint256 public splitMultiplier;

// Token metadata
string private _tokenSymbol;
string private _tokenName;

// Corporate action tracking
uint256 public totalSplits;
uint256 public lastSplitBlock;
```

**Events**:
```solidity
event WalletApproved(address indexed wallet, uint256 timestamp);
event WalletRevoked(address indexed wallet, uint256 timestamp);
event TokensMinted(address indexed to, uint256 amount, address indexed minter);
event TokensBurned(address indexed from, uint256 amount, address indexed burner);
event StockSplit(uint256 multiplier, uint256 newTotalSupply, uint256 timestamp);
event SymbolChanged(string oldSymbol, string newSymbol, uint256 timestamp);
```

**Constructor**:
```solidity
constructor(
    string memory name,
    string memory symbol,
    address safeAddress
) ERC20(name, symbol) Ownable(safeAddress) {
    splitMultiplier = 1;
    _tokenName = name;
    _tokenSymbol = symbol;
}
```

**Core Functions**:

```solidity
// Allowlist Management
function approveWallet(address wallet) external onlyOwner;
function revokeWallet(address wallet) external onlyOwner;
function isApproved(address wallet) external view returns (bool);

// Minting (only to approved wallets)
function mint(address to, uint256 amount) external onlyOwner;

// Burning (from approved wallets)
function burn(address from, uint256 amount) external onlyOwner;
// Logic: require(allowlist[from], "Cannot burn from unapproved wallet");
//        _burn(from, amount);

// Transfer Override (ERC-20 with allowlist check)
function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override;
// Logic: require(from == address(0) || allowlist[from], "Sender not approved");
//        require(allowlist[to], "Recipient not approved");

// Corporate Actions
function executeSplit(uint256 multiplier) external onlyOwner;
// Logic: splitMultiplier *= multiplier; _totalSupply *= multiplier;

function changeSymbol(string memory newSymbol) external onlyOwner;
// Logic: emit SymbolChanged(_tokenSymbol, newSymbol, block.timestamp);
//        _tokenSymbol = newSymbol;

// Virtual Split Support
function balanceOf(address account) public view override returns (uint256);
// Logic: return _rawBalances[account] * splitMultiplier;
```

**Gas Optimization Notes**:
- Use `mapping` instead of arrays for allowlist (O(1) lookup)
- Virtual split avoids iterating through all holders
- Custom errors instead of string reverts (Solidity 0.8.4+)
- Pack state variables when possible

**Security Considerations**:
- `onlyOwner` modifier on all admin functions (owner = Safe address)
- Reentrancy not a concern (no external calls to untrusted contracts)
- Integer overflow protection (Solidity 0.8.x default)
- Zero address checks on minting/approvals

### **Gas Benchmarks (Expected on Base Sepolia)**

The following gas costs are targets for the prototype. Actual costs will be verified during Phase 4 testing using Foundry's built-in gas reporter (`forge test --gas-report`).

| Operation | Target Gas | Expected Actual | Notes |
|-----------|-----------|-----------------|-------|
| Approve Wallet | <50k | ~45k | Simple mapping update |
| Revoke Wallet | <50k | ~45k | Mapping deletion |
| Mint Tokens | <100k | ~80k | Mint + approval check |
| Transfer (gated) | <100k | ~75k | Transfer + 2x allowlist checks |
| Stock Split | <100k | ~60k | Update multiplier only (virtual) |
| Symbol Change | <50k | ~35k | String storage update |

*Actual costs may vary by ±10% based on calldata size and network conditions. Base Sepolia with EIP-4844 blob pricing makes these costs negligible (~$0.001-0.01 per transaction).*

---

## Backend API Specification

### **Base URL**: `https://chainequity-backend.up.railway.app`

### **Authentication**: None (prototype only, testnet addresses)

### **Endpoints**

#### **1. Health Check**
```
GET /health
```
**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-06T12:34:56Z",
  "blockchain": {
    "connected": true,
    "chainId": 84532,
    "blockNumber": 12345678
  }
}
```

#### **2. Approve Wallet**
```
POST /admin/approve
```
**Request Body**:
```json
{
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```
**Response**:
```json
{
  "success": true,
  "transactionHash": "0xabc...",
  "status": "pending",
  "message": "Approval transaction submitted, awaiting Safe signatures"
}
```
**Errors**:
- `400`: Invalid wallet address format
- `409`: Wallet already approved
- `500`: Transaction submission failed

#### **3. Revoke Wallet**
```
POST /admin/revoke
```
**Request Body**:
```json
{
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```
**Response**: Same as approve

#### **4. Mint Tokens**
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
- `to` must be approved wallet (check allowlist first)
- `amount` must be positive integer string
**Response**:
```json
{
  "success": true,
  "transactionHash": "0xdef...",
  "tokensM inted": "10000",
  "recipient": "0x1234..."
}
```

#### **5. Check Approval Status**
```
GET /wallet/:address/status
```
**Response**:
```json
{
  "address": "0x1234...",
  "approved": true,
  "approvedAt": "2025-01-05T10:20:30Z",
  "approvedAtBlock": 12345000
}
```

#### **6. Execute Stock Split**
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
**Response**:
```json
{
  "success": true,
  "transactionHash": "0xghi...",
  "multiplier": 7,
  "newTotalSupply": "70000",
  "message": "Stock split executed: all balances multiplied by 7"
}
```

#### **7. Change Symbol**
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
**Response**:
```json
{
  "success": true,
  "transactionHash": "0xjkl...",
  "oldSymbol": "ACME",
  "newSymbol": "ACMEX"
}
```

#### **8. Get Current Cap-Table**
```
GET /cap-table
```
**Response**:
```json
{
  "totalSupply": "70000",
  "holderCount": 8,
  "blockNumber": 12345678,
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

#### **9. Get Historical Cap-Table**
```
GET /cap-table/historical?blockNumber=12340000
```
**Response**: Same format as current cap-table but calculated at specified block

#### **10. Export Cap-Table**
```
GET /cap-table/export?format=csv
GET /cap-table/export?format=json
```
**Query Params**:
- `format`: "csv" or "json"
- `blockNumber` (optional): Historical snapshot
**Response**:
- CSV: `Content-Type: text/csv`, filename in header
- JSON: Same as GET /cap-table response

#### **11. Transaction History**
```
GET /transactions?page=1&limit=50&address=0xAAA...
```
**Query Params**:
- `page`: Page number (default 1)
- `limit`: Results per page (default 50, max 100)
- `address` (optional): Filter by wallet address
**Response**:
```json
{
  "transactions": [
    {
      "hash": "0xabc...",
      "blockNumber": 12345678,
      "timestamp": "2025-01-06T12:00:00Z",
      "type": "transfer",
      "from": "0xAAA...",
      "to": "0xBBB...",
      "amount": "3000"
    },
    {
      "hash": "0xdef...",
      "blockNumber": 12345670,
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

### **Safe Transaction Integration Note**

Current implementation uses manual Safe UI signing for demo purposes. Production enhancement could integrate Safe Transaction Service API for programmatic signature collection and execution monitoring.

---

## Database Schema

### **PostgreSQL Schema**

#### **Table: transfers**
```sql
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    block_timestamp TIMESTAMP NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount NUMERIC(78, 0) NOT NULL,  -- uint256 support
    event_type VARCHAR(20) NOT NULL, -- 'mint', 'transfer', 'burn'
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_block_number (block_number),
    INDEX idx_from_address (from_address),
    INDEX idx_to_address (to_address),
    INDEX idx_timestamp (block_timestamp)
);
```

#### **Table: balances**
```sql
CREATE TABLE balances (
    address VARCHAR(42) PRIMARY KEY,
    balance NUMERIC(78, 0) NOT NULL DEFAULT 0,
    ownership_percent DECIMAL(5, 2), -- e.g., 70.00
    last_updated_block BIGINT NOT NULL,
    last_updated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Table: approvals**
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
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_approved (approved)
);
```

#### **Table: corporate_actions**
```sql
CREATE TABLE corporate_actions (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    block_timestamp TIMESTAMP NOT NULL,
    action_type VARCHAR(20) NOT NULL, -- 'split', 'symbol_change'
    action_data JSONB NOT NULL,       -- e.g., {"multiplier": 7} or {"old": "ACME", "new": "ACMEX"}
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_block_number (block_number),
    INDEX idx_action_type (action_type)
);
```

### **Database Queries**

**Current Cap-Table**:
```sql
SELECT
    address,
    balance,
    (balance::float / (SELECT SUM(balance) FROM balances) * 100) AS ownership_percent
FROM balances
WHERE balance > 0
ORDER BY balance DESC;
```

**Historical Cap-Table at Block N**:
```sql
-- Reconstruct balances from transfers up to block N
WITH historical_transfers AS (
    SELECT
        from_address AS address,
        -SUM(amount) AS net_change
    FROM transfers
    WHERE block_number <= :blockNumber AND from_address != '0x0000000000000000000000000000000000000000'
    GROUP BY from_address
    UNION ALL
    SELECT
        to_address AS address,
        SUM(amount) AS net_change
    FROM transfers
    WHERE block_number <= :blockNumber
    GROUP BY to_address
)
SELECT
    address,
    SUM(net_change) AS balance,
    (SUM(net_change)::float / (SELECT SUM(net_change) FROM historical_transfers) * 100) AS ownership_percent
FROM historical_transfers
GROUP BY address
HAVING SUM(net_change) > 0
ORDER BY balance DESC;
```

**Transaction History**:
```sql
SELECT
    transaction_hash,
    block_number,
    block_timestamp,
    event_type,
    from_address,
    to_address,
    amount
FROM transfers
WHERE (:address IS NULL OR from_address = :address OR to_address = :address)
ORDER BY block_number DESC
LIMIT :limit OFFSET :offset;
```

---

## Frontend Architecture

### **Application Structure**

```
ui/
├── src/
│   ├── main.tsx                 # App entry point
│   ├── App.tsx                  # Root component with routing
│   ├── config/
│   │   ├── wagmi.ts             # Wagmi configuration
│   │   ├── contracts.ts         # Contract addresses & ABIs
│   │   └── chains.ts            # Base Sepolia chain config
│   ├── pages/
│   │   ├── Dashboard.tsx        # Admin dashboard
│   │   ├── InvestorView.tsx    # Investor token management
│   │   ├── CapTable.tsx         # Cap-table display & export
│   │   └── NotConnected.tsx     # Wallet connection prompt
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx       # Top nav with wallet connect
│   │   │   ├── Sidebar.tsx      # Navigation menu
│   │   │   └── Layout.tsx       # Page wrapper
│   │   ├── admin/
│   │   │   ├── ApprovalQueue.tsx    # Pending approvals list
│   │   │   ├── MintForm.tsx         # Token minting interface
│   │   │   └── CorporateActions.tsx # Split & symbol change
│   │   ├── investor/
│   │   │   ├── BalanceCard.tsx      # Token balance display
│   │   │   └── TransferForm.tsx     # Send tokens interface
│   │   ├── captable/
│   │   │   ├── CapTableGrid.tsx     # Data table component
│   │   │   ├── ExportButtons.tsx    # CSV/JSON downloads
│   │   │   └── HistoricalQuery.tsx  # Block number input
│   │   └── ui/
│   │       └── [shadcn components]  # button, card, input, etc.
│   ├── hooks/
│   │   ├── useContract.ts           # Contract interaction hook
│   │   ├── useApprovalStatus.ts     # Check wallet approval
│   │   ├── useBalance.ts            # Query token balance
│   │   └── useCapTable.ts           # Fetch cap-table data
│   ├── lib/
│   │   ├── utils.ts                 # Helper functions
│   │   └── api.ts                   # Backend API client
│   └── styles/
│       └── globals.css              # Tailwind + custom styles
└── public/
    └── favicon.ico
```

### **Key Components**

#### **Dashboard.tsx (Admin View)**
**Purpose**: Central hub for admin operations  
**Features**:
- Wallet approval queue (pending requests)
- Token minting form
- Corporate actions (split, symbol change)
- Quick stats (total supply, holder count)

**Pseudocode**:
```typescript
function Dashboard() {
    const { address } = useAccount();
    const { data: isAdmin } = useIsAdmin(address);
    const { data: pendingApprovals } = usePendingApprovals();
    
    if (!isAdmin) return <Navigate to="/investor" />;
    
    return (
        <Layout>
            <ApprovalQueue approvals={pendingApprovals} />
            <MintForm />
            <CorporateActions />
        </Layout>
    );
}
```

#### **TransferForm.tsx (Investor)**
**Purpose**: Send tokens to another wallet  
**Validation**:
- Recipient must be approved (check before submit)
- Amount must be <= sender balance
- Amount must be > 0

**Pseudocode**:
```typescript
function TransferForm() {
    const { address } = useAccount();
    const { data: balance } = useBalance(address);
    const { writeContract } = useWriteContract();
    
    async function handleTransfer(to: string, amount: string) {
        // Client-side validation
        const isApproved = await checkApprovalStatus(to);
        if (!isApproved) {
            toast.error("Recipient wallet is not approved");
            return;
        }
        
        // Submit transaction
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: GatedTokenABI,
            functionName: 'transfer',
            args: [to, parseUnits(amount, 18)]
        });
    }
    
    return <Form onSubmit={handleTransfer} />;
}
```

#### **CapTableGrid.tsx**
**Purpose**: Display ownership table with sorting  
**Data Source**: Backend API `/cap-table`  
**Features**:
- Sortable columns
- Search/filter by address
- Pagination if >50 holders

**Pseudocode**:
```typescript
function CapTableGrid() {
    const { data: capTable, isLoading } = useCapTable();
    const [sortBy, setSortBy] = useState('balance');
    
    if (isLoading) return <Skeleton />;
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead onClick={() => setSortBy('address')}>Wallet</TableHead>
                    <TableHead onClick={() => setSortBy('balance')}>Balance</TableHead>
                    <TableHead onClick={() => setSortBy('percent')}>Ownership %</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {capTable.holders.map(holder => (
                    <TableRow key={holder.address}>
                        <TableCell>{holder.address}</TableCell>
                        <TableCell>{formatNumber(holder.balance)}</TableCell>
                        <TableCell>{holder.ownershipPercent}%</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
```

### **Routing**

```typescript
// App.tsx
function App() {
    return (
        <WagmiConfig config={wagmiConfig}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/investor" element={<InvestorView />} />
                    <Route path="/captable" element={<CapTable />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </WagmiConfig>
    );
}
```

---

## Deployment Plan

### **Phase 1: Manual Setup (Prerequisites)**
See `MANUAL_SETUP.md` for detailed instructions:
1. Create Base Sepolia wallets (3x)
2. Fund wallets from Coinbase faucet
3. Deploy Gnosis Safe (2-of-3)
4. Set up Railway account
5. Set up Vercel account

### **Phase 2: Contract Deployment**

```bash
# From contracts/ directory
forge script script/Deploy.s.sol \
    --rpc-url $BASE_SEPOLIA_RPC \
    --broadcast \
    --verify \
    --etherscan-api-key $BASESCAN_API_KEY

# Outputs:
# - Contract address: 0xABC...
# - Transaction hash: 0xDEF...
# - Verification status: Success
```

**Post-Deployment**:
- Save contract address to `.env` files (backend, indexer, ui)
- Verify on Basescan: https://sepolia.basescan.org/address/0xABC...
- Transfer ownership to Safe: `cast send <contract> "transferOwnership(address)" <safe-address>`

### **Phase 3: Database Setup (Railway)**

1. Create Railway project from GitHub repo
2. Add PostgreSQL addon (auto-provisions DATABASE_URL)
3. Run schema initialization:
```bash
psql $DATABASE_URL < database/schema.sql
```

### **Phase 4: Backend Deployment (Railway)**

**Service Configuration**:
- Root Directory: `backend/`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment Variables:
  - `DATABASE_URL` (auto from Postgres addon)
  - `ADMIN_PRIVATE_KEY`
  - `BASE_SEPOLIA_RPC`
  - `CONTRACT_ADDRESS`
  - `SAFE_ADDRESS`
  - `PORT=3000`

**Deployment**:
```bash
# Railway auto-deploys on git push to main
git push origin main

# Or manual deploy:
railway up
```

**Verification**:
```bash
curl https://your-backend.up.railway.app/health
# Should return: {"status":"ok", ...}
```

### **Phase 5: Indexer Deployment (Railway)**

**Service Configuration**:
- Root Directory: `indexer/`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment Variables:
  - `DATABASE_URL` (shared with backend)
  - `BASE_SEPOLIA_RPC`
  - `CONTRACT_ADDRESS`

**Deployment**: Same as backend

**Verification**: Check Railway logs for:
```
[Indexer] Started listening for events...
[Indexer] Connected to contract at 0xABC...
```

### **Phase 6: Frontend Deployment (Vercel)**

**Project Configuration**:
- Framework: Vite
- Root Directory: `ui/`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_CONTRACT_ADDRESS`
  - `VITE_BASE_SEPOLIA_RPC`
  - `VITE_BACKEND_URL`

**Deployment**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from ui/ directory
cd ui && vercel --prod

# Or push to GitHub (auto-deploy via Vercel integration)
git push origin main
```

**Custom Domain** (optional):
- Add domain in Vercel dashboard
- Configure DNS records
- SSL certificate auto-provisioned

### **Phase 7: Seed Historical Data**

```bash
# From contracts/ directory
forge script script/SeedData.s.sol \
    --rpc-url $BASE_SEPOLIA_RPC \
    --broadcast

# Creates:
# - 3 founder wallets with equal distribution
# - 5 investor wallets from simulated seed round
# - 1 secondary transfer
# - 10-15 total transactions
```

**Verification**:
- Check indexer logs: Should show events being processed
- Query database: `SELECT COUNT(*) FROM transfers;` → Should be 10-15
- Check UI cap-table: Should show 8 holders

### **Phase 8: Deployment Verification Checklist**

- [ ] Contract deployed and verified on Basescan
- [ ] Safe is contract owner: `cast call <contract> "owner()" --rpc-url $BASE_SEPOLIA_RPC`
- [ ] Backend health endpoint responds: `curl <backend-url>/health`
- [ ] Indexer processing events (check Railway logs)
- [ ] Database populated with seeded data
- [ ] Frontend loads and connects to MetaMask
- [ ] Can approve wallet via UI (requires 2 Safe signatures)
- [ ] Can mint tokens to approved wallet
- [ ] Can transfer between approved wallets
- [ ] Cap-table displays correctly with export buttons

---

## Environment Configuration

### **contracts/.env**
```bash
# Deployment
ADMIN_PRIVATE_KEY=0xYourPrivateKeyHere
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASESCAN_API_KEY=YourBasescanKeyHere

# Safe Address (deployed manually)
SAFE_ADDRESS=0xYourSafeContractAddress

# Optional: Alchemy/QuickNode for better reliability
ALCHEMY_RPC=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
```

### **backend/.env**
```bash
# Blockchain
ADMIN_PRIVATE_KEY=0xYourPrivateKeyHere
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xYourTokenContractAddress
SAFE_ADDRESS=0xYourSafeContractAddress

# Database (auto-populated by Railway)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Server
PORT=3000
NODE_ENV=production

# Optional
LOG_LEVEL=info
```

### **indexer/.env**
```bash
# Blockchain
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xYourTokenContractAddress

# Database (shared with backend)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Indexer Config
POLL_INTERVAL_MS=5000
START_BLOCK=12340000  # Block when contract was deployed

# Optional
LOG_LEVEL=info
```

### **ui/.env**
```bash
# Contract
VITE_CONTRACT_ADDRESS=0xYourTokenContractAddress
VITE_SAFE_ADDRESS=0xYourSafeContractAddress

# Blockchain
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
VITE_CHAIN_ID=84532

# Backend
VITE_BACKEND_URL=https://your-backend.up.railway.app

# Optional
VITE_WALLETCONNECT_PROJECT_ID=YourWalletConnectID
```

---

## Development Workflow

### **Setup Commands**

```bash
# One-time setup
git clone <repo>
cd chainequity

# Install all dependencies
npm install          # Root workspace
cd contracts && forge install && cd ..
cd backend && npm install && cd ..
cd indexer && npm install && cd ..
cd ui && npm install && cd ..

# Copy environment templates
cp contracts/.env.example contracts/.env
cp backend/.env.example backend/.env
cp indexer/.env.example indexer/.env
cp ui/.env.example ui/.env

# Fill in .env files with your values
```

### **Development Commands** (Makefile or scripts)

```bash
# Start local development (all services)
make dev
# Or: docker-compose up

# Individual services
make contracts  # Compile contracts
make backend    # Start backend server
make indexer    # Start event indexer
make ui         # Start Vite dev server

# Testing
make test           # Run all tests
make test-contracts # Foundry tests only
make test-backend   # Backend unit tests
make test-ui        # Frontend tests

# Deployment
make deploy-contracts  # Deploy to Base Sepolia
make deploy-backend    # Deploy to Railway
make deploy-ui         # Deploy to Vercel

# Utilities
make gas-report    # Generate gas benchmarks
make clean         # Remove build artifacts
make lint          # Run linters
```

### **Git Workflow**

```bash
# Feature branch
git checkout -b feature/wallet-approval
# Make changes, commit
git push origin feature/wallet-approval
# Create PR, review, merge to main

# Main branch auto-deploys to:
# - Vercel (frontend)
# - Railway (backend + indexer)
```

---

## Integration Points

### **Frontend ↔ Contract (Direct)**
**Technology**: wagmi hooks  
**Use Cases**:
- Wallet connection
- Token transfers (investor → investor)
- Balance queries
- Allowlist status checks

**Example**:
```typescript
const { writeContract } = useWriteContract();
writeContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'transfer',
    args: [recipientAddress, amount]
});
```

### **Frontend ↔ Backend (REST API)**
**Technology**: fetch() or axios  
**Use Cases**:
- Admin operations (approve, mint, corporate actions)
- Cap-table queries
- Historical data exports
- Transaction history

**Example**:
```typescript
const response = await fetch(`${BACKEND_URL}/admin/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: '0xABC...' })
});
const data = await response.json();
```

### **Backend ↔ Contract (Transactions)**
**Technology**: viem `walletClient`  
**Use Cases**:
- Submit admin transactions
- Prepare Safe transactions
- Query contract state

**Example**:
```typescript
const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: GatedTokenABI,
    functionName: 'approveWallet',
    args: [walletAddress]
});
```

### **Indexer ↔ Contract (Events)**
**Technology**: viem `publicClient.watchEvent`  
**Use Cases**:
- Listen for Transfer events
- Listen for approval events
- Listen for corporate actions
- Listen for TokensBurned events (or detect burns as Transfer to address(0))

**Example**:
```typescript
publicClient.watchEvent({
    address: CONTRACT_ADDRESS,
    event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
    onLogs: (logs) => {
        logs.forEach(log => {
            // Detect burns: to = address(0)
            if (log.args.to === '0x0000000000000000000000000000000000000000') {
                processBurn(log);
            } else {
                processTransfer(log);
            }
        });
    }
});
```

### **Backend ↔ Database (Reads)**
**Technology**: node-postgres `pg`  
**Use Cases**:
- Query cap-table for API responses
- Get historical data
- Transaction history

### **Indexer ↔ Database (Writes)**
**Technology**: node-postgres `pg`  
**Use Cases**:
- Insert transfer records
- Update current balances
- Store corporate actions

---

## Appendix

### **ABIs Required**

**GatedToken ABI** (subset for frontend):
```typescript
const GatedTokenABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function allowlist(address account) view returns (bool)',
    'function symbol() view returns (string)',
    'function totalSupply() view returns (uint256)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event WalletApproved(address indexed wallet, uint256 timestamp)',
] as const;
```

### **Useful Commands**

```bash
# Check contract owner
cast call $CONTRACT_ADDRESS "owner()" --rpc-url $BASE_SEPOLIA_RPC

# Check wallet approval status
cast call $CONTRACT_ADDRESS "allowlist(address)(bool)" $WALLET_ADDRESS --rpc-url $BASE_SEPOLIA_RPC

# Get token balance
cast call $CONTRACT_ADDRESS "balanceOf(address)(uint256)" $WALLET_ADDRESS --rpc-url $BASE_SEPOLIA_RPC

# Monitor events in real-time
cast logs --address $CONTRACT_ADDRESS --rpc-url $BASE_SEPOLIA_RPC

# Estimate gas for transaction
forge script script/EstimateGas.s.sol --rpc-url $BASE_SEPOLIA_RPC
```

---

*End of Technical Specification Document*
