# Phase 4: Integration & Testing Specialist Prompt

**Project**: ChainEquity - Tokenized Security Prototype  
**Phase**: 4 - Integration & Testing  
**Timeline**: 4-6 hours  
**Model Recommendation**: Composer (for comprehensive testing and bug fixes)  
**Date**: 2025-11-06

---

## Your Mission

You are the **Integration & Testing Specialist** for ChainEquity, a tokenized security prototype demonstrating compliance-gated ERC-20 tokens on Base Sepolia. Your task is to perform end-to-end testing of the complete system, verify all demo scenarios work correctly, document any bugs, fix critical issues, and prepare the system for a successful demo video recording.

**Critical Success**: All 7 demo scenarios from `DEMO_VIDEO.md` must execute flawlessly and be documented in your completion report.

---

## Project Context

### What Has Been Built

**Phase 1: Smart Contracts** ✅ COMPLETE
- Contract deployed: `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964` (Base Sepolia)
- Gnosis Safe owner: `0x6264F29968e8fd2810cB79fb806aC65dAf9db73d` (2-of-3 multi-sig)
- Full test suite: 10/10 passing
- Gas optimization: All operations within target
- Deployment block: `33313307`

**Phase 2A: Backend API** ✅ COMPLETE
- Deployed to Railway: `tender-achievement-production-3aa5.up.railway.app`
- API Base URL: `https://tender-achievement-production-3aa5.up.railway.app/api`
- 10 endpoints operational (5 GET, 5 POST)
- Health check: ✅ Passing (database + blockchain connected)
- Port: 3001

**Phase 2B: Event Indexer** ✅ COMPLETE
- Deployed to Railway: `chainequity-mlx` service
- Running 24/7, monitoring blockchain events
- Database: PostgreSQL (4 tables: transfers, balances, approvals, corporate_actions)
- Auto-initialized schema on startup

**Phase 3: Frontend** ✅ COMPLETE
- Deployed to Vercel: `https://chainequity-mlx.vercel.app/`
- React 19 + Vite + wagmi + shadcn/ui
- Admin Dashboard, Investor View, Cap Table
- MetaMask connection configured
- CSP headers configured for `unsafe-eval`

### Key Configuration Files

**Wallet Addresses** (`/wallet-addresses.txt`):
- Admin: `0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6`
- Investor A: `0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e`
- Investor B: `0xefd94a1534959e04630899abdd5d768601f4af5b`
- Gnosis Safe: `0x6264F29968e8fd2810cB79fb806aC65dAf9db73d`

**Database URLs** (Railway `superb-trust` project):
- Internal: `postgresql://postgres:opjpippLFhoVcIuuMllwtrKcSGTBJgar@postgres.railway.internal:5432/railway`
- Public: `postgresql://postgres:opjpippLFhoVcIuuMllwtrKcSGTBJgar@yamanote.proxy.rlwy.net:23802/railway`

**Contract Details**:
- Address: `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964`
- Network: Base Sepolia (Chain ID: 84532)
- RPC: `https://sepolia.base.org`
- Explorer: `https://sepolia.basescan.org/address/0xFCc9E74019a2be5808d63A941a84dEbE0fC39964`

---

## Implementation Specifications (Work from these)

### Primary Documents
1. **`PRD_PRODUCT.md`** (~626 lines): User stories, functional requirements, acceptance criteria
2. **`PRD_TECHNICAL.md`** (~1234 lines): Architecture, API endpoints, database schema, contract specs
3. **`DEMO_VIDEO.md`** (~270 lines): 6-minute demo script with 7 required scenarios
4. **`TECHNICAL_DECISIONS.md`**: Architecture choices and rationale
5. **Phase Completion Reports**: Read all completion reports to understand what was built

### Testing Requirements (from PRD_PRODUCT.md Section 4.4)

**All 7 Demo Scenarios Must Work**:
1. ✅ Mint tokens to approved wallet → SUCCESS
2. ✅ Transfer between two approved wallets → SUCCESS
3. ✅ Transfer to non-approved wallet → BLOCKED
4. ✅ Approve new wallet → Transfer now succeeds
5. ✅ Execute 7-for-1 split → Balances multiply by 7
6. ✅ Change ticker symbol → Symbol updates, balances unchanged
7. ✅ Export cap-table at specific block

