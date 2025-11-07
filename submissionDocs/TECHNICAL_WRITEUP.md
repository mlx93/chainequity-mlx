# ChainEquity - Technical Writeup

**Version**: 1.0  
**Date**: November 7, 2025  
**Project**: Tokenized Securities Prototype

---

## Chain Selection Rationale

**Selected Chain**: Base Sepolia Testnet (OP-Stack, Chain ID: 84532)

### Decision Factors

1. **OP-Stack Maturity**: Base uses Optimism's proven OP-Stack, providing EVM equivalence with no code changes needed to retarget Arbitrum or other OP-Stack chains for mainnet deployment.

2. **Gas Efficiency**: EIP-4844 blob pricing reduces L2 transaction fees to pennies (~$0.001-0.01 per transaction), making gas costs negligible for demo workload. This enables comprehensive testing without significant cost.

3. **Infrastructure Support**: Coinbase provides excellent documentation, easy faucet access, and strong third-party infrastructure support (Alchemy, QuickNode, etc.).

4. **Production Readiness**: Architecture is ready for mainnet migration without code changes. Base mainnet offers the same EVM compatibility and tooling.

5. **Fast Block Times**: ~2 second block times enable rapid transaction confirmation, meeting the "<10s after finality" requirement when interpreting finality as sequencer confirmation.

**Alternative Considered**: Ethereum Mainnet  
**Rejected Because**: High gas costs ($5-50 per transaction) would make comprehensive testing prohibitively expensive for a demo prototype.

---

## Corporate Action Implementation Approach

### Virtual Stock Split

**Implementation**: Multiplier-based approach using `splitMultiplier` state variable.

**How It Works**:
1. Contract stores `splitMultiplier` (initialized to 1)
2. All balances stored as "base" amounts in internal mapping
3. `balanceOf()` override multiplies base amount by `splitMultiplier` on read
4. `executeSplit(multiplier)` updates `splitMultiplier *= multiplier` and `totalSupply *= multiplier`

**Example**:
- Pre-split: Investor A has 1,000 base tokens, `splitMultiplier = 1` → `balanceOf()` returns 1,000
- Execute 7-for-1 split: `splitMultiplier = 7`, `totalSupply *= 7`
- Post-split: Same 1,000 base tokens, but `balanceOf()` returns 7,000 (1,000 × 7)

**Why This Approach**:
- **Gas Efficiency**: O(1) operation (~60k gas) vs O(n) traditional approach (millions of gas for 100+ holders)
- **Professional Standard**: This is how real tokenized securities implement splits at scale
- **Mathematical Accuracy**: Ownership percentages remain exactly the same
- **Scalability**: Works for any number of holders without additional gas cost

**Known Limitation**: Transfers after split must use amounts divisible by the multiplier to avoid rounding losses. Frontend can validate this client-side.

### Symbol Change

**Implementation**: Direct metadata update via mutable `symbol()` function.

**How It Works**:
1. Contract stores symbol in private state variable
2. `changeSymbol(newSymbol)` updates the state variable
3. `symbol()` view function returns current value
4. All balance queries remain unchanged

**Why This Approach**:
- Simplest implementation requiring one transaction
- Preserves all balances and ownership
- Standard capability in modern ERC-20 implementations
- No migration or wrapper complexity needed

**Known Limitation**: Block explorers may cache old symbol. Contract returns correct value, but explorer UI may lag 24-48 hours.

---

## Key Architectural Decisions

### 1. Blockchain as Source of Truth

**Decision**: All state-changing operations go through smart contracts. Database serves as read-optimized cache.

**Rationale**: 
- Ensures immutability and auditability
- Database can be reconstructed from blockchain events if lost
- Prevents data inconsistencies

**Tradeoff**: Slight delay (1-2 seconds) between blockchain state change and database update. Acceptable for cap-table use case.

### 2. Event-Driven Indexing

**Decision**: Separate indexer service listens to blockchain events and writes to PostgreSQL.

**Rationale**:
- Separates concerns: blockchain writes vs. fast queries
- Enables historical cap-table reconstruction
- Reduces RPC load on backend API

**Tradeoff**: Requires indexer to run 24/7. Mitigated by Railway's managed infrastructure.

### 3. Multi-Signature Admin Controls

**Decision**: Gnosis Safe (2-of-3) owns contract and controls all admin functions.

**Rationale**:
- Industry standard for real tokenized securities
- Demonstrates decentralization principles
- No single point of failure for administrative actions

**Tradeoff**: Admin operations require coordination between 2 signers. Acceptable for securities compliance requirements.

### 4. Allowlist Gating at Transfer Level

