# Phase 3: Frontend Development - Specialist Prompt

**Project**: ChainEquity Tokenized Security Prototype  
**Phase**: 3 - Frontend (React + Vite + wagmi)  
**Duration**: 4 hours (Day 2, Morning)  
**Status**: Ready to Start  
**Date**: November 6, 2025

---

## 🎯 Mission

Build a polished React frontend application that connects to the deployed backend API and smart contract. The UI must support admin workflows (wallet approval, minting, corporate actions) and investor workflows (balance viewing, token transfers) with professional styling using shadcn/ui components.

**Deliverable**: Live frontend deployed to Vercel at `https://chainequity-mlx.vercel.app` (or custom domain) with all user stories functional.

---

## 📋 Context & Prerequisites

### Previous Phases Complete

✅ **Phase 1: Smart Contracts** - `GatedToken` deployed to Base Sepolia
- Contract Address: `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964`
- Owner: Gnosis Safe `0x6264F29968e8fd2810cB79fb806aC65dAf9db73d`
- Network: Base Sepolia (Chain ID: 84532)
- Deployment Block: `33313307`
- Contract ABI: `/contracts/out/GatedToken.sol/GatedToken.json`

✅ **Phase 2B: Event Indexer** - Running 24/7 on Railway
- Service: `chainequity-mlx`
- Status: Monitoring blockchain events → Writing to PostgreSQL
- Database: PostgreSQL on Railway (internal URL)

✅ **Phase 2A: Backend API** - Running on Railway
- Service: `tender-achievement`
- API URL: **https://tender-achievement-production-3aa5.up.railway.app/api**
- Port: 3001
- Status: ✅ All 11 endpoints operational
- Health Check: Passing (database + blockchain connected)

### Railway Architecture

All services deployed on Railway project `superb-trust`:
- **PostgreSQL**: Shared database (indexer writes, backend reads)
- **Indexer**: Monitoring events 24/7 (service: `chainequity-mlx`)
- **Backend**: REST API server (service: `tender-achievement`)
- **Frontend**: To be deployed on Vercel (Phase 3)

See `/RAILWAY_ARCHITECTURE.md` for complete deployment architecture details.

---

## 🎨 Design & UX Requirements

### User Personas

**Admin Persona** (Primary):
- Approve investor wallets after KYC verification
- Mint tokens to approved wallets
- Execute corporate actions (stock splits, symbol changes)
- View and export cap-table
- Revoke wallet approvals if needed

**Investor Persona**:
- View token balance and ownership percentage
- Transfer tokens to other approved investors
- Check wallet approval status
- View transaction history

### UI Requirements (from PRD_PRODUCT.md)

**FR-4.1**: ✅ MetaMask wallet connection on Base Sepolia  
**FR-4.2**: ✅ Detect connected wallet's approval status automatically  
**FR-4.3**: ✅ Different views for Admin vs Investor roles  
**FR-4.4**: ✅ Real-time token balances and ownership percentages  
**FR-4.5**: ✅ Admin dashboard with wallet approval controls  
**FR-4.6**: ✅ Mint interface restricted to admin wallets  
**FR-4.7**: ✅ Transfer interface for approved investors  
**FR-4.8**: ✅ Pending transactions with confirmation status  
**FR-4.9**: ✅ Corporate actions interface (split, symbol change) for admins  
**FR-4.10**: ✅ Cap-table view with CSV/JSON export buttons  
**FR-4.11**: ✅ Historical cap-table queries by block number  
**FR-4.12**: ✅ Transaction history log with filtering  
**FR-4.13**: ✅ Error messages for failed transactions (client-side validation)  
**FR-4.14**: ✅ Responsive design (desktop browsers: Chrome, Safari, Firefox)

### Visual Design

- **Framework**: shadcn/ui components (Radix UI primitives + Tailwind CSS)
- **Styling**: Tailwind CSS `^3.4.0` with custom theme
- **Icons**: Lucide React (`lucide-react`)
- **Theme**: Professional, modern design suitable for financial/security token platform
- **Colors**: Use shadcn/ui default theme or customize with Tailwind colors
- **Typography**: System fonts (sf-pro-display, -apple-system, BlinkMacSystemFont)