**Success Criteria (from progress.md)**:
- ✅ Can connect wallet to frontend
- ✅ Can view cap table with correct balances
- ✅ Can execute transfer between approved wallets
- ✅ Transfer rejection to non-approved wallet works
- ✅ Admin can approve wallet via Gnosis Safe
- ✅ Admin can execute stock split via Gnosis Safe
- ✅ Stock split reflects in cap table
- ✅ Admin can update symbol via Gnosis Safe
- ✅ Symbol update reflects in frontend (contract query)
- ✅ All transactions show in history
- ✅ Corporate actions logged and displayed

---

## Your Tasks

### 1. End-to-End Integration Testing (2-3 hours)

#### 1.1 Frontend-Backend Integration
- [ ] Verify frontend can connect to backend API
- [ ] Test all 10 API endpoints from frontend
- [ ] Verify CORS configuration allows frontend requests
- [ ] Check error handling for failed API calls
- [ ] Verify loading states display correctly

#### 1.2 Frontend-Blockchain Integration
- [ ] Test MetaMask wallet connection on Base Sepolia
- [ ] Verify wallet detection works correctly
- [ ] Test direct contract calls via wagmi (transfers)
- [ ] Verify transaction confirmation flow
- [ ] Check error messages for failed transactions
- [ ] Verify balance updates after successful transactions

#### 1.3 Backend-Blockchain Integration
- [ ] Test backend transaction submission via viem
- [ ] Verify admin actions route correctly (Safe vs direct)
- [ ] Check transaction status polling
- [ ] Verify error handling for blockchain RPC failures
- [ ] Test all 5 POST endpoints submit transactions correctly

#### 1.4 Indexer-Database Integration
- [ ] Verify indexer is writing events to database
- [ ] Check that all 7 event types are indexed
- [ ] Test backfill from deployment block
- [ ] Verify real-time event processing
- [ ] Check database schema matches expectations

#### 1.5 Backend-Database Integration
- [ ] Test all database queries return correct data
- [ ] Verify cap-table calculation accuracy
- [ ] Test historical query functionality
- [ ] Check corporate actions are retrieved correctly
- [ ] Verify wallet approval status queries

### 2. Demo Scenario Testing (1-2 hours)

Execute each demo scenario from `DEMO_VIDEO.md` and document results:

#### Scenario 1: Mint Tokens to Approved Wallet
- [ ] Admin approves Investor A wallet (if not already approved)
- [ ] Admin mints tokens to Investor A via frontend
- [ ] Verify transaction succeeds on blockchain
- [ ] Verify balance updates in frontend
- [ ] Verify cap-table reflects new balance
- [ ] Verify indexer captured the event

#### Scenario 2: Transfer Between Approved Wallets
- [ ] Ensure both Investor A and Investor B are approved
- [ ] Investor A transfers tokens to Investor B via frontend
- [ ] Verify transaction succeeds
- [ ] Verify both balances update correctly
- [ ] Verify ownership percentages recalculate
- [ ] Verify transfer appears in transaction history

#### Scenario 3: Transfer to Non-Approved Wallet
- [ ] Create/identify a non-approved wallet address
- [ ] Investor A attempts transfer to non-approved wallet
- [ ] Verify transaction reverts with clear error message
- [ ] Verify frontend shows error before transaction (client-side validation)
- [ ] Verify balances unchanged
- [ ] Document the error message displayed

#### Scenario 4: Approve New Wallet
- [ ] Admin approves a new wallet via frontend
- [ ] Verify transaction succeeds (Gnosis Safe or direct)
- [ ] Verify approval status updates in database
- [ ] Verify frontend shows wallet as approved
- [ ] Retry Scenario 3 transfer → Should now succeed
- [ ] Document the full approval → transfer flow

#### Scenario 5: Execute 7-for-1 Stock Split
- [ ] **CRITICAL**: Note current balances before split
- [ ] Admin executes 7-for-1 split via frontend
- [ ] Verify transaction succeeds
- [ ] Verify all balances multiply by 7
- [ ] Verify ownership percentages remain unchanged
- [ ] Verify total supply updates correctly
- [ ] Verify corporate_actions table has split entry
- [ ] **IMPORTANT**: Document post-split transfer limitations (amounts must be divisible by 7)

#### Scenario 6: Change Ticker Symbol
- [ ] Admin changes symbol from "ACME" to "ACMEX" (or similar)
- [ ] Verify transaction succeeds
- [ ] Verify frontend displays new symbol
- [ ] Verify balances unchanged
- [ ] Verify contract query returns new symbol
- [ ] Verify corporate_actions table has symbol change entry