**Decision**: Override OpenZeppelin's `_update()` hook to check both sender and recipient approval.

**Rationale**:
- Centralized enforcement point catches all transfers, mints, and burns
- No bypass possible
- Clean integration with OpenZeppelin's ERC-20 implementation

**Tradeoff**: Burns require allowlist approval (unusual but acceptable for compliance).

---

## Known Limitations and Risks

### 1. Virtual Split Rounding Issue

**Severity**: Medium  
**Impact**: Transfers after stock split that are not divisible by the multiplier lose small amounts (up to `multiplier - 1` wei).

**Mitigation**: 
- Frontend validates transfer amounts are divisible by multiplier
- Demo uses safe transfer amounts (700, 1400, 2100, etc.)
- Production fix: Require divisibility in smart contract

**Risk Level**: Low for demo, Medium for production

### 2. Block Explorer Symbol Caching

**Severity**: Low (cosmetic)  
**Impact**: Block explorers may show outdated symbol after `changeSymbol()` call.

**Mitigation**: 
- Frontend reads symbol directly from contract
- Cache typically expires after 24-48 hours
- No functional impact

**Risk Level**: Low

### 3. Database-Blockchain Sync Delay

**Severity**: Low  
**Impact**: 1-2 second delay between blockchain state change and database update.

**Mitigation**: 
- Acceptable for cap-table use case (not high-frequency trading)
- Frontend can poll blockchain directly for critical operations
- Historical queries are eventually consistent

**Risk Level**: Low

### 4. Public RPC Rate Limiting

**Severity**: Low  
**Impact**: Public Base Sepolia RPC limited to ~100 requests/second.

**Mitigation**: 
- Database caching reduces RPC load
- Production would use private RPC provider (Alchemy, QuickNode)

**Risk Level**: Low for demo, Medium for production scale

### 5. No Security Audit

**Severity**: High (for production)  
**Impact**: Smart contracts not audited for production use.

**Mitigation**: 
- This is a technical prototype only
- Production deployment requires professional security audit
- All code is open source for review

**Risk Level**: N/A for demo, High for production

---

## Gas Report and Performance Metrics

### Gas Benchmarks (Base Sepolia)

| Operation | Gas Used | Target | Status |
|-----------|----------|--------|--------|
| Deploy Contract | 1,487,231 | <2M | ✅ |
| Approve Wallet | 48,491 | <100K | ✅ |
| Transfer (Gated) | 57,137 | <100K | ✅ |
| Stock Split | 63,719 | <200K | ✅ |
| Update Symbol | 52,485 | <100K | ✅ |
| Mint Tokens | 51,426 | <100K | ✅ |
| Burn Tokens | 30,553 | <80K | ✅ |

**All operations meet gas targets.** Virtual split implementation achieves 99%+ gas savings compared to traditional approach.

### Performance Metrics

**Transaction Confirmation**: 2-5 seconds (Base Sepolia testnet norms) ✅  
**Indexer Update Latency**: <10 seconds after block finality ✅  
**Historical Cap-Table Query**: <2 seconds for up to 1000 transactions ✅  
**Frontend Load Time**: <3 seconds on standard broadband ✅

---

## Test Results

### Foundry Contract Tests (10/10 Passing)

| Test | Description | Status |
|------|-------------|--------|
| testApproveMintVerifyBalance | Approve wallet → Mint tokens → Verify balance | ✅ PASS |
| testTransferBetweenApprovedWallets | Transfer between two approved wallets | ✅ PASS |
| testTransferToUnapprovedReverts | Transfer to non-approved wallet → REVERT | ✅ PASS |
| testTransferFromUnapprovedReverts | Transfer from non-approved wallet → REVERT | ✅ PASS |
| testRevokeApprovalPreventsReceiving | Revoke approval → Cannot receive | ✅ PASS |
| testStockSplit7For1 | Execute 7-for-1 split → Balances multiply | ✅ PASS |
| testChangeSymbol | Change symbol → Metadata updates | ✅ PASS |
| testUnauthorizedAdminActionReverts | Unauthorized admin action → REVERT | ✅ PASS |
| testBurnFromApprovedWallet | Burn tokens from approved wallet | ✅ PASS |
| testEdgeCases | Zero amounts, self-transfer, multiple splits | ✅ PASS |

**Coverage**: All public functions tested, edge cases covered, gas benchmarks recorded.

### Manual Integration Tests (7/7 Passing)