---

## 🛠️ Technical Stack

### Core Framework
- **React**: `^18.2.0`
- **Vite**: `^5.0.0` (build tool)
- **TypeScript**: `^5.3.0`
- **React Router**: `^6.21.0` (client-side routing)

### Web3 Integration
- **wagmi**: `^2.4.0` (React hooks for Ethereum)
- **@wagmi/core**: `^2.4.0`
- **@wagmi/connectors**: `^2.4.0` (MetaMask connector)
- **viem**: `^2.38.0` (underlying Ethereum library, peer dependency)

### UI Components
- **shadcn/ui**: Radix UI components + Tailwind styling
- **Tailwind CSS**: `^3.4.0`
- **Lucide React**: `^1.0.0` (icons)

### Forms & Validation
- **react-hook-form**: `^7.49.0` (form handling)
- **zod**: `^3.22.0` (schema validation, already in backend)

### API Client
- **fetch**: Native browser API (or axios if preferred)
- **Backend Base URL**: `https://tender-achievement-production-3aa5.up.railway.app/api`

---

## 📁 Project Structure

Create frontend in `/ui/` directory at project root:

```
ui/
├── src/
│   ├── main.tsx                    # Entry point (React 18 createRoot)
│   ├── App.tsx                      # Root component with routing
│   ├── config/
│   │   ├── wagmi.ts                 # wagmi configuration (chains, connectors)
│   │   ├── contracts.ts             # Contract address + ABI
│   │   └── api.ts                   # Backend API base URL + fetch utilities
│   ├── pages/
│   │   ├── Dashboard.tsx            # Admin dashboard (approve, mint, corp actions)
│   │   ├── InvestorView.tsx         # Investor view (balance, transfer)
│   │   ├── CapTable.tsx             # Cap-table display + export
│   │   └── NotConnected.tsx         # Wallet connection prompt
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Top nav with wallet connect/disconnect
│   │   │   ├── Sidebar.tsx          # Navigation menu (if needed)
│   │   │   └── Layout.tsx           # Page wrapper (Header + content)
│   │   ├── admin/
│   │   │   ├── ApprovalForm.tsx     # Approve wallet form
│   │   │   ├── MintForm.tsx          # Mint tokens form
│   │   │   └── CorporateActions.tsx  # Split + symbol change forms
│   │   ├── investor/
│   │   │   ├── BalanceCard.tsx      # Token balance display
│   │   │   └── TransferForm.tsx     # Send tokens form
│   │   ├── captable/
│   │   │   ├── CapTableGrid.tsx      # Data table with sorting
│   │   │   ├── ExportButtons.tsx    # CSV/JSON download buttons
│   │   │   └── HistoricalQuery.tsx   # Block number input + query
│   │   ├── transactions/
│   │   │   └── TransactionHistory.tsx # Transaction log with filters
│   │   └── ui/                       # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── table.tsx
│   │       ├── dialog.tsx
│   │       ├── toast.tsx
│   │       └── ... (other shadcn components)
│   ├── hooks/
│   │   ├── useContract.ts            # Contract interaction utilities
│   │   ├── useApprovalStatus.ts      # Check if wallet is approved
│   │   ├── useBalance.ts             # Query token balance via wagmi
│   │   ├── useCapTable.ts            # Fetch cap-table from backend API
│   │   └── useTransactions.ts       # Fetch transaction history
│   ├── lib/
│   │   ├── utils.ts                 # Helper functions (cn, formatAddress, etc.)
│   │   └── api.ts                    # Backend API client functions
│   ├── types/
│   │   └── index.ts                  # TypeScript types for API responses
│   └── styles/
│       └── globals.css               # Tailwind directives + custom styles
├── public/
│   └── favicon.ico
├── index.html                        # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── components.json                    # shadcn/ui config
├── .env.example
├── .env                              # Environment variables (gitignored)
└── README.md
```

---

## 🔌 Backend API Integration

### Base URL
```
https://tender-achievement-production-3aa5.up.railway.app/api
```

### Available Endpoints

