# ChainEquity - Product Requirements Document

**Version**: 1.0  
**Project**: Tokenized Security Prototype with Compliance Gating  
**Timeline**: 2 days  
**Last Updated**: 2025-01-06

---

## Executive Summary

### **Project Overview**
ChainEquity is a working prototype demonstrating how tokenized securities can function on-chain with compliance gating, corporate actions, and operator workflows. The system provides a gated ERC-20 token contract with allowlist-based transfer restrictions, an event indexer producing cap-table snapshots, and an operator interface for managing approvals and executing corporate actions.

### **Core Value Proposition**
- **Transparency**: All transfers are auditable on-chain
- **Automation**: Compliance checks happen programmatically without manual intervention
- **Efficiency**: Settlement is instant versus T+2 traditional equity transfers
- **Accuracy**: Cap-table is always correct and queryable at any historical point

### **Success Metrics**
- Zero false-positive transfers (non-allowlisted wallets blocked)
- Zero false-negative blocks (allowlisted wallets can transact)
- Cap-table export generated successfully at any block height
- Corporate actions (split + symbol change) demonstrated in <6 minutes
- All operations complete within Base Sepolia testnet performance norms

### **Key Constraints**
- **Timeline**: 2-day development sprint
- **Scope**: Technical prototype only - NOT regulatory-compliant for production use
- **Audience**: Job interview demonstration for potential employer
- **Deployment**: Base Sepolia testnet with architecture ready for mainnet migration

---

## User Personas

### **Persona 1: Company Admin (Primary)**
**Role**: Cap-table manager, compliance officer, or CFO  
**Goals**:
- Approve investor wallets after KYC verification
- Mint tokens to approved investors
- Execute corporate actions (stock splits, symbol changes)
- Generate accurate cap-table reports for accounting and legal purposes
- Revoke wallet approvals if compliance status changes

**Pain Points**:
- Manual spreadsheet management is error-prone
- Traditional transfer agents are slow (T+2 settlement)
- No real-time visibility into ownership structure
- Corporate actions require coordinating with multiple parties

**Needs**:
- Simple dashboard for wallet approval workflows
- One-click minting to approved investors
- Confidence that unapproved wallets cannot receive tokens
- Instant cap-table exports for board meetings and audits

### **Persona 2: Approved Investor**
**Role**: Equity holder with approved wallet  
**Goals**:
- View token balance and ownership percentage in real-time
- Transfer tokens to other approved investors (secondary sales)
- Receive tokens from other approved holders
- Verify ownership on public blockchain

**Pain Points**:
- Traditional equity transfers take weeks with lawyers and signatures
- No transparency into whether transfer will succeed before attempting
- Cannot verify ownership independently (must trust transfer agent)

**Needs**:
- Clear visibility into balance and percentage ownership
- Instant transfers to other approved investors
- Error messages when attempting invalid transfers (before paying gas)

### **Persona 3: Unapproved Wallet Holder**
**Role**: Individual without KYC approval  
**Goals**:
- Request approval to receive tokens
- Understand why transfers are blocked

**Pain Points**:
- Cannot receive tokens even if sender is willing
- No visibility into approval status

**Needs**:
- Clear feedback that wallet is not approved
- Process to request approval

### **Persona 4: External Auditor (Secondary)**
**Role**: Accountant, lawyer, or regulator  
**Goals**:
- Verify historical cap-table accuracy
- Audit ownership changes over time
- Confirm corporate actions were executed correctly

**Needs**:
- Historical cap-table snapshots at any point in time
- Immutable audit trail of all transfers and corporate actions
- Ability to independently verify data on blockchain

---

## User Stories

### **Epic 1: Wallet Approval Management**

**US-1.1**: As an admin, I can approve a wallet address so that the holder can receive and transfer tokens.  
**Acceptance Criteria**:
- Admin enters wallet address into approval form
- Transaction is submitted to blockchain requiring Safe multi-sig (2/3)
- After confirmation, wallet is added to on-chain allowlist
- Event emitted: `WalletApproved(address, timestamp)`
- UI shows approval status as "Approved"

**US-1.2**: As an admin, I can revoke approval for a wallet so that they can no longer receive tokens.  
**Acceptance Criteria**:
- Admin clicks "Revoke" button next to approved wallet
- Transaction submitted requiring Safe signatures
- After confirmation, wallet removed from allowlist
- Wallet can still transfer existing holdings but cannot receive new tokens
- Event emitted: `WalletRevoked(address, timestamp)`