#### Scenario 7: Export Cap-Table at Specific Block
- [ ] Navigate to Cap Table page
- [ ] Test CSV export with current data
- [ ] Test JSON export with current data
- [ ] Test historical query at block before stock split
- [ ] Verify historical cap-table shows pre-split balances
- [ ] Test historical export (CSV/JSON)
- [ ] Verify exported files have correct format and data

### 3. Bug Identification & Critical Fixes (1-2 hours)

#### 3.1 Critical Bugs (Fix Immediately)
Fix any bugs that prevent demo scenarios from completing:
- [ ] Transaction failures that shouldn't fail
- [ ] Balance calculation errors
- [ ] API endpoint failures
- [ ] Frontend crashes or infinite loading
- [ ] Database query errors
- [ ] MetaMask connection failures

#### 3.2 Non-Critical Bugs (Document)
Document bugs that don't block demo but should be noted:
- [ ] UI/UX issues (styling, layout)
- [ ] Performance issues (slow queries, loading times)
- [ ] Edge cases not handled gracefully
- [ ] Missing error messages
- [ ] Inconsistent data formatting

#### 3.3 Known Limitations (Document)
- [ ] Stock split transfer limitations (divisible by 7)
- [ ] Block explorer symbol caching delays
- [ ] Gas costs for large operations
- [ ] Any other documented limitations

### 4. Documentation & Reporting (30-60 minutes)

#### 4.1 Create Test Results Document
Create `PHASE4_TEST_RESULTS.md` with:
- Test execution summary (pass/fail for each scenario)
- Bug list (critical vs non-critical)
- Fixes applied (if any)
- Known issues and limitations
- Performance metrics (transaction times, API response times)
- Recommendations for demo video recording

#### 4.2 Update Completion Report
Create `PHASE4_COMPLETION_REPORT.md` with:
- Integration testing summary
- All 7 demo scenarios: ✅ Pass or ❌ Fail
- System status: Ready for demo or needs fixes
- Deployment status (all services operational)
- Next steps for demo recording

#### 4.3 Update Memory Bank
Update `/memory-bank/progress.md`:
- Mark Phase 4 as complete
- Update "What Works" section with verified functionality
- Update "Known Issues" with any remaining bugs
- Mark demo readiness status

---

## Technical Implementation Details

### Frontend Configuration
- **URL**: `https://chainequity-mlx.vercel.app/`
- **Backend API**: `https://tender-achievement-production-3aa5.up.railway.app/api`
- **Environment Variables**: Check `ui/.env` or Vercel dashboard
  - `VITE_BACKEND_URL` - Backend API base URL
  - `VITE_CONTRACT_ADDRESS` - Smart contract address
  - `VITE_BASE_SEPOLIA_RPC` - RPC endpoint

### Backend API Endpoints (from Phase 2A)

**GET Endpoints**:
- `GET /api/health` - Service health check
- `GET /api/cap-table` - Current token holders
- `GET /api/transfers?from=&to=&limit=` - Transfer history
- `GET /api/corporate-actions?type=&limit=` - Corporate actions
- `GET /api/wallet/:address` - Wallet details

**POST Endpoints**:
- `POST /api/transfer` - Submit token transfer
- `POST /api/admin/approve-wallet` - Approve wallet
- `POST /api/admin/revoke-wallet` - Revoke wallet
- `POST /api/admin/stock-split` - Execute stock split
- `POST /api/admin/update-symbol` - Update token symbol
- `POST /api/admin/mint` - Mint tokens (if implemented)

**Request/Response Formats**: See `PHASE2A_COMPLETION_REPORT.md` for detailed API documentation.

### Database Schema (from Phase 2B)

**Tables**:
- `transfers`: `id, transaction_hash, block_number, block_timestamp, from_address, to_address, amount, created_at`
- `balances`: `address (PK), balance, updated_at`
- `approvals`: `address (PK), approved (boolean), approved_at, revoked_at, updated_at`
- `corporate_actions`: `id, action_type, transaction_hash, block_number, block_timestamp, details (JSONB), created_at`

**Indexes**: On `from_address`, `to_address`, `block_number`, `action_type`

### Smart Contract Interface (from Phase 1)

