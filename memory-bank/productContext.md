# ChainEquity - Product Context

## Problem Being Solved
Traditional securities (company stock) are managed through centralized intermediaries with slow settlement, limited transparency, and high operational overhead. ChainEquity demonstrates how blockchain technology can provide:
- **Instant settlement** (vs. T+2 traditional settlement)
- **24/7 accessibility** (vs. business hours only)
- **Transparent ownership records** (blockchain as source of truth)
- **Automated compliance** (smart contract enforced allowlist)
- **Efficient corporate actions** (virtual stock splits without reissuing certificates)

## User Experience Goals

### For Company Administrators (via Gnosis Safe)
- Approve/revoke investor wallets for token holding
- Execute stock splits without modifying all balances
- Update token symbol to reflect company name changes
- Mint new tokens for fundraising
- Burn tokens for buybacks
- All admin actions require multi-signature approval (2-of-3)

### For Investors
- View real-time cap table showing all shareholders
- View personal token balance and transaction history
- Transfer tokens to other approved wallets
- See historical corporate actions (splits, symbol changes)
- MetaMask-based authentication (no passwords)

### For Observers (Demo Audience)
- Understand the allowlist gating mechanism (only approved wallets can hold tokens)
- See how stock splits work without gas-intensive balance updates
- Observe Gnosis Safe multi-sig controlling admin functions
- View complete cap table derived from blockchain events

## Key Features

### 1. Gated Token Transfers
Only wallets explicitly approved by administrators can receive tokens. Transfer attempts to non-approved addresses are automatically rejected by the smart contract.

**Why**: Securities regulations require issuers to control who can hold their securities (accredited investors, compliance checks, etc.)

### 2. Virtual Stock Split
A 2:1 stock split is implemented by setting a multiplier variable rather than updating every holder's balance. All balance queries multiply the base balance by the split multiplier.

**Why**: Traditional stock splits require updating every shareholder's record. On blockchain, this would cost hundreds/thousands of dollars in gas fees. Virtual splits achieve the same economic outcome with a single state variable update.

### 3. Mutable Token Symbol
The token symbol (ticker) can be changed by administrators to reflect company rebrands or name changes (e.g., "CHAINEQUITY-A" → "CHAINEQUITY-B").

**Why**: Companies rebrand, merge, or restructure. The token symbol should reflect the current company identity. Note: Block explorers may cache the old symbol and require manual update requests.

### 4. Cap Table Management
The system provides real-time and historical cap tables showing:
- All token holders and their balances
- Transfer history with timestamps
- Corporate action history
- Wallet approval status

**Why**: Investors and administrators need transparency into ownership structure. Traditional cap tables are manually maintained spreadsheets prone to errors. Blockchain provides a single source of truth.

### 5. Multi-Signature Administration
All administrative functions (approve wallet, stock split, symbol change, mint, burn) are controlled by a Gnosis Safe requiring 2-of-3 signatures.

**Why**: Securities issuance requires strong controls. No single person should have unilateral control over token supply or compliance settings.

## How It Should Work

### Typical User Flow: Token Transfer
1. Investor A (approved wallet) wants to send 1000 tokens to Investor B
2. Investor A checks if Investor B is approved using the frontend
3. If not approved, Investor A requests admin to approve Investor B's wallet
4. Admin initiates wallet approval via Gnosis Safe
5. Two Safe signers approve the transaction
6. Gnosis Safe executes `approveWallet(Investor_B_address)` on the contract
7. Investor A initiates transfer of 1000 tokens to Investor B
8. Smart contract verifies Investor B is approved and allows the transfer
9. Transfer event is emitted on blockchain
10. Indexer detects Transfer event and updates database
11. Backend API reflects updated balances
12. Frontend shows updated cap table

### Typical Admin Flow: Stock Split
1. Company decides to execute 2:1 stock split
2. Admin proposes transaction to Gnosis Safe: `executeStockSplit(2)`
3. Two Safe signers review and approve
4. Gnosis Safe executes the transaction
5. Smart contract sets splitMultiplier = 2
6. All `balanceOf()` queries now return 2x the base balance
7. StockSplit event emitted
8. Indexer detects event and records corporate action
9. Frontend displays banner: "2:1 Stock Split executed on [date]"
10. Cap table shows doubled balances for all holders

## Success Metrics (Demo)
- ✅ Successfully execute a gated transfer between approved wallets
- ✅ Demonstrate transfer rejection to non-approved wallet
- ✅ Execute 2:1 stock split via Gnosis Safe
- ✅ Show cap table before/after split
- ✅ Update token symbol via Gnosis Safe
- ✅ Show real-time cap table synced from blockchain
- ✅ All admin operations require multi-sig approval