**US-1.3**: As an investor, I can check my wallet's approval status so I know if I can receive tokens.  
**Acceptance Criteria**:
- Investor connects wallet to UI
- Dashboard displays: "Status: Approved" or "Status: Not Approved"
- If not approved, shows message: "Request approval from admin to receive tokens"

### **Epic 2: Token Minting & Transfers**

**US-2.1**: As an admin, I can mint tokens to an approved wallet so they become a shareholder.  
**Acceptance Criteria**:
- Admin enters recipient address and amount in mint form
- System validates recipient is on allowlist before submitting transaction
- Transaction requires Safe multi-sig approval
- Tokens created and balance updated on-chain
- Event emitted: `TokensMinted(to, amount, minter)`
- Cap-table automatically updates to reflect new holder

**US-2.2**: As an approved investor, I can transfer tokens to another approved investor so we can execute secondary sales.  
**Acceptance Criteria**:
- Investor enters recipient address and amount
- System validates both sender and recipient are approved
- Transaction submitted and confirmed on-chain
- Balances updated immediately: sender decreases, recipient increases
- Event emitted: `Transfer(from, to, amount)`
- Cap-table reflects updated ownership percentages

**US-2.3**: As an approved investor, I cannot transfer tokens to an unapproved wallet so compliance is maintained.  
**Acceptance Criteria**:
- Investor attempts transfer to unapproved address
- Smart contract reverts transaction with error: "Recipient not approved"
- No tokens are transferred
- Investor sees error message in UI before transaction is submitted (client-side validation)
- Gas is not wasted on failed transaction

**US-2.4**: As an unapproved wallet holder, I cannot receive tokens even from approved senders.  
**Acceptance Criteria**:
- Approved investor attempts transfer to unapproved recipient
- Transaction reverts on-chain with error: "Recipient not approved"
- Transfer blocked regardless of sender's approval status
- Clear error message shown to sender explaining why transfer failed

### **Epic 3: Corporate Actions**

**US-3.1**: As an admin, I can execute a stock split so all shareholders receive proportional additional shares.  
**Acceptance Criteria**:
- Admin selects "Execute Stock Split" and enters multiplier (e.g., 7-for-1)
- System shows preview: "All balances will multiply by 7, ownership percentages unchanged"
- Transaction requires Safe multi-sig approval
- After confirmation, all token balances multiply by the factor
- Total supply increases proportionally
- Ownership percentages remain exactly the same
- Event emitted: `StockSplit(multiplier, newTotalSupply, timestamp)`
- UI reflects new balances immediately for all holders

**US-3.2**: As an admin, I can change the token symbol so the company can rebrand.  
**Acceptance Criteria**:
- Admin selects "Change Symbol" and enters new ticker (e.g., "ACMEX")
- System validates new symbol is valid format (alphanumeric, 2-6 characters)
- Transaction requires Safe multi-sig approval
- After confirmation, token metadata updates on-chain
- All balances remain unchanged
- UI displays new symbol for all token amounts
- Event emitted: `SymbolChanged(oldSymbol, newSymbol, timestamp)`
- Block explorers reflect new symbol

### **Epic 4: Cap-Table Management**

**US-4.1**: As an admin, I can view the current cap-table so I know real-time ownership distribution.  
**Acceptance Criteria**:
- Dashboard displays table with columns: Wallet Address, Balance, Ownership %
- Data updates in real-time as transfers occur
- Total supply and percentages calculate automatically
- Table is sortable by balance (descending) by default

**US-4.2**: As an admin, I can export the current cap-table in CSV and JSON formats for accounting purposes.  
**Acceptance Criteria**:
- "Download CSV" button generates and downloads file with proper formatting
- "Download JSON" button generates and downloads structured data
- Files include: wallet address, balance, ownership percentage
- Filename includes timestamp: `captable_YYYY-MM-DD_HHMMSS.csv`

**US-4.3**: As an admin or auditor, I can query historical cap-table at any specific block so I can audit past ownership.  
**Acceptance Criteria**:
- "Historical Query" section allows entering block number
- System reconstructs ownership state at that specific block
- Table updates to show balances as they existed at that point in time
- Clear indication shown: "Cap-table as of Block 12345 (2024-08-15 14:32:17 UTC)"
- Can export historical snapshot in CSV/JSON formats