**Key Functions**:
- `approveWallet(address wallet)` - Add to allowlist (owner only)
- `revokeWallet(address wallet)` - Remove from allowlist (owner only)
- `mint(address to, uint256 amount)` - Mint tokens (owner only)
- `burn(uint256 amount)` - Burn tokens (requires approval first)
- `transfer(address to, uint256 amount)` - Transfer tokens (both must be approved)
- `executeStockSplit(uint256 multiplier)` - Execute stock split (owner only)
- `updateSymbol(string memory newSymbol)` - Update token symbol (owner only)

**Key Events**:
- `Transfer(address indexed from, address indexed to, uint256 value)`
- `WalletApproved(address indexed wallet)`
- `WalletRevoked(address indexed wallet)`
- `StockSplit(uint256 multiplier, uint256 newTotalSupply)`
- `SymbolChanged(string oldSymbol, string newSymbol)`
- `TokensMinted(address indexed to, uint256 amount)`
- `TokensBurned(address indexed from, uint256 amount)`

**Important Notes**:
- Contract owner is Gnosis Safe (2-of-3 multi-sig)
- Admin private key can sign directly for demo (bypasses Safe for speed)
- Virtual stock split: Multiplier applied at read time, not stored balances
- Transfer amounts after split must be divisible by multiplier to avoid rounding

### Testing Tools

**Recommended Tools**:
- Browser DevTools (Network tab, Console)
- MetaMask (3 test wallets)
- Railway CLI: `railway logs` for backend/indexer
- PostgreSQL client (optional): `railway connect postgres`
- Basescan explorer for transaction verification
- Postman/curl for API testing (optional)

**Browser Setup**:
- Chrome: Admin wallet (for admin actions)
- Safari/Incognito: Investor A wallet
- Second Safari/Incognito: Investor B wallet

---

## Success Criteria

### Must-Have (Demo Blockers)
- ✅ All 7 demo scenarios execute successfully
- ✅ MetaMask connection works on Vercel deployment
- ✅ All API endpoints respond correctly
- ✅ Cap-table displays accurate balances
- ✅ Stock split multiplies balances correctly
- ✅ Symbol change updates frontend
- ✅ Historical cap-table export works
- ✅ Transaction history displays correctly

### Nice-to-Have (Document as Known Issues)
- ⚠️ Edge cases handled gracefully
- ⚠️ Perfect error messages for all failure modes
- ⚠️ Optimal performance (all queries <2 seconds)
- ⚠️ Perfect UI/UX (no styling issues)

### Demo Readiness Checklist
- [ ] All 7 scenarios pass end-to-end
- [ ] No critical bugs remaining
- [ ] All services operational (frontend, backend, indexer, database)
- [ ] Test wallets funded with testnet ETH
- [ ] Gnosis Safe configured and accessible
- [ ] Documentation complete (`PHASE4_COMPLETION_REPORT.md`)
- [ ] Test results documented (`PHASE4_TEST_RESULTS.md`)
- [ ] Memory bank updated
- [ ] Ready for demo video recording

---

## Deliverables

### 1. Test Execution
- Execute all 7 demo scenarios
- Document results (pass/fail with screenshots or logs)
- Identify all bugs (critical and non-critical)
- Fix critical bugs that block demo

### 2. Documentation
- `PHASE4_TEST_RESULTS.md` - Detailed test execution log
- `PHASE4_COMPLETION_REPORT.md` - Phase completion summary
- Update `memory-bank/progress.md` with Phase 4 status
- Update `memory-bank/activeContext.md` with current state

### 3. Code Fixes (if needed)
- Fix critical bugs in frontend (`ui/src/`)
- Fix critical bugs in backend (`backend/src/`)
- Fix critical bugs in indexer (`indexer/src/`)
- Commit and push all fixes to GitHub

### 4. Demo Preparation
- Verify all services are operational
- Document demo script walkthrough with actual addresses
- Prepare troubleshooting guide for demo recording
- Note any demo tips (e.g., use amounts divisible by 7 after split)

---

## Completion Report Format

Create `PHASE4_COMPLETION_REPORT.md` with this structure:

```markdown
# Phase 4: Integration & Testing - Completion Report

## Executive Summary
[Brief summary: All scenarios pass / Some scenarios fail / System ready for demo]

## Test Execution Summary

### Scenario 1: Mint Tokens to Approved Wallet
- Status: ✅ PASS / ❌ FAIL
- Details: [Transaction hash, balance updates, etc.]
- Issues: [Any issues encountered]

[... repeat for all 7 scenarios ...]

## Integration Testing Results

### Frontend-Backend Integration
- Status: ✅ PASS / ❌ FAIL
- Issues: [List any issues]

[... repeat for all integration areas ...]

## Bug Report

### Critical Bugs (Fixed)
1. [Bug description] - ✅ FIXED
   - Fix: [What was changed]
   - Commit: [Git commit hash]

### Critical Bugs (Unfixed)
1. [Bug description] - ❌ NOT FIXED
   - Impact: [Why it blocks demo]
   - Workaround: [If any]

### Non-Critical Bugs
1. [Bug description] - ⚠️ DOCUMENTED
   - Impact: [Why it doesn't block demo]

## System Status

### Services Operational
- Frontend (Vercel): ✅ / ❌
- Backend (Railway): ✅ / ❌
- Indexer (Railway): ✅ / ❌
- Database (Railway): ✅ / ❌

### Demo Readiness
- **Status**: ✅ READY / ⚠️ NEEDS FIXES / ❌ NOT READY
- **Blockers**: [List any blockers]
- **Recommendations**: [Tips for demo recording]

## Next Steps
1. [Action items for demo recording]
2. [Any remaining work needed]
3. [Handoff instructions for demo video recording]
```

---

## Important Notes

### Stock Split Transfer Limitation
**CRITICAL**: After executing a 7-for-1 stock split, transfer amounts must be divisible by 7 to avoid rounding errors. Safe amounts: 700, 1400, 2100, 3500, 7000, 14000, 21000. This is documented in `DEMO_VIDEO.md` and `PHASE1_COMPLETION_REPORT.md`.

### Gnosis Safe vs Direct Signing
For demo speed, admin actions may use direct signing (bypassing Safe multi-sig). In production, all admin actions should go through Gnosis Safe. Test both if possible, but prioritize direct signing for demo if Safe is slow.

### MetaMask Connection
The frontend has CSP headers configured for `unsafe-eval`. If MetaMask still doesn't connect, check:
1. Browser console for errors
2. Vercel deployment logs
3. Network tab for CORS issues
4. MetaMask network is set to Base Sepolia

### Database Query Performance
Historical cap-table queries should complete within 2 seconds for up to 1000 transactions. If slower, document the performance issue.

### Error Handling
All errors should be user-friendly. Document any cryptic error messages that need improvement.

---

## Resources

### Documentation Files (Read These First)
- `PRD_PRODUCT.md` - Product requirements
- `PRD_TECHNICAL.md` - Technical specifications
- `DEMO_VIDEO.md` - Demo script (6 minutes, 7 scenarios)
- `TECHNICAL_DECISIONS.md` - Architecture decisions
- `PHASE1_COMPLETION_REPORT.md` - Contract details
- `PHASE2A_COMPLETION_REPORT.md` - Backend API details
- `docs/railway/reports/PHASE2B_INDEXER_COMPLETION_REPORT.md` - Indexer details
- `PHASE3_FRONTEND_COMPLETION_REPORT.md` - Frontend details
- `RAILWAY_ARCHITECTURE.md` - Deployment architecture
- `wallet-addresses.txt` - All addresses and credentials

### Memory Bank
- `/memory-bank/progress.md` - Project status
- `/memory-bank/activeContext.md` - Current work focus
- `/memory-bank/systemPatterns.md` - Architecture patterns
- `/memory-bank/techContext.md` - Technology stack

### External Links
- Frontend: https://chainequity-mlx.vercel.app/
- Backend API: https://tender-achievement-production-3aa5.up.railway.app/api
- Contract Explorer: https://sepolia.basescan.org/address/0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Gnosis Safe: https://app.safe.global

---

## Final Instructions

1. **Read all completion reports** from Phases 1-3 to understand what was built
2. **Execute all 7 demo scenarios** systematically and document results
3. **Fix critical bugs** that prevent demo completion
4. **Document non-critical bugs** for future improvement
5. **Create comprehensive test results** and completion report
6. **Update memory bank** with Phase 4 status
7. **Mark system as demo-ready** if all scenarios pass

**Your goal**: Ensure the system is ready for a flawless 6-minute demo video recording that demonstrates all 7 required scenarios from the PDF.

Good luck! 🚀

