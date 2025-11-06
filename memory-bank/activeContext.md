# ChainEquity - Active Context

## Current Work Focus

**Primary Goal**: Phase 2B (Event Indexer) COMPLETE ✅ - Indexer deployed to Railway project `superb-trust` and operational, monitoring contract `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964` on Base Sepolia with all 4 database tables initialized. See `docs/railway/ORCHESTRATOR_SUMMARY.md` for complete deployment status and next steps for Phase 2A (Backend API).

## Recent Changes (Last Session)

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

### 1. Complete Railway Database Setup [IMMEDIATE - BLOCKING]
Follow the comprehensive guide in `RAILWAY_FIX_COMPLETE.md`:

**Option A: Start Fresh (Recommended)**
- Create new Railway project: "ChainEquity-Indexer-Fixed"
- Add PostgreSQL service via dashboard (Database template)
- Deploy indexer code as separate service
- Set environment variables on indexer service
- Verify logs show "✅ Database schema ready"

**Option B: Fix Current Project**
- Remove/reconfigure the corrupted "Postgres" service
- Add proper PostgreSQL and Indexer services separately

**Required Environment Variables for Indexer Service**:
```
DATABASE_URL=postgresql://postgres:[password]@postgres.railway.internal:5432/railway
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
START_BLOCK=33313307
CHAIN_ID=84532
NODE_ENV=production
```

**Verification Steps**:
- Check Railway dashboard shows 2 services (not 1)
- Check indexer logs for "📦 Initializing database schema..."
- Check indexer logs for "✅ Database schema initialized successfully"
- Check indexer logs for "✅ Database schema ready"
- Verify tables: Use PUBLIC database URL with local psql OR Railway dashboard query editor

### 2. Generate Phase 2A Backend Specialist Prompt [NEXT]
Once Phase 2B is verified working, create comprehensive prompt for backend agent including:
- All Phase 1 outputs (contract address, ABI, deployment block)
- All Phase 2B outputs (database schema, PUBLIC database URL)
- Backend API specifications
- Transaction signing approach (Admin key for demo, Safe for production)
- Success criteria and testing requirements
- Consistent report format

### 3. Implement Phase 2A Backend [AFTER 2B COMPLETE]
Hand off to Backend Specialist sub-agent who will:
- Build Express TypeScript API
- Connect to Railway PostgreSQL (PUBLIC URL)
- Implement cap-table and transaction endpoints
- Submit transactions to Base Sepolia
- Deploy to Railway as separate service
- Return completion report

### 4. Implement Phase 3 Frontend [AFTER 2A COMPLETE]
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