**Data Endpoints** (GET - Read from database):
1. `GET /api/health` - Health check
   ```typescript
   Response: {
     status: "ok",
     database: { connected: boolean },
     blockchain: { connected: boolean, chainId: number, blockNumber: number },
     timestamp: string
   }
   ```

2. `GET /api/cap-table` - Current token holders
   ```typescript
   Response: {
     totalSupply: string,
     holderCount: number,
     blockNumber: number,
     timestamp: string,
     capTable: Array<{
       address: string,
       balance: string,
       ownershipPercent: string
     }>
   }
   ```

3. `GET /api/transfers` - Transfer history
   ```typescript
   Query Params: address?, limit?, offset?, fromBlock?, toBlock?
   Response: {
     transfers: Array<{
       transactionHash: string,
       blockNumber: number,
       timestamp: string,
       from: string,
       to: string,
       amount: string,
       eventType: "mint" | "transfer" | "burn"
     }>,
     pagination: { total: number, limit: number, offset: number }
   }
   ```

4. `GET /api/corporate-actions` - Corporate actions history
   ```typescript
   Query Params: type?, limit?, offset?
   Response: {
     actions: Array<{
       id: number,
       transactionHash: string,
       blockNumber: number,
       timestamp: string,
       actionType: "split" | "symbol_change" | "mint" | "burn",
       data: object
     }>,
     pagination: { total: number, limit: number, offset: number }
   }
   ```

5. `GET /api/wallet/:address` - Wallet information
   ```typescript
   Response: {
     address: string,
     balance: string,
     isApproved: boolean,
     approvedAt?: string,
     revokedAt?: string,
     transferCount: number
   }
   ```

**Transaction Endpoints** (POST - Submit to blockchain):
6. `POST /api/transfer` - Submit token transfer
   ```typescript
   Body: { to: string, amount: string }
   Response: {
     success: boolean,
     transactionHash: string,
     from: string,
     to: string,
     amount: string,
     blockExplorerUrl: string,
     message: string,
     timestamp: string
   }
   ```

7. `POST /api/admin/approve-wallet` - Approve wallet
   ```typescript
   Body: { address: string }
   Response: {
     success: boolean,
     transactionHash: string,
     address: string,
     blockExplorerUrl: string,
     message: string,
     timestamp: string
   }
   ```

8. `POST /api/admin/revoke-wallet` - Revoke wallet
   ```typescript
   Body: { address: string }
   Response: Same as approve-wallet
   ```

9. `POST /api/admin/mint` - Mint tokens to approved wallet
   ```typescript
   Body: { to: string, amount: string }
   Response: {
     success: boolean,
     transactionHash: string,
     to: string,
     amount: string,
     blockExplorerUrl: string,
     message: string,
     timestamp: string
   }
   ```

10. `POST /api/admin/stock-split` - Execute stock split
   ```typescript
   Body: { multiplier: number }
   Response: {
     success: boolean,
     transactionHash: string,
     multiplier: number,
     newTotalSupply?: string,
     blockExplorerUrl: string,
     message: string,
     timestamp: string
   }
   ```

11. `POST /api/admin/update-symbol` - Update token symbol
    ```typescript
    Body: { newSymbol: string }
    Response: {
      success: boolean,
      transactionHash: string,
      oldSymbol?: string,
      newSymbol: string,
      blockExplorerUrl: string,
      message: string,
      timestamp: string
    }
    ```

### CORS Configuration
Backend has CORS enabled for all origins. For production, we can restrict to frontend domain later.

### Error Responses
```typescript
{
  error: string,
  timestamp: string
}
```

---

## 📜 Smart Contract Integration

### Contract Details
- **Address**: `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964`
- **Network**: Base Sepolia (Chain ID: 84532)
- **ABI Location**: `/contracts/out/GatedToken.sol/GatedToken.json`
- **Owner**: Gnosis Safe `0x6264F29968e8fd2810cB79fb806aC65dAf9db73d`

### Key Contract Functions for Frontend

**Read Functions** (via wagmi `useReadContract`):
```typescript
// Get token balance
function balanceOf(address account) view returns (uint256)

// Check if wallet is approved
function allowlist(address account) view returns (bool)

// Get token symbol
function symbol() view returns (string)

// Get total supply
function totalSupply() view returns (uint256)

// Get split multiplier (for virtual split)
function splitMultiplier() view returns (uint256)
```

