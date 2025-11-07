# ChainEquity - Active Context

## Current Work Focus

**Primary Goal**: Phase 4 (Integration & Testing) 🟢 NEARING COMPLETION - All 7 demo test cases confirmed passing by user. Stock split architecture fully working. Display name feature implemented. Burn All Tokens feature added for demo resets. UI refinements complete (balance formatting, button layouts, ticker display). Final documentation updates pending.

## Recent Changes (This Session - Nov 7, 2025)

### Burn All Tokens Feature
**Purpose**: Enable quick demo resets by burning tokens from all cap table holders

**Implementation**:
- Added `burnTokens()` function to `backend/src/services/blockchain.service.ts`
- New `/api/admin/burn-all` endpoint in `backend/src/routes/transactions.ts`
- Queries cap table, iterates through holders, burns entire balance
- 2-second delay between burns to avoid nonce conflicts
- Returns array of transaction hashes
- **Files Created**:
  - `ui/src/components/admin/BurnAllButton.tsx` - Button with AlertDialog confirmation
  - `ui/src/lib/api.ts` - Added `burnAllTokens()` API call
- **UI Integration**:
  - Button on Admin Dashboard (far right, aligned with ACME ticker)
  - AlertDialog confirmation: "Are you absolutely sure?"
  - Success toast with link to first transaction on BaseScan
  - Auto-refreshes cap table, balances, transactions after burn
- **Commits**: `7dc79ac`, `ff2d330`, `543cd10`

### UI Polish & Refinements
**1. Balance Formatting (Investor Dashboard)**:
- Added comma formatting: `341,040` instead of `341040`
- Used `toLocaleString('en-US')` for proper number display
- **Files**: `ui/src/components/investor/BalanceCard.tsx`

**2. Ticker Symbol Color**:
- Changed symbol color to dark grey (`text-muted-foreground`)
- Better visual separation from balance number
- Example: `341,040 ACME` (number black, symbol grey)

**3. Admin Dashboard Layout**:
- Three-column header: `[Admin Dashboard] [ACME stock] [Burn All Tokens]`
- Title on left, ticker centered, burn button on right
- Removed flame icon from burn button (cleaner look)
- **Files**: `ui/src/pages/Dashboard.tsx`

**4. Placeholder Text Updates**:
- Changed symbol change placeholder from `CHAINEQUITY-B` to `CHEQ`
- More realistic example for demo
- **Files**: `ui/src/components/admin/CorporateActions.tsx`

### shadcn/ui Component Installation
- Installed `AlertDialog` component via `npx shadcn@latest add alert-dialog`
- Replaced native `window.confirm()` with styled modal
- Better UX consistency with app design system
- **Files Created**: `ui/@/components/ui/alert-dialog.tsx`

### Technical Clarifications Documented
**Stock Split Transaction History**:
- Confirmed transaction amounts remain at historical values (not retroactively updated)
- Example: Pre-split transfer of 100 tokens shows as 100, not 700 after 7x split
- This is industry standard (securities compliance, blockchain truth)
- Current balances DO reflect multiplier, historical transactions do NOT
- No need for per-holder "split transaction" rows (% ownership unchanged)

**Burn Mechanics**:
- `burnTokens()` calls on-chain `burn()` function
- Decrements holder balance on-chain
- Emits `Transfer` event (holder → `0x000...000`)
- Indexer catches event, updates database automatically
- Database = performance cache of blockchain state (can rebuild from chain)
- Historical data preserved (burns recorded as transactions, not deleted)

## Recent Changes (Previous Session - Nov 6, 2025)

### Critical Bug Fix: Virtual Stock Split Implementation
**Problem**: 7-for-1 stock split executed on-chain but UI showed no change (1500 tokens remained 1500 instead of 10,500)

**Root Cause**: 
- Smart contract uses virtual split multiplier (gas-efficient design)
- `splitMultiplier` stored on-chain (verified: currently = 7)
- Backend was ignoring `splitMultiplier` when querying balances
- Database stores base amounts, backend must read multiplier and apply it

