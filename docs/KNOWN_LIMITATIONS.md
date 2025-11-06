# ChainEquity - Known Limitations & Future Enhancements

This document tracks known limitations in the current Phase 1 implementation and proposed enhancements for future versions.

---

## Phase 1 Smart Contract Limitations

### 1. Virtual Split Rounding Issue

**Component**: `GatedToken.sol` - Stock split feature  
**Severity**: Medium  
**Status**: Known limitation, deferred to post-demo / Phase 2

#### Description

After executing a stock split (e.g., 7-for-1), token transfers that are not evenly divisible by the split multiplier will lose small amounts due to integer division rounding.

#### Technical Details

```solidity
// In _update() function
uint256 baseAmount = amount / splitMultiplier;  // Integer division rounds down
```

**Example**:
- User has 7,000 tokens after 7-for-1 split (1,000 base × 7)
- User transfers 1,000 tokens
- Calculation: `1,000 / 7 = 142.857...` → rounds to `142` base tokens
- Actual transfer: `142 × 7 = 994` tokens
- **Result**: 6 tokens lost to rounding

#### Impact

- **Magnitude**: Maximum loss = `(splitMultiplier - 1)` wei per transfer
  - 7-for-1 split: up to 6 wei lost
  - 2-for-1 split: up to 1 wei lost
- **Frequency**: Only affects transfers of amounts NOT divisible by the multiplier
- **Cumulative**: Multiple transfers can compound the rounding loss

#### Workaround (Current)

**For demos and testing**:
- Use transfer amounts divisible by the split multiplier
- Examples after 7-for-1 split: 700, 1400, 2100, 3500, 7000, 14000, 21000

**For production frontends**:
- Display warning when user enters non-divisible amount
- Auto-round to nearest valid amount
- Show "You will transfer approximately X tokens" with actual amount

#### Proposed Fixes (Choose One)

**Option A: Require Divisibility** (Recommended)
```solidity
if (amount % splitMultiplier != 0) {
    revert AmountNotDivisibleBySplitMultiplier();
}
```
- **Pros**: Clean, predictable, no token loss
- **Cons**: Slight UX friction (frontend handles easily)

**Option B: Transparent Rounding**
```solidity
uint256 baseAmount = amount / splitMultiplier;
uint256 actualAmount = baseAmount * splitMultiplier;
emit TransferAdjusted(from, to, amount, actualAmount);
```
- **Pros**: Flexible transfers
- **Cons**: Confusing UX, users lose tokens unpredictably

**Option C: Base Unit Transfers**
- Keep transfers in base amounts (don't multiply)
- **Pros**: No rounding ever
- **Cons**: Very confusing UX (balance shows 7000, transfer in units of base)

#### Timeline

- **Phase 1**: Document limitation, use workaround in demo
- **Phase 2**: Frontend implements divisibility validation
- **Phase 3 / v2 Contract**: Implement Option A for production deployment

---

### 2. Block Explorer Symbol Caching

**Component**: `GatedToken.sol` - `changeSymbol()` function  
**Severity**: Low (cosmetic)  
**Status**: Documented, no fix needed

#### Description

After calling `changeSymbol()` to update the token symbol (e.g., from "ACME" to "ACMEX"), block explorers like Basescan may continue to display the old symbol due to metadata caching.

#### Impact

- Block explorer shows outdated symbol
- Contract's `symbol()` function returns correct new symbol
- Wallets and dApps reading directly from contract see correct symbol
- No impact on functionality or balances

#### Workaround

- Frontend reads symbol directly from contract (not from block explorer)
- Users can manually request metadata refresh from block explorer support
- Cache typically expires after 24-48 hours

#### Not a Bug

This is expected behavior. Block explorers cache metadata at deployment to reduce RPC calls. Most projects accept this limitation as the tradeoff for having mutable metadata.

---

### 3. Contract Verification API Key

**Component**: Deployment script  
**Severity**: Low  
**Status**: Resolved (manual verification possible)

#### Description

Automated contract verification during deployment failed due to missing Basescan API key.

#### Impact

- Contract deployed successfully ✅
- Source code not auto-verified on Basescan
- Manual verification possible via Basescan UI

#### Resolution

Contract can be manually verified at any time using:
```bash
forge verify-contract 0xFCc9E74019a2be5808d63A941a84dEbE0fC39964 \
    src/GatedToken.sol:GatedToken \
    --chain-id 84532 \
    --constructor-args $(cast abi-encode "constructor(string,string,address)" \
        "ACME Corp Equity" "ACME" "0x6264F29968e8fd2810cB79fb806aC65dAf9db73d") \
    --etherscan-api-key <YOUR_KEY>
```

Or via Basescan UI with flatten file.

---

## Future Enhancements (Not Limitations)

### 1. Batch Operations

**Description**: Add ability to approve/revoke multiple wallets in a single transaction  
**Benefit**: Reduce gas costs for onboarding multiple investors  
**Priority**: Low (nice-to-have)

### 2. Allowlist Management Events

**Description**: Add more detailed events for bulk operations  
**Benefit**: Better indexer efficiency  
**Priority**: Low

### 3. Emergency Pause

**Description**: Add pausable functionality for emergency situations  
**Benefit**: Additional safety mechanism  
**Priority**: Low (conflicts with immutability goal)  
**Note**: Deliberately excluded from Phase 1 to maintain simplicity

### 4. Token Recovery

**Description**: Add function to recover tokens accidentally sent to contract  
**Benefit**: Prevent permanent loss if users send tokens to contract address  
**Priority**: Low

---

## Testing Coverage

All known limitations have been documented in tests:

- ✅ Rounding behavior tested in `testStockSplit7For1()`
- ✅ Symbol change tested in `testChangeSymbol()`
- ✅ Edge cases covered in `testEdgeCases()`

---

## References

- Phase 1 Completion Report: `PHASE1_COMPLETION_REPORT.md`
- Test Suite: `contracts/test/GatedToken.t.sol`
- Contract Source: `contracts/src/GatedToken.sol`
- Demo Script: `DEMO_VIDEO.md` (includes safe transfer amounts)

---

**Last Updated**: November 6, 2025  
**Version**: Phase 1 (v1.0)  
**Maintainer**: Contract Specialist Team