**Write Functions** (via wagmi `useWriteContract`):
```typescript
// Transfer tokens (investor → investor)
function transfer(address to, uint256 amount) returns (bool)

// Note: Admin functions (approve, mint, split, symbol) go through backend API + Safe
```

### Contract Events
```typescript
event Transfer(address indexed from, address indexed to, uint256 value)
event WalletApproved(address indexed wallet, uint256 timestamp)
event WalletRevoked(address indexed wallet, uint256 timestamp)
event StockSplit(uint256 multiplier, uint256 newTotalSupply, uint256 timestamp)
event SymbolChanged(string oldSymbol, string newSymbol, uint256 timestamp)
event TokensMinted(address indexed to, uint256 amount, address indexed minter)
event TokensBurned(address indexed from, uint256 amount, address indexed burner)
```

### Important Contract Behavior

1. **Virtual Stock Split**: Balances are multiplied by `splitMultiplier` at read time. When transferring, amounts are divided by the multiplier. Use amounts divisible by the multiplier to avoid rounding issues.

2. **Transfer Restrictions**: Both sender AND recipient must be approved. Contract reverts if either is not approved.

3. **Admin Functions**: All admin functions (`approveWallet`, `mint`, `executeSplit`, `changeSymbol`) require Gnosis Safe multi-sig. Frontend submits transactions via backend API, which prepares Safe transactions.

---

## 🎯 Implementation Tasks

### 1. Project Setup (30 minutes)

- [ ] Initialize Vite + React + TypeScript project in `/ui/` directory
- [ ] Install dependencies:
  ```bash
  npm install react react-dom react-router-dom wagmi @wagmi/core viem
  npm install -D @types/react @types/react-dom vite @vitejs/plugin-react typescript
  npm install tailwindcss postcss autoprefixer
  npm install react-hook-form zod
  npm install lucide-react
  ```
- [ ] Initialize shadcn/ui: `npx shadcn-ui@latest init`
- [ ] Install shadcn/ui components:
  ```bash
  npx shadcn-ui@latest add button card input table dialog toast badge alert skeleton
  ```
- [ ] Configure Tailwind CSS
- [ ] Create basic file structure
- [ ] Set up environment variables (`.env.example` and `.env`)

### 2. wagmi Configuration (30 minutes)

- [ ] Configure wagmi with Base Sepolia chain:
  ```typescript
  import { createConfig, http } from 'wagmi'
  import { baseSepolia } from 'wagmi/chains'
  import { metaMask } from 'wagmi/connectors'

  export const wagmiConfig = createConfig({
    chains: [baseSepolia],
    connectors: [metaMask()],
    transports: {
      [baseSepolia.id]: http('https://sepolia.base.org'),
    },
  })
  ```
- [ ] Wrap app with `WagmiProvider`:
  ```typescript
  import { WagmiProvider } from 'wagmi'
  ```
- [ ] Create wallet connection component (Header.tsx)

### 3. Contract Configuration (15 minutes)

- [ ] Copy contract ABI from `/contracts/out/GatedToken.sol/GatedToken.json` to `/ui/src/config/contracts.ts`
- [ ] Export contract address and ABI:
  ```typescript
  export const CONTRACT_ADDRESS = '0xFCc9E74019a2be5808d63A941a84dEbE0fC39964'
  export const SAFE_ADDRESS = '0x6264F29968e8fd2810cB79fb806aC65dAf9db73d'
  export const GatedTokenABI = [/* ABI from JSON */] as const
  ```

### 4. Backend API Client (30 minutes)

- [ ] Create `/ui/src/lib/api.ts` with fetch utilities:
  ```typescript
  const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://tender-achievement-production-3aa5.up.railway.app/api'

  export async function getCapTable(): Promise<CapTableResponse>
  export async function getTransfers(params?: TransferParams): Promise<TransfersResponse>
  export async function getWalletInfo(address: string): Promise<WalletInfoResponse>
  export async function submitTransfer(to: string, amount: string): Promise<TransactionResponse>
  export async function approveWallet(address: string): Promise<TransactionResponse>
  export async function revokeWallet(address: string): Promise<TransactionResponse>
  export async function mintTokens(to: string, amount: string): Promise<TransactionResponse>
  export async function executeStockSplit(multiplier: number): Promise<TransactionResponse>
  export async function updateSymbol(newSymbol: string): Promise<TransactionResponse>
  ```