**US-4.4**: As any user, I can view transaction history so I can audit all transfers and corporate actions.  
**Acceptance Criteria**:
- Transaction log displays all events chronologically
- Each entry shows: timestamp, type (transfer/mint/split/symbol change), addresses, amounts
- Filterable by event type and wallet address
- Links to Basescan for full transaction details

---

## Functional Requirements

### **FR-1: Smart Contract - Gated Token**

**FR-1.1**: Contract MUST implement standard ERC-20 interface for compatibility  
**FR-1.2**: Contract MUST maintain on-chain allowlist as `mapping(address => bool)`  
**FR-1.3**: Contract MUST validate both sender AND recipient are on allowlist before allowing transfers  
**FR-1.4**: Contract MUST allow minting from address(0) to approved wallets (initial distribution)  
**FR-1.5**: Contract MUST revert transfers if either party is not approved with clear error message  
**FR-1.6**: Contract MUST emit events for all state changes: Transfer, WalletApproved, WalletRevoked, StockSplit, SymbolChanged  
**FR-1.7**: Contract MUST have owner/admin controls restricted to Gnosis Safe multi-sig address  
**FR-1.8**: Contract MUST support 7-for-1 stock split via virtual multiplier (gas-efficient implementation)  
**FR-1.9**: Contract MUST support symbol/ticker changes while preserving all balances  
**FR-1.10**: Contract MUST be deployable to Base Sepolia and upgradable to mainnet without code changes

### **FR-2: Issuer Service (Backend)**

**FR-2.1**: Backend MUST provide REST API for wallet approval workflows  
**FR-2.2**: Backend MUST submit allowlist updates to smart contract via Safe multi-sig  
**FR-2.3**: Backend MUST mint tokens to approved wallets only  
**FR-2.4**: Backend MUST query allowlist status for any wallet address  
**FR-2.5**: Backend MUST trigger corporate actions (split, symbol change) via Safe  
**FR-2.6**: Backend MUST validate all inputs before submitting on-chain transactions  
**FR-2.7**: Backend MUST handle transaction confirmation polling and status updates  
**FR-2.8**: Backend MUST expose health check endpoint for monitoring

### **FR-3: Event Indexer**

**FR-3.1**: Indexer MUST listen for Transfer, Mint, Burn events from token contract  
**Note**: Burn events can be represented as Transfer to address(0) or explicit TokensBurned events  
**FR-3.2**: Indexer MUST maintain current balance per wallet in database  
**FR-3.3**: Indexer MUST store all historical events with block number and timestamp  
**FR-3.4**: Indexer MUST generate "as-of block" snapshots for historical queries  
**FR-3.5**: Indexer MUST calculate ownership percentages automatically  
**FR-3.6**: Indexer MUST update database within 10 seconds of block finality  
**FR-3.7**: Indexer MUST handle missing events via backfilling if service restarts  
**FR-3.8**: Indexer MUST listen for corporate action events (StockSplit, SymbolChanged) and update state

### **FR-4: Operator UI (Frontend)**

**FR-4.1**: UI MUST support MetaMask wallet connection on Base Sepolia  
**FR-4.2**: UI MUST detect connected wallet's approval status automatically  
**FR-4.3**: UI MUST display different views for Admin vs Investor roles  
**FR-4.4**: UI MUST show real-time token balances and ownership percentages  
**FR-4.5**: UI MUST provide admin dashboard with wallet approval controls  
**FR-4.6**: UI MUST provide mint interface restricted to admin wallets  
**FR-4.7**: UI MUST provide transfer interface for approved investors  
**FR-4.8**: UI MUST show pending transactions with confirmation status  
**FR-4.9**: UI MUST display corporate actions interface (split, symbol change) for admins  
**FR-4.10**: UI MUST provide cap-table view with CSV/JSON export buttons  
**FR-4.11**: UI MUST support historical cap-table queries by block number  
**FR-4.12**: UI MUST display transaction history log with filtering  
**FR-4.13**: UI MUST show error messages for failed transactions before submission (client-side validation)  
**FR-4.14**: UI MUST be responsive and work on desktop browsers (Chrome, Safari, Firefox)

---

## Non-Functional Requirements

