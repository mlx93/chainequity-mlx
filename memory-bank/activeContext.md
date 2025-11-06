# ChainEquity - Active Context

## Current Work Focus

**Primary Goal**: Phase 2A (Backend API) ✅ COMPLETE - Express/TypeScript API implemented with 10 endpoints (5 GET for data queries, 5 POST for transaction submission). Backend is ready for Railway deployment and testing. Next step is Phase 3 (Frontend) development with React + Vite + wagmi.

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

### 1. Deploy Phase 2A Backend to Railway [IMMEDIATE - NEXT]
Backend implementation is complete. Deploy to Railway:

**Deployment Steps**:
```bash
cd /Users/mylessjs/Desktop/ChainEquity/backend
railway link  # Select superb-trust or create new backend service
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set BASE_SEPOLIA_RPC=https://sepolia.base.org
railway variables set CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
railway variables set CHAIN_ID=84532
railway variables set DATABASE_URL=postgresql://postgres:opjpippLFhoVcIuuMllwtrKcSGTBJgar@yamanote.proxy.rlwy.net:23802/railway
railway variables set ADMIN_PRIVATE_KEY=0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe
railway variables set ADMIN_ADDRESS=0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6
railway variables set SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
railway up
railway logs  # Verify deployment
```

**Verification**:
- [ ] Backend deployed and accessible
- [ ] GET /api/health returns 200
- [ ] Database connection working
- [ ] Can query cap-table endpoint
- [ ] Save Railway URL for Phase 3

### 2. Test Phase 2A Backend Endpoints [AFTER DEPLOYMENT]
Manual testing of all endpoints:
- [ ] Test GET /api/health
- [ ] Test GET /api/cap-table
- [ ] Test GET /api/transfers
- [ ] Test GET /api/corporate-actions
- [ ] Test GET /api/wallet/:address
- [ ] Test POST /api/transfer (requires approved recipient)
- [ ] Test POST /api/admin/approve-wallet
- [ ] Test transaction submission to blockchain

### 3. Generate Phase 3 Frontend Prompt [AFTER 2A DEPLOYMENT]
Once backend is deployed and tested, create comprehensive prompt for frontend agent including:
- Backend API URL (from Railway deployment)
- All available endpoints with request/response formats
- Contract information and ABI
- Frontend tech stack (React + Vite + wagmi + shadcn/ui)
- Vercel deployment instructions
- Success criteria and testing requirements

### 4. Implement Phase 3 Frontend [AFTER 2A TESTING]
Hand off to Frontend Specialist sub-agent who will:
- Build React + Vite + wagmi application
- Connect wallet via MetaMask
- Display cap table and transaction history
- Submit transactions via backend API
- Show Gnosis Safe interface for admin operations
- Deploy to Vercel (auto from GitHub)

### 5. Phase 4 Integration & Testing [FINAL]
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