- [ ] Add error handling for API failures
- [ ] Create TypeScript types in `/ui/src/types/index.ts`

### 5. Custom Hooks (45 minutes)

- [ ] `useBalance.ts` - Get token balance via wagmi:
  ```typescript
  export function useBalance(address: Address) {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: GatedTokenABI,
      functionName: 'balanceOf',
      args: [address],
    })
  }
  ```

- [ ] `useApprovalStatus.ts` - Check if wallet is approved:
  ```typescript
  export function useApprovalStatus(address: Address) {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: GatedTokenABI,
      functionName: 'allowlist',
      args: [address],
    })
  }
  ```

- [ ] `useCapTable.ts` - Fetch cap-table from backend:
  ```typescript
  export function useCapTable() {
    return useQuery({
      queryKey: ['capTable'],
      queryFn: () => getCapTable(),
      refetchInterval: 5000, // Refresh every 5 seconds
    })
  }
  ```

- [ ] `useTransactions.ts` - Fetch transaction history:
  ```typescript
  export function useTransactions(params?: TransferParams) {
    return useQuery({
      queryKey: ['transactions', params],
      queryFn: () => getTransfers(params),
    })
  }
  ```

**Note**: You'll need to install `@tanstack/react-query` for data fetching:
```bash
npm install @tanstack/react-query
```

### 6. Layout Components (30 minutes)

- [ ] Create `Header.tsx`:
  - Wallet connection button (MetaMask)
  - Display connected address (truncated)
  - Network indicator (Base Sepolia)
  - Disconnect button
- [ ] Create `Layout.tsx` wrapper component
- [ ] Create `NotConnected.tsx` prompt page

### 7. Admin Dashboard (90 minutes)

- [ ] **Dashboard.tsx** - Main admin view:
  - Quick stats (total supply, holder count)
  - Sections: Approval Queue, Mint Tokens, Corporate Actions
  
- [ ] **ApprovalForm.tsx**:
  - Input: wallet address
  - Button: "Approve Wallet"
  - On submit: call `/api/admin/approve-wallet`
  - Show transaction hash + block explorer link
  - Handle errors (wallet already approved, etc.)
  
- [ ] **MintForm.tsx**:
  - Input: recipient address, amount
  - Validation: recipient must be approved (check before submit)
  - Button: "Mint Tokens"
  - On submit: call `/api/admin/mint`
  - Show success/error messages
  
- [ ] **CorporateActions.tsx**:
  - Stock Split form:
    - Input: multiplier (number)
    - Validation: multiplier >= 2
    - Button: "Execute Stock Split"
    - Warning: "All balances will multiply by [multiplier]"
  - Symbol Change form:
    - Input: new symbol (2-6 alphanumeric)
    - Validation: format check
    - Button: "Change Symbol"
    - Show current symbol

**Admin Check**: Determine if connected wallet is admin:
```typescript
// Option 1: Check if wallet is Safe owner (requires Safe SDK - complex)
// Option 2: Hardcode admin addresses for demo (simple)
const ADMIN_ADDRESSES = [
  '0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6', // Admin wallet
  '0x6264F29968e8fd2810cB79fb806aC65dAf9db73d', // Safe address
]

export function useIsAdmin(address?: Address): boolean {
  return address ? ADMIN_ADDRESSES.includes(address.toLowerCase()) : false
}
```

### 8. Investor View (60 minutes)

- [ ] **InvestorView.tsx** - Main investor page:
  - Balance card (tokens + ownership %)
  - Approval status indicator
  - Transfer form
  
- [ ] **BalanceCard.tsx**:
  - Display token balance (with symbol)
  - Display ownership percentage
  - Fetch via `useBalance(address)` hook
  - Refresh on transfer completion
  