### **Performance**
- **NFR-1**: Token transfers MUST confirm within Base Sepolia testnet norms (2-5 seconds)
- **NFR-2**: Indexer MUST produce cap-table snapshots within 10 seconds of block finality
- **NFR-3**: UI MUST load initial page within 3 seconds on standard broadband
- **NFR-4**: Historical cap-table queries MUST complete within 2 seconds for up to 1000 transactions

### **Security**
- **NFR-5**: Admin actions MUST require 2-of-3 multi-sig approval via Gnosis Safe
- **NFR-6**: Private keys MUST be stored in environment variables, never committed to repository
- **NFR-7**: All API endpoints MUST validate input to prevent injection attacks
- **NFR-8**: Frontend MUST validate wallet approval status before submitting transactions

### **Reliability**
- **NFR-9**: Smart contract MUST handle edge cases (zero amounts, self-transfers)
- **NFR-10**: Indexer MUST recover from RPC disconnections and resume indexing
- **NFR-11**: Backend MUST return appropriate HTTP status codes and error messages
- **NFR-12**: Database MUST be reconstructible from blockchain events if data is lost

### **Usability**
- **NFR-13**: UI MUST use polished components with professional styling (shadcn/ui)
- **NFR-14**: Error messages MUST be clear and actionable for end users
- **NFR-15**: Admin workflows MUST be completable in under 5 clicks
- **NFR-16**: UI MUST show loading states during blockchain transactions

### **Maintainability**
- **NFR-17**: Code MUST be organized with clear separation: contracts / backend / indexer / ui
- **NFR-18**: All services MUST start with one command: `make dev` or `docker-compose up`
- **NFR-19**: README MUST provide concise setup instructions (1-2 pages)
- **NFR-20**: All architectural decisions MUST be documented with rationale

---

## Implementation Phases

### **Phase 1: Foundation** (Day 1, Morning - 4 hours)
**Goal**: Deploy core infrastructure and contracts

**Tasks**:
- Set up monorepo structure (contracts / backend / indexer / ui)
- Initialize Foundry project with OpenZeppelin dependencies
- Develop GatedToken smart contract with allowlist mechanism
- Write Foundry unit tests for transfer restrictions
- Deploy Gnosis Safe to Base Sepolia (manual setup)
- Deploy GatedToken with Safe as owner
- Document contract address and verify on Basescan

**Deliverables**:
- Working smart contract on Base Sepolia
- Test suite passing with gas reports
- Gnosis Safe configured with 2/3 threshold
- Contract verified on explorer

**Success Criteria**:
- Can approve wallet via Safe
- Can mint tokens to approved wallet
- Transfer between approved wallets succeeds
- Transfer to unapproved wallet reverts

### **Phase 2: Backend Services** (Day 1, Afternoon - 4 hours)
**Goal**: Build issuer service and event indexer

**Tasks**:
- Create Express backend with TypeScript
- Implement viem integration for blockchain interactions
- Build REST API endpoints (approve, mint, query status)
- Set up PostgreSQL on Railway
- Create database schema (transfers, balances, corporate_actions)
- Develop event indexer listening to contract events
- Implement cap-table calculation logic
- Add CSV/JSON export functionality

**Deliverables**:
- Backend API deployed to Railway
- Indexer processing events in real-time
- Database populating with transfer data
- API endpoints returning correct data

**Success Criteria**:
- Backend can submit approval transactions via Safe
- Indexer captures all Transfer events
- Database maintains accurate current balances
- Can query cap-table via API endpoint

### **Phase 3: Frontend Development** (Day 2, Morning - 4 hours)
**Goal**: Build polished operator interface

**Tasks**:
- Initialize React + Vite project
- Set up wagmi for wallet connection
- Install shadcn/ui components and configure theme
- Build Admin Dashboard (approval management, minting)
- Build Investor View (balance display, transfer interface)
- Build Cap-Table View (table display, export buttons, historical query)
- Build Corporate Actions interface (split, symbol change)
- Implement transaction status tracking with loading states
- Add error handling and validation
- Deploy frontend to Vercel

**Deliverables**:
- Polished UI deployed to Vercel
- Wallet connection working with MetaMask
- All user stories functional in browser
- Responsive design for desktop

**Success Criteria**:
- Admin can approve wallets and mint tokens via UI
- Investors can transfer tokens to approved wallets
- Cap-table displays correctly with export working
- Corporate actions execute successfully