**Solution Implemented**:
- Added `getSplitMultiplier()` function to `/backend/src/routes/data.ts`
- Modified `/api/cap-table` endpoint to read `splitMultiplier` from contract
- Applied multiplier to all balances: `adjustedBalance = baseBalance * splitMultiplier`
- Added `splitMultiplier` to API response for transparency

**Files Modified**:
- `backend/src/routes/data.ts` - Added split multiplier logic
- Commit: `fa0371a` - "fix: apply splitMultiplier to cap-table balances for stock splits"

**Expected Result After Deploy**:
- Total Supply: 1,500 → 10,500
- Investor A: 870 → 6,090
- Investor B: 550 → 3,850  
- Investor C: 80 → 560

**Documentation Created**:
- `docs/VIRTUAL_STOCK_SPLIT_ARCHITECTURE.md` - Complete explanation of virtual split pattern

### New Feature: Self-Service Display Names
**Implementation**:
- Created `useDisplayName` hook with localStorage persistence
- Built `DisplayNameEditor` component with inline editing
- Integrated into Investor Dashboard (prominent display)
- Display names show in Cap Table UI and CSV/JSON exports
- Copy address feature added to Cap Table with visual feedback

**Files Created/Modified**:
- `ui/src/hooks/useDisplayName.ts` - Display name management
- `ui/src/components/profile/DisplayNameEditor.tsx` - Editable name component  
- `ui/src/pages/InvestorView.tsx` - Layout updated
- `ui/src/components/captable/CapTableGrid.tsx` - Uses dynamic names + copy icon
- `ui/src/components/captable/ExportButtons.tsx` - Exports with names

**UI Design**:
- Display name shown prominently: `[Investor A] [edit] — Portfolio`
- Same text size as page title (text-3xl font-bold)
- One-line layout, removed "Display Name:" label
- Pencil icon for editing, check/X for save/cancel
- Toast notifications for feedback

**Commits**:
- `e599980` - "feat: self-service display name editor with localStorage"
- `98de8d1` - "refactor: improve display name UI styling"

### UI Enhancements
**Cap Table Copy Feature**:
- Added copy icon next to each address in Cap Table
- Visual feedback: Copy icon → Check icon (2 seconds)
- Toast notification on successful copy
- Handles clipboard API errors gracefully

**Files Modified**:
- `ui/src/components/captable/CapTableGrid.tsx` - Added copyAddress function

### Phase 4 Testing Progress
**Automated Testing** (COMPLETE):
- ✅ All backend endpoints verified
- ✅ Contract function mapping confirmed
- ✅ Build processes validated
- ✅ Missing `/admin/mint` endpoint implemented and fixed

**Manual UI Testing** (IN PROGRESS):
- ✅ Test 1: Mint tokens to approved wallet - PASSING
- ✅ Test 2: Transfer between approved wallets - PASSING  
- ✅ Test 3: Transfer to non-approved wallet (fails on-chain) - PASSING
- ✅ Test 4: Approve new wallet, transfer succeeds - PASSING
- ⏳ Test 5: Execute 7-for-1 stock split - PENDING BACKEND REDEPLOY
- ⏳ Test 6: Change ticker symbol - NOT YET TESTED
- ⏳ Test 7: Export cap-table at specific block - PASSING (CSV/JSON working)

## Recent Changes (Last Session)

### Phase 2A Backend API Implementation (COMPLETE)
**Status**: ✅ All 10 endpoints implemented and compiled successfully

**What Was Built**:
1. **Express Server** with TypeScript, CORS, error handling
2. **Configuration Layer**: Environment validation (zod), PostgreSQL pool, viem clients
3. **Database Service**: Queries for cap-table, transfers, corporate actions, wallet info
4. **Blockchain Service**: Transaction submission via viem (transfer, approve, revoke, stock split, symbol update)
5. **API Routes**: Health check, data endpoints (GET), transaction endpoints (POST)
6. **Middleware**: Error handler, request validation (zod schemas)
7. **Type Definitions**: Full TypeScript interfaces for all data structures