- [ ] **TransferForm.tsx**:
  - Input: recipient address, amount
  - **Client-side validation**:
    - Check recipient is approved (call `/api/wallet/:address` or `useApprovalStatus`)
    - Check amount <= sender balance
    - Check amount > 0
  - Button: "Transfer Tokens"
  - On submit: call contract `transfer()` function via wagmi `useWriteContract`
  - Show transaction status (pending, success, error)
  - Display block explorer link on success
  - **Important**: If recipient is not approved, show error BEFORE submitting transaction to save gas

### 9. Cap-Table View (60 minutes)

- [ ] **CapTable.tsx** - Main cap-table page:
  - Data table displaying holders
  - Export buttons (CSV/JSON)
  - Historical query section
  
- [ ] **CapTableGrid.tsx**:
  - Table with columns: Address, Balance, Ownership %
  - Sortable columns (default: balance descending)
  - Fetch via `useCapTable()` hook
  - Loading state (skeleton)
  - Empty state (no holders)
  
- [ ] **ExportButtons.tsx**:
  - "Download CSV" button
  - "Download JSON" button
  - Implementation:
    ```typescript
    function downloadCSV() {
      const capTable = await getCapTable()
      const csv = capTable.capTable.map(h => 
        `${h.address},${h.balance},${h.ownershipPercent}`
      ).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `captable_${Date.now()}.csv`
      a.click()
    }
    ```
  
- [ ] **HistoricalQuery.tsx**:
  - Input: block number
  - Button: "Query Historical Cap-Table"
  - On submit: call `/api/cap-table/historical?blockNumber=X` (if endpoint exists)
  - Display historical table with clear indicator: "Cap-table as of Block X"
  - Note: Historical endpoint may not be implemented - document if missing

### 10. Transaction History (30 minutes)

- [ ] **TransactionHistory.tsx**:
  - Display list of transfers (from `/api/transfers`)
  - Columns: Timestamp, Type, From, To, Amount, Hash
  - Filter by wallet address (optional)
  - Pagination (limit/offset)
  - Link transaction hashes to Basescan

### 11. Routing & Navigation (30 minutes)

- [ ] Set up React Router:
  ```typescript
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/investor" element={<InvestorView />} />
    <Route path="/captable" element={<CapTable />} />
  </Routes>
  ```
- [ ] Navigation menu (Header or Sidebar)
- [ ] Route protection: Redirect investor to `/investor` if not admin

### 12. Error Handling & Loading States (30 minutes)

- [ ] Toast notifications for success/error (shadcn/ui toast)
- [ ] Loading skeletons for data fetching
- [ ] Error boundaries for React errors
- [ ] Handle RPC errors (network disconnection, etc.)
- [ ] Handle backend API errors (5xx, 4xx)

### 13. Styling & Polish (60 minutes)

- [ ] Apply consistent Tailwind styling
- [ ] Use shadcn/ui components throughout
- [ ] Responsive design (mobile-friendly)
- [ ] Dark mode support (optional - shadcn/ui supports it)
- [ ] Form validation feedback (react-hook-form + zod)
- [ ] Hover states, transitions
- [ ] Loading spinners

### 14. Environment Configuration (15 minutes)

- [ ] Create `.env.example`:
  ```bash
  VITE_CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
  VITE_SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
  VITE_BACKEND_URL=https://tender-achievement-production-3aa5.up.railway.app/api
  VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
  VITE_CHAIN_ID=84532
  ```
- [ ] Create `.env` (gitignored) with actual values
- [ ] Update `vite.config.ts` to load env vars

### 15. Vercel Deployment (30 minutes)

- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Configure Vercel:
  - Framework: Vite
  - Root Directory: `ui`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`
- [ ] Set environment variables in Vercel dashboard:
  - `VITE_CONTRACT_ADDRESS`
  - `VITE_SAFE_ADDRESS`
  - `VITE_BACKEND_URL`
  - `VITE_BASE_SEPOLIA_RPC`
  - `VITE_CHAIN_ID`
- [ ] Deploy: `cd ui && vercel --prod`
- [ ] Verify deployment: Visit `https://chainequity-mlx.vercel.app`
- [ ] Test wallet connection
- [ ] Test all user flows