### **Phase 4: Integration & Demo Prep** (Day 2, Afternoon - 4 hours)
**Goal**: Complete testing, seeding, and demo video

**Tasks**:
- Write comprehensive Foundry test suite (all scenarios)
- Write TypeScript integration tests (backend/indexer)
- Run gas benchmarks and document costs
- Seed historical data (3 founders + 5 investors over 6 months)
- Test all demo scenarios end-to-end in two browsers
- Record 6-minute demo video per script
- Write technical documentation (README, ARCHITECTURE, DECISIONS)
- Final deployment verification on Railway + Vercel

**Deliverables**:
- Complete test suite (all scenarios passing)
- Gas report showing reasonable costs
- Historical data seeded in database
- Demo video recorded and edited
- Documentation complete

**Success Criteria**:
- All 10 required test scenarios pass
- Zero false positives/negatives in correctness tests
- Demo video covers all 7 PDF requirements
- Repository is reproducible (anyone can clone and run)

---

## Testing Requirements

### **Required Test Scenarios** (from ChainEquity PDF)
All of the following MUST be demonstrated in tests and demo video:

1. ✅ **Approve wallet → Mint tokens → Verify balance**
2. ✅ **Transfer between two approved wallets → SUCCESS**
3. ✅ **Transfer from approved to non-approved → FAIL**
4. ✅ **Transfer from non-approved to approved → FAIL**
5. ✅ **Revoke approval → Previously approved wallet can no longer receive**
6. ✅ **Execute 7-for-1 split → All balances multiply by 7, total supply updates**
7. ✅ **Change symbol → Metadata updates, balances unchanged**
8. ✅ **Export cap-table at block N → Verify accuracy**
9. ✅ **Export cap-table at block N+10 → Verify changes reflected**
10. ✅ **Unauthorized wallet attempts admin action → FAIL**

### **Test Coverage Requirements**

**Contract Tests (Foundry)**:
- Unit tests for every public function
- Edge case coverage (zero amounts, self-transfers, already approved)
- Gas benchmarks for all operations
- Admin permission enforcement tests
- Corporate action state validation

**Backend Tests (Vitest)**:
- API endpoint testing (all routes)
- Input validation testing
- Integration tests with contract (testnet or fork)
- Error handling verification

**Indexer Tests (Vitest)**:
- Event processing accuracy
- Cap-table calculation correctness
- Historical query accuracy
- Database update verification

**Manual Demo Testing** (Video):
- All 7 PDF demo requirements
- Multi-browser wallet interaction
- Safe multi-sig transaction flow
- Real-time UI updates

---

## Success Criteria

### **From ChainEquity PDF**
The project will be evaluated on these metrics:

| Category | Metric | Target | Verification Method |
|----------|--------|--------|---------------------|
| **Correctness** | False-positive transfers (non-allowlisted) | 0 | Foundry test: attempt transfer to unapproved → reverts |
| **Correctness** | False-negative blocks (allowlisted) | 0 | Foundry test: transfer between approved → succeeds |
| **Operability** | "As-of block" cap-table export | Generated successfully | Integration test + demo video |
| **Corporate Actions** | Split and symbol change both work | Demonstrated | Foundry tests + demo video scenes 5-6 |
| **Performance** | Transfer confirmation time | Within testnet norms (2-5s) | Measure in demo video |
| **Performance** | Indexer produces cap-table | <10s after finality | Integration test with timer |
| **Documentation** | Chain/standard rationale documented | Clear and justified | TECHNICAL_DECISIONS.md reviewed |

### **Additional Success Metrics**

**Code Quality**:
- All tests passing (100% of required scenarios)
- Gas costs within targets: mint <100k, transfer <100k, approve <50k
- No compiler warnings
- TypeScript strict mode enabled with no errors

**Demo Quality**:
- Video duration 5-7 minutes
- All 7 PDF requirements demonstrated
- Professional appearance (polished UI)
- Clear narration explaining each action

**Reproducibility**:
- Anyone can clone repo and run `make dev` successfully
- All deployment addresses documented
- `.env.example` provided with all variables

---

## Demo Requirements

**Format**: 6-minute screen recording with voiceover  
**Detailed Script**: See `DEMO_VIDEO.md` for complete shot-by-shot breakdown