| Test | Description | Status |
|------|-------------|--------|
| Test 1 | Mint tokens to approved wallet | ✅ PASS |
| Test 2 | Transfer between approved wallets | ✅ PASS |
| Test 3 | Transfer to non-approved wallet (blocked) | ✅ PASS |
| Test 4 | Approve new wallet → Transfer succeeds | ✅ PASS |
| Test 5 | Execute 7-for-1 stock split | ✅ PASS |
| Test 6 | Change ticker symbol | ✅ PASS |
| Test 7 | Export cap-table at specific block | ✅ PASS |

**All required demo scenarios passing.**

---

## Deployment Addresses

### Base Sepolia Testnet

**Smart Contract**:
- Address: `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964`
- Network: Base Sepolia (Chain ID: 84532)
- Deployment Block: `33313307`
- Explorer: https://sepolia.basescan.org/address/0xFCc9E74019a2be5808d63A941a84dEbE0fC39964

**Gnosis Safe**:
- Address: `0x6264F29968e8fd2810cB79fb806aC65dAf9db73d`
- Threshold: 2-of-3 signers
- Interface: https://app.safe.global

**Backend API**:
- URL: https://tender-achievement-production-3aa5.up.railway.app/api
- Health Check: https://tender-achievement-production-3aa5.up.railway.app/api/health

**Frontend**:
- URL: https://chainequity-mlx.vercel.app/

### Test Wallets

- Admin: `0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6`
- Investor A: `0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e`
- Investor B: `0xefd94a1534959e04630899abdd5d768601f4af5b`

---

## Reproducible Setup Scripts

### Prerequisites

1. **Foundry** (for contracts):
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Node.js** v18+ (for backend/indexer/frontend):
   ```bash
   node --version  # Should be >= 18
   ```

3. **MetaMask** browser extension

### Local Development Setup

**1. Clone Repository**:
```bash
git clone https://github.com/mlx93/chainequity-mlx.git
cd chainequity-mlx
```

**2. Install Dependencies**:
```bash
# Contracts
cd contracts
forge install
cd ..

# Indexer
cd indexer
npm install
cd ..

# Backend
cd backend
npm install
cd ..

# Frontend
cd ui
npm install
cd ..
```

**3. Configure Environment Variables**:
```bash
# Copy example files (if they exist)
cp contracts/.env.example contracts/.env
cp indexer/.env.example indexer/.env
cp backend/.env.example backend/.env
cp ui/.env.example ui/.env

# Fill in with your values (see wallet-addresses.txt for testnet addresses)
```

**4. Run Services**:

**Contracts** (compile & test):
```bash
cd contracts
forge build
forge test
forge test --gas-report
```

**Indexer** (local development):
```bash
cd indexer
npm run dev  # Requires DATABASE_URL_PUBLIC in .env
```

**Backend** (local development):
```bash
cd backend
npm run dev  # Requires DATABASE_URL_PUBLIC and blockchain config in .env
```

**Frontend** (local development):
```bash
cd ui
npm run dev  # Starts Vite dev server at http://localhost:5173
```

### Deployment Scripts

**Deploy Contract**:
```bash
cd contracts
forge script script/Deploy.s.sol \
    --rpc-url $BASE_SEPOLIA_RPC \
    --broadcast \
    --verify \
    --etherscan-api-key $BASESCAN_API_KEY
```

**Deploy to Railway** (indexer/backend):
```bash
# From project root
railway up  # Deploys from current directory
# Or push to GitHub triggers auto-deploy
git push origin main
```

**Deploy to Vercel** (frontend):
```bash
cd ui
vercel --prod
# Or push to GitHub triggers auto-deploy
git push origin main
```

### Verification

**Check Contract Deployment**:
```bash
cast call 0xFCc9E74019a2be5808d63A941a84dEbE0fC39964 "symbol()" --rpc-url $BASE_SEPOLIA_RPC
# Should return: "ACME"
```

**Check Backend Health**:
```bash
curl https://tender-achievement-production-3aa5.up.railway.app/api/health
# Should return: {"status":"ok",...}
```

**Check Frontend**:
- Visit: https://chainequity-mlx.vercel.app/
- Connect MetaMask to Base Sepolia
- Verify wallet connection works

---

## Disclaimer

**⚠️ IMPORTANT: This is a technical prototype demonstration only.**

This software is NOT regulatory-compliant and should NOT be used for real securities issuance without:
- Professional legal review
- Regulatory compliance verification (Reg D, Reg S, Reg A+, etc.)
- Security audit by qualified auditors
- KYC/AML integration
- Accredited investor verification
- Transfer restrictions by jurisdiction
- Lock-up periods and vesting schedules

**Use at your own risk. The authors assume no liability for any use of this software.**

---

*Last Updated: November 7, 2025*