---

## 🧪 Testing Requirements

### Manual Testing Checklist

**Wallet Connection**:
- [ ] Connect MetaMask wallet (Base Sepolia)
- [ ] Disconnect wallet
- [ ] Switch between wallets
- [ ] Handle wrong network (show error, prompt to switch)

**Admin Flows**:
- [ ] Approve wallet (enter address, submit, see transaction hash)
- [ ] Mint tokens to approved wallet (verify balance updates)
- [ ] Execute stock split (verify balances multiply)
- [ ] Change symbol (verify symbol updates everywhere)
- [ ] View cap-table (verify data displays correctly)
- [ ] Export cap-table CSV (verify file downloads)
- [ ] Export cap-table JSON (verify file downloads)

**Investor Flows**:
- [ ] View balance (verify correct amount + percentage)
- [ ] Transfer to approved wallet (verify success)
- [ ] Transfer to unapproved wallet (verify error BEFORE transaction)
- [ ] View transaction history (verify list displays)
- [ ] Check approval status (verify indicator)

**Error Handling**:
- [ ] Display error when backend API fails
- [ ] Display error when contract call fails
- [ ] Display error when RPC connection fails
- [ ] Show loading states during API calls
- [ ] Show transaction pending state

---

## ✅ Success Criteria

### Required Deliverables

1. ✅ **Frontend deployed to Vercel**
   - URL: `https://chainequity-mlx.vercel.app` (or provided Vercel URL)
   - Status: Accessible and functional

2. ✅ **All user stories from PRD implemented**:
   - Admin can approve wallets
   - Admin can mint tokens
   - Admin can execute corporate actions
   - Admin can view/export cap-table
   - Investors can view balances
   - Investors can transfer tokens
   - Investors see approval status

3. ✅ **All demo scenarios from DEMO_VIDEO.md functional**:
   - Mint tokens to approved wallet → SUCCESS
   - Transfer between approved wallets → SUCCESS
   - Transfer to non-approved → BLOCKED (client-side validation)
   - Approve new wallet → Transfer succeeds
   - Execute stock split → Balances multiply
   - Change symbol → Symbol updates
   - Export cap-table → Files download

4. ✅ **Professional UI/UX**:
   - Polished shadcn/ui components
   - Responsive design
   - Loading states
   - Error messages
   - Transaction confirmations

5. ✅ **Code Quality**:
   - TypeScript strict mode (no `any` types)
   - Clean component structure
   - Reusable hooks
   - Error handling
   - Form validation

6. ✅ **Documentation**:
   - README.md with setup instructions
   - Environment variable documentation
   - Component overview (optional but helpful)

---

## 📝 Environment Variables

Create `/ui/.env` file (gitignored):

```bash
# Contract Addresses
VITE_CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
VITE_SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d

# Backend API
VITE_BACKEND_URL=https://tender-achievement-production-3aa5.up.railway.app/api

# Blockchain Configuration
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
VITE_CHAIN_ID=84532
```

**Note**: All Vite env vars must be prefixed with `VITE_` to be exposed to client code.

---

## 🚨 Known Limitations & Edge Cases

### Virtual Stock Split
After executing a stock split, token amounts must be divisible by the split multiplier when transferring. For example, after a 7-for-1 split:
- ✅ Safe: 700, 1400, 2100, 3500, 7000 tokens
- ❌ Unsafe: 1000, 5000 tokens (will lose tokens due to rounding)

**Demo Note**: Use safe amounts for post-split transfers or skip transfers after split in demo.

### Admin Function Restrictions
All admin functions (`approve`, `mint`, `split`, `symbol`) require Gnosis Safe multi-sig approval. The backend prepares Safe transactions, but actual signing happens via Safe UI (manual process for demo). Frontend should:
1. Submit transaction via backend API
2. Display message: "Transaction submitted to Safe. Requires 2/3 signatures."
3. Provide transaction hash + link to Safe UI

### Block Explorer Links
Use Basescan URLs:
```typescript
const BLOCK_EXPLORER_BASE = 'https://sepolia.basescan.org/tx'
function getBlockExplorerUrl(txHash: string): string {
  return `${BLOCK_EXPLORER_BASE}/${txHash}`
}
```