### **Required Demonstrations** (Brief Summary)
1. **Mint tokens to approved wallet** → SUCCESS
2. **Transfer between two approved wallets** → SUCCESS
3. **Transfer to non-approved wallet** → BLOCKED (show error)
4. **Approve new wallet** → Transfer now succeeds
5. **Execute 7-for-1 split** → Balances multiply by 7
6. **Change ticker symbol** → Symbol updates, balances unchanged
7. **Export cap-table at specific block** → Download CSV/JSON files

**Demo Setup**:
- Two browser windows (Chrome + Safari)
- Three wallets (Admin via Safe, Investor A, Investor B)
- Seeded historical data (3 founders + 5 investors)

---

## Out of Scope

The following features are NOT included in this prototype:

### **Hard-Mode Features** (Optional enhancements listed in PDF)
- Multi-sig admin controls beyond Gnosis Safe integration
- Vesting schedules with cliff and linear unlock
- Partial transfer restrictions (max daily volume per wallet)
- Dividend distribution mechanism
- Secondary market with order book (on-chain DEX)
- Cross-chain bridge for token migration
- Privacy features using zero-knowledge proofs
- Upgradeable contracts with proxy pattern
- Advanced gas optimization beyond virtual split
- On-chain governance for parameter changes

### **Production Features**
- KYC/AML integration with identity providers
- Regulatory compliance (Reg D, Reg S, Reg A+)
- Legal opinion letters
- Accredited investor verification
- Transfer restrictions by jurisdiction
- Lock-up periods and vesting
- Real mainnet deployment with audited contracts
- Customer support infrastructure
- Mobile app development

### **Operational Features**
- User onboarding flows
- Email notifications
- Admin analytics dashboard
- Bulk operations (batch approvals)
- Role-based access control beyond admin/investor
- Audit logging system
- Backup and disaster recovery
- SLA monitoring and alerting

---

## Risks & Mitigations

### **Risk 1: Timeline Constraints (HIGH)**
**Risk**: 2-day timeline may not accommodate unforeseen blockers  
**Impact**: Incomplete demo or missing features  
**Mitigation**:
- Prioritize core requirements over polish
- Use pre-built components (shadcn/ui) to save time
- Have fallback: document features if implementation blocked
- Focus on demo scenarios explicitly listed in PDF

### **Risk 2: Multi-Sig Complexity (MEDIUM)**
**Risk**: Gnosis Safe integration adds manual setup complexity  
**Impact**: Demo preparation time increases  
**Mitigation**:
- Detailed manual setup guide (MANUAL_SETUP.md)
- Test Safe workflow before demo day
- Fallback: Use single owner with documentation that production would use multi-sig

### **Risk 3: Testnet Reliability (MEDIUM)**
**Risk**: Base Sepolia RPC might have downtime or slow confirmations  
**Impact**: Demo transactions fail or timeout  
**Mitigation**:
- Use multiple RPC endpoints (Alchemy, QuickNode, Coinbase)
- Test demo flow multiple times before recording
- Have backup recording if issues occur during final take

### **Risk 4: Wallet Coordination (LOW)**
**Risk**: Managing three wallets in demo becomes confusing  
**Impact**: Demo video shows errors or confusion  
**Mitigation**:
- Label wallet names clearly in MetaMask
- Practice demo script multiple times
- Create checklist for which wallet in which browser

### **Risk 5: Seeded Data Complexity (LOW)**
**Risk**: Historical data seeding might be complex to implement  
**Impact**: Historical queries not fully demonstrated  
**Mitigation**:
- Keep seeding script simple (10-15 transactions max)
- Focus on one scenario: founders + seed round
- Can demonstrate with real demo transactions if seeding blocked

---

## Appendix

### **Related Documents**
- `TECHNICAL_DECISIONS.md` - All technical choices with rationale
- `PRD_TECHNICAL.md` - Detailed technical specifications
- `DEMO_VIDEO.md` - Complete demo script with timing breakdown
- `MANUAL_SETUP.md` - Step-by-step setup for external services
- `ARCHITECTURE.md` - System design and component interactions (to be created)

### **External References**
- ChainEquity PDF: Original project specification
- Base Sepolia Documentation: https://docs.base.org
- Gnosis Safe Documentation: https://docs.safe.global
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts
- Foundry Book: https://book.getfoundry.sh
- viem Documentation: https://viem.sh

---

*End of Product Requirements Document*