**Endpoints Delivered**:
- ✅ GET /api/health - Service health check
- ✅ GET /api/cap-table - Current token holders
- ✅ GET /api/transfers - Transfer history with filtering
- ✅ GET /api/corporate-actions - Stock splits, symbol changes
- ✅ GET /api/wallet/:address - Wallet details
- ✅ POST /api/transfer - Submit token transfer
- ✅ POST /api/admin/approve-wallet - Approve wallet
- ✅ POST /api/admin/revoke-wallet - Revoke wallet
- ✅ POST /api/admin/stock-split - Execute stock split
- ✅ POST /api/admin/update-symbol - Update token symbol

**Technical Stack**:
- Express 4.18 + TypeScript 5.3
- viem 2.7 for blockchain interactions
- pg 8.11 for PostgreSQL queries
- zod 3.22 for request validation
- cors 2.8 for CORS handling

**Files Created**: 18 source files in `/backend/src/` directory with proper structure

### Railway Deployment Architecture (Current)
**Project**: superb-trust (Railway)
**Services**:
1. **PostgreSQL Database**: Running, shared by indexer and backend
2. **chainequity-mlx (Indexer)**: Running 24/7, monitors blockchain, writes to database (internal URL)
3. **tender-achievement (Backend)**: Running, serves API at https://tender-achievement-production-3aa5.up.railway.app/api (uses public database URL)

**Key Configuration**:
- Indexer root: `indexer/` (GitHub repo, auto-deploys)
- Backend root: `backend/` (GitHub repo, auto-deploys)
- Database: PostgreSQL in same Railway project (enables internal DNS)
- See `RAILWAY_ARCHITECTURE.md` for complete details

### Railway Database Troubleshooting
1. **Attempted**: `railway run npm run init-db` locally
   - **Result**: Failed with `ENOTFOUND postgres.railway.internal`
   - **Reason**: Internal DNS only resolves within Railway's network

2. **Attempted**: `railway connect postgres` to verify tables
   - **Result**: Connection failed - psql not installed in Railway's database UI
   - **Reason**: Railway's web console doesn't include PostgreSQL client tools

3. **Solution Implemented**: Modified `/indexer/src/index.ts` to auto-initialize database schema on startup
   - Added `import { initializeSchema } from './db/initSchema';`
   - Call `await initializeSchema();` before event processing starts
   - Committed as `2e5e965` and deployed via `railway up`

4. **Status**: New deployment uploaded but verification pending. Logs from Railway CLI still show old deployment output (without "✅ Database schema ready" message).

### Root Cause Identified
From `RAILWAY_FIX_COMPLETE.md`: The Railway project was misconfigured from the start. Instead of having TWO services (PostgreSQL database + Node.js indexer app), it has only ONE service named "Postgres" that is trying to run the Node.js code. This hybrid approach causes deployment issues.