---

## 📚 Reference Documents

### Primary Implementation Specs
- `PRD_PRODUCT.md` - User stories and requirements
- `PRD_TECHNICAL.md` - Technical architecture and API specs
- `DEMO_VIDEO.md` - Demo script with required scenarios
- `TECHNICAL_DECISIONS.md` - Technology choices and rationale

### Phase Completion Reports
- `PHASE1_COMPLETION_REPORT.md` - Contract deployment details
- `PHASE2A_COMPLETION_REPORT.md` - Backend API endpoints and examples
- `PHASE2B_COMPLETE_FINAL_REPORT.md` - Indexer implementation details

### Architecture & Deployment
- `RAILWAY_ARCHITECTURE.md` - Railway deployment architecture
- `wallet-addresses.txt` - All addresses, keys, database URLs

### Memory Bank (Context)
- `memory-bank/` - Complete project knowledge base
  - `projectbrief.md` - Project overview
  - `productContext.md` - User experience goals
  - `systemPatterns.md` - Architecture patterns
  - `techContext.md` - Tech stack details
  - `progress.md` - Current phase status
  - `activeContext.md` - Current work focus

---

## 🎬 Demo Video Requirements

The frontend must support all demo scenarios from `DEMO_VIDEO.md`:

1. **Scene 2**: Admin approval & minting (Admin dashboard)
2. **Scene 3**: Transfer attempt to unapproved (Investor view with error)
3. **Scene 4**: Approve investor B & successful transfer (Admin + Investor views)
4. **Scene 5**: Execute stock split (Admin dashboard - Corporate Actions)
5. **Scene 6**: Change symbol (Admin dashboard - Corporate Actions)
6. **Scene 7**: Cap-table export (Cap-table view with export buttons)

Ensure UI is polished enough for professional demo video recording.

---

## 📄 Completion Report Format

Upon completion, create `PHASE3_FRONTEND_COMPLETION_REPORT.md` with:

1. **Status**: ✅ Complete
2. **Deployment URL**: Vercel URL
3. **Implementation Summary**:
   - Pages created
   - Components created
   - Hooks created
   - API integration status
   - Contract integration status

4. **Testing Results**:
   - Manual testing checklist
   - Browser compatibility (Chrome, Safari, Firefox)
   - Wallet connection tested
   - All user flows verified

5. **Known Issues / Limitations**:
   - Any missing features
   - Browser-specific issues
   - Performance notes

6. **Files Created**:
   - Complete file structure
   - Key files with line counts

7. **Environment Configuration**:
   - Vercel environment variables set
   - Local `.env` setup instructions

8. **Next Steps for Phase 4**:
   - Integration testing requirements
   - Demo video preparation notes

---

## 🚀 Quick Start Commands

```bash
# Navigate to ui directory
cd ui

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod
```

---

## 💡 Tips & Recommendations

### Performance
- Use React Query (`@tanstack/react-query`) for data fetching with caching
- Refetch cap-table every 5 seconds for real-time updates
- Debounce search/filter inputs

### UX Best Practices
- Show transaction status in toast notifications
- Display block explorer links for all transactions
- Validate recipient approval status BEFORE submitting transfer
- Show loading skeletons while data loads
- Display helpful error messages (e.g., "Recipient wallet is not approved")

### Code Organization
- Keep API calls in `/lib/api.ts`
- Keep contract interactions in `/hooks/useContract.ts`
- Use shadcn/ui components throughout (don't build custom UI)
- Follow React best practices (hooks, functional components)

### shadcn/ui Setup
```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
```

---

**Ready to build!** 🎨

Create the `/ui/` directory and start with project setup. Reference the PRDs, completion reports, and Railway architecture docs as needed. Focus on getting all user stories functional - polish can be refined during Phase 4.

**Questions?** Check:
- `PRD_TECHNICAL.md` for detailed API specs
- `PHASE2A_COMPLETION_REPORT.md` for backend endpoint details
- `DEMO_VIDEO.md` for demo requirements
- `memory-bank/` for complete project context

---

**Good luck!** 🚀