**Required Fix**: Create two separate Railway services:
- **Service 1**: PostgreSQL (using Railway's database template)
- **Service 2**: Indexer (Node.js app from GitHub repo)

## Next Steps (Ordered by Priority)

### 1. ✅ Phase 2A Backend Deployed [COMPLETE]
Backend successfully deployed to Railway:

**Deployment Complete**:
- ✅ Service: tender-achievement
- ✅ URL: https://tender-achievement-production-3aa5.up.railway.app/api
- ✅ Port: 3001 (Railway auto-assigned)
- ✅ Health check: Passing
- ✅ Database: Connected
- ✅ Blockchain: Connected
- ✅ All endpoints: Working
- ✅ Integration tests: Passing

**Issues Fixed During Deployment**:
- ✅ Database column name mismatch (`is_approved` vs `approved`) - Fixed
- ✅ Root directory configuration - Set to `backend/`
- ✅ Environment variables - All set correctly

### 2. ✅ Phase 2A Backend Testing [COMPLETE]
All endpoints verified:
- ✅ GET /api/health - Working
- ✅ GET /api/cap-table - Working
- ✅ GET /api/transfers - Working
- ✅ GET /api/corporate-actions - Working
- ✅ GET /api/wallet/:address - Working (after column fix)
- ✅ POST endpoints - Correctly require Gnosis Safe (expected behavior)
- ✅ Error handling - Working correctly

### 3. ✅ Phase 3 Frontend Complete [COMPLETE]
Frontend application built and deployed:
- ✅ React 19 + Vite + TypeScript configured
- ✅ wagmi integrated with Base Sepolia + MetaMask
- ✅ shadcn/ui components styled with Tailwind
- ✅ Admin Dashboard (approval, mint, corporate actions)
- ✅ Investor View (balance, transfers, transaction history)
- ✅ Cap Table with CSV/JSON export
- ✅ All 14 functional requirements from PRD implemented
- ✅ Build successful (639 KB bundle)
- ✅ **Deployed to Vercel**: https://chainequity-mlx.vercel.app/
- ✅ **MetaMask connection working**: Connector ID fix applied

**Initial Implementation Details** (Nov 6, 2025):
- **45+ source files** created in `/ui/src/`
- **4 pages**: Dashboard, InvestorView, CapTable, NotConnected
- **13 components**: Admin (3), Investor (2), Cap Table (2), Transactions (1), Layout (2), UI (10 shadcn components)
- **6 custom hooks**: useBalance, useApprovalStatus, useCapTable, useTransactions, useIsAdmin, useWalletInfo
- **API client**: 10+ functions wrapping all backend endpoints
- **Configuration**: wagmi (Base Sepolia + MetaMask), contracts (address + ABI), API (backend URL)
- **Build output**: 639 KB main bundle, TypeScript strict mode, no errors
- **Documentation**: PHASE3_FRONTEND_COMPLETION_REPORT.md (674 lines)

**MetaMask Connection Issue Resolution**:
- **Root Cause**: wagmi connector ID mismatch - code was looking for `'metaMask'` but wagmi creates connector with ID `'metaMaskSDK'`
- **Solution**: Updated connector lookup in `ui/src/pages/NotConnected.tsx` to find `'metaMaskSDK'` (or `'metaMask'` for backward compatibility)
- **CSP Configuration**: Added permissive CSP in `ui/vercel.json` with `unsafe-eval` for wagmi/viem requirements
- **Status**: ✅ MetaMask connection modal appears on first click, no console errors

### 4. Phase 4 Integration & Testing [NEXT - IMMEDIATE]
- End-to-end testing of all components
- Demo scenario walkthroughs
- Bug fixes
- Video recording

## Active Decisions & Considerations

### Railway Architecture Decision [MADE]
**Decision**: Use two separate Railway services (PostgreSQL + Indexer), not one combined service.

**Rationale**: Railway's architecture expects database templates to run database software and app services to run application code. Mixing them causes startup failures and connection issues.

**Impact**: Requires Railway project reconfiguration but ensures proper separation of concerns.

### Database Connection Strategy [CLARIFIED]
- **Indexer on Railway**: Use INTERNAL URL (`postgres.railway.internal:5432`) for fast private network connection
- **Backend on Railway**: Use PUBLIC URL (`nozomi.proxy.rlwy.net:25369`) for external connection
- **Local development**: Use PUBLIC URL (internal DNS not accessible)

### Database Initialization Strategy [RESOLVED]
**Decision**: Auto-initialize schema on indexer startup (already implemented).

**Alternatives Considered**:
- ❌ Manual SQL via Railway dashboard - requires user action every deployment
- ❌ Separate init script - railway run doesn't work for internal DNS
- ✅ Auto-init on startup - runs automatically, idempotent (CREATE TABLE IF NOT EXISTS)

**Implementation**: `/indexer/src/index.ts` calls `initializeSchema()` before event processing.

### Backend Transaction Signing Approach [PLANNED]
**For Demo**: Use Admin private key directly for quick transactions
**For Production**: Route admin transactions through Gnosis Safe SDK

**Rationale**: Demo needs speed and simplicity. Production requires multi-sig security.

**Implementation Plan**: 
- Backend accepts admin transaction requests
- Demo mode: Sign with Admin key, submit directly
- Production mode: Create Safe transaction proposal, require signatures

## Questions for Sub-Agents

### For Railway Troubleshooting Agent (Current)
1. Can you verify whether database tables exist in the Railway PostgreSQL database?
2. If tables don't exist, can you create them using the schema from `/indexer/src/db/initSchema.ts`?
3. Should we reconfigure Railway with two services or manually create tables in current setup?

### For Backend Specialist (Phase 2A)
1. Should we implement both Safe and direct signing, or just direct signing for demo?
2. How should we handle transaction status tracking (pending, confirmed, failed)?
3. Should API responses include blockchain transaction hashes and block explorers links?
4. What error handling standards should we follow for blockchain RPC failures?

### For Frontend Specialist (Phase 3)
1. Should we display split-adjusted balances or base balances with multiplier indicator?
2. How should we handle MetaMask network switching (if user is on wrong network)?
3. Should we show transaction status with real-time updates or just fire-and-forget?

## Files Modified Recently

### Indexer Auto-Init Implementation
- **File**: `/indexer/src/index.ts`
- **Change**: Added `initializeSchema()` call on line 25
- **Commit**: `2e5e965` - "Add automatic database schema initialization on indexer startup"
- **Status**: Deployed to Railway, verification pending

### Railway Documentation
- **File**: `RAILWAY_FIX_COMPLETE.md`
- **Purpose**: Comprehensive troubleshooting guide for Railway database issues
- **Contains**: Root cause analysis, step-by-step fix instructions, verification steps

- **File**: `RAILWAY_DB_INITIALIZATION_ISSUE.md`
- **Purpose**: Problem summary for handoff to troubleshooting agent
- **Contains**: 3-paragraph description of the issue, root causes, and solution requirements

### Memory Bank Creation
- **Files**: All `/memory-bank/*.md` files created this session
- **Purpose**: Persistent project knowledge for AI agents across sessions
- **Status**: Newly created, ready for sub-agent consumption

## Current Environment State

### What's Deployed
- ✅ Smart contracts on Base Sepolia (verified working)
- ✅ Gnosis Safe on Base Sepolia (configured, owns contract)
- ⏳ Indexer code on Railway (deployed, verification pending)
- ⏳ PostgreSQL on Railway (provisioned, tables not confirmed)
- ❌ Backend API (not started)
- ❌ Frontend (not started)

### What's in GitHub
- ✅ Contracts code (main branch)
- ✅ Indexer code with auto-init (main branch, commit 2e5e965)
- ❌ Backend code (not created yet)
- ❌ Frontend code (not created yet)

### What's Configured
- ✅ Base Sepolia wallets (3 addresses funded)
- ✅ Gnosis Safe (2-of-3 multi-sig)
- ✅ Railway project (needs reconfiguration)
- ✅ Vercel project (connected to GitHub)
- ✅ GitHub repository (single repo, clean)

## Resource Links

### Critical Files
- `/Users/mylessjs/Desktop/ChainEquity/wallet-addresses.txt` - All addresses and keys
- `/Users/mylessjs/Desktop/ChainEquity/RAILWAY_FIX_COMPLETE.md` - Current blocker solution
- `/Users/mylessjs/Desktop/ChainEquity/contracts/out/GatedToken.sol/GatedToken.json` - Contract ABI
- `/Users/mylessjs/Desktop/ChainEquity/PHASE1_COMPLETION_REPORT.md` - Contract deployment details

### Railway Access
- Dashboard: https://railway.app/dashboard
- Project: ChainEquity-Indexer (production environment)
- CLI: `railway` command (logged in, linked to project)

### Blockchain Resources
- Contract: `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964`
- Gnosis Safe: `0x6264F29968e8fd2810cB79fb806aC65dAf9db73d`
- Block Explorer: https://sepolia.basescan.org
- RPC: https://sepolia.base.org

## Success Criteria for Current Session

**Phase 2B Complete** when:
- [ ] Railway has 2 separate services (PostgreSQL + Indexer)
- [ ] Indexer logs show "✅ Database schema ready"
- [ ] Database contains 4 tables: transfers, balances, approvals, corporate_actions
- [ ] Indexer shows "📡 Listening for blockchain events..."
- [ ] PUBLIC database URL documented for Phase 2A

**Ready for Phase 2A** when:
- [ ] Phase 2B checklist above is complete
- [ ] Backend specialist prompt generated with all required inputs
- [ ] Database schema documented and accessible
- [ ] Contract ABI and address confirmed in prompt

---

**Note**: This file represents the "current moment" in the project. Update it frequently as work progresses to keep the next agent (or post-reset instance) fully informed.

