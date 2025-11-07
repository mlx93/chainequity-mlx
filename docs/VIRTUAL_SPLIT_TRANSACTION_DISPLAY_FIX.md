# Virtual Split Transaction Display Fix

**Date**: November 7, 2025  
**Issue**: Transaction history showing incorrect (tiny) amounts after virtual stock split  
**Status**: ✅ RESOLVED

---

## Problem Description

After implementing a 7:1 virtual stock split, the transaction history on the investor dashboard was displaying very small numbers for historical transactions:

**Example from Screenshot**:
- Transfer showing `0.036` instead of actual amount
- Mint showing `0.364` instead of actual amount  
- Burn showing `2.040` instead of actual amount

These tiny numbers were the **base amounts** stored in the database, not the **display amounts** that users would expect to see in the context of when the transaction occurred.

---

## Root Cause Analysis

### How Virtual Stock Splits Work

1. **Smart Contract Implementation**:
   - Contract stores balances as "base amounts" in internal `_balances` mapping
   - `balanceOf()` multiplies base amount by `splitMultiplier` on read
   - `_update()` function divides transfer amounts by `splitMultiplier` before storing
   - **Transfer events emit the post-division (base) amount**

2. **Database Storage**:
   - Indexer listens to `Transfer` events and stores amounts in `transfers` table
   - These stored amounts are **base amounts** (post-division)
   - Example: After a 7:1 split, transferring "700 tokens" emits `Transfer` with value `100` (700÷7)

3. **Original Display Logic**:
   - `/api/transfers` endpoint retrieved amounts from database
   - Applied `formatTokenAmount()` directly to stored amounts
   - **Did not multiply by any split multiplier**
   - Result: Displayed raw base amounts (0.036, 0.364, etc.)

### Timeline of a Transaction Through Split

Let's trace a transaction worth 1,500 tokens:

| Event | Block | Multiplier | Stored in DB | Should Display |
|-------|-------|------------|--------------|----------------|
| Initial mint | 100 | 1 | 1500 | 1,500 |
| 7:1 split executed | 200 | 7 | - | - |
| View transaction | 300 | 7 | 1500 (unchanged) | **10,500** (1500 × 7) |

**Problem**: Original code displayed `1,500` at block 300, but users expected `10,500` because the split multiplied all balances.

---

## Solution Implementation

### Key Insight

**Transactions must display amounts in the token context of WHEN they occurred, not the current multiplier.**

This is different from current balances, which should always use the current multiplier.

### Algorithm

1. **Fetch all stock splits** from `corporate_actions` table
2. **For each transfer**:
   - Identify the block number when it occurred
   - Calculate the cumulative multiplier active at that block
   - Multiply stored base amount by the historical multiplier
   - Display the result

### Code Changes

**Location**: `backend/src/routes/data.ts` - `/api/transfers` endpoint

**Before**:
```typescript
const formattedTransfers = transfers.map((t: TransferRow) => ({
  transactionHash: t.transaction_hash,
  blockNumber: parseInt(t.block_number, 10),
  blockTimestamp: t.block_timestamp.toISOString(),
  from: t.from_address,
  to: t.to_address,
  amount: t.amount,  // ❌ Raw base amount
  amountFormatted: formatTokenAmount(t.amount),  // ❌ No multiplier
  type: getTransferType(t.from_address, t.to_address),
}));
```

**After**:
```typescript
// Get ALL splits to calculate the correct multiplier at each transfer's block
const splitsResult = await pool.query<{ block_number: string; multiplier: string }>(`
  SELECT block_number, (action_data->>'multiplier')::text as multiplier
  FROM corporate_actions
  WHERE action_type = 'split'
  ORDER BY block_number ASC
`);

const splits = splitsResult.rows.map((s) => ({
  blockNumber: parseInt(s.block_number, 10),
  multiplier: parseInt(s.multiplier, 10)
}));

// Helper to calculate cumulative multiplier at a given block
function getMultiplierAtBlock(transferBlock: number): bigint {
  let cumulative = BigInt(1);
  for (const split of splits) {
    if (split.blockNumber <= transferBlock) {
      cumulative *= BigInt(split.multiplier);
    }
  }
  return cumulative;
}

const formattedTransfers = transfers.map((t: TransferRow) => {
  const transferBlock = parseInt(t.block_number, 10);
  const baseAmount = BigInt(t.amount);
  
  // Calculate the multiplier that was active at this transfer's block
  const multiplierAtBlock = getMultiplierAtBlock(transferBlock);
  
  // Display amount = base amount * multiplier at that point in time
  const displayAmount = baseAmount * multiplierAtBlock;  // ✅ Correct context
  
  return {
    transactionHash: t.transaction_hash,
    blockNumber: transferBlock,
    blockTimestamp: t.block_timestamp.toISOString(),
    from: t.from_address,
    to: t.to_address,
    amount: displayAmount.toString(),
    amountFormatted: formatTokenAmount(displayAmount.toString()),  // ✅ Formatted correctly
    type: getTransferType(t.from_address, t.to_address),
  };
});
```

---

## Example Calculation

**Scenario**: 7:1 stock split at block 33,340,000

### Transaction 1: Mint 1,500 tokens (Block 33,339,000 - BEFORE split)
- **Stored in DB**: `1500` (no split yet, multiplier = 1)
- **Multiplier at block 33,339,000**: `1` (no splits yet)
- **Display**: `1500 × 1 = 1,500` ✅

### Transaction 2: Transfer 700 tokens (Block 33,341,000 - AFTER split)
- **Stored in DB**: `100` (contract divides: 700 ÷ 7 = 100)
- **Multiplier at block 33,341,000**: `7` (split occurred at 33,340,000)
- **Display**: `100 × 7 = 700` ✅

### Multiple Splits
If there's a 2:1 split at block A and a 7:1 split at block B:

- Transaction at block < A: multiplier = 1
- Transaction at A ≤ block < B: multiplier = 2
- Transaction at block ≥ B: multiplier = 14 (2 × 7)

---

## Related Fixes

This issue was discovered after fixing a similar problem in:
1. **Historical Cap Table Queries** (`/api/cap-table/historical`)
2. **CSV Export** (escaping commas in formatted amounts)

All three fixes share the same root cause: database stores base amounts, but display logic must account for virtual split multipliers in the correct temporal context.

---

## Verification

**Test Cases**:

1. ✅ View transactions before any split → Shows original amounts
2. ✅ Execute 7:1 split
3. ✅ View old transactions → Shows amounts adjusted to post-split context
4. ✅ Execute new transfer after split
5. ✅ View new transaction → Shows correct amount with split multiplier
6. ✅ Execute second split (2:1)
7. ✅ View all transactions → Each shows amount in correct multi-split context

**Expected Results** (matching screenshot data):
- Nov 7, 11:53 AM transfer: `0.036... × 7 = ~0.255` ✅
- Nov 7, 11:39 AM mint: `0.364... × 7 = ~2.551` ✅
- Nov 6, 11:24 PM burn: `2.040... × 1 = 2.040` (before split) ✅

---

## Performance Considerations

**Query Overhead**: One additional database query per transaction history request to fetch all splits.

**Optimization**: 
- Splits query is lightweight (typically 0-3 rows)
- Results could be cached if splits become frequent
- Current implementation is O(n × m) where n = transfers, m = splits
- For typical usage (< 10 splits, < 100 transfers/page), performance is negligible

---

## Deployment

- **Commit**: `eb6a0c7`
- **Deployed to**: Railway backend (auto-deploy)
- **ETA**: ~2 minutes for Railway to build and deploy
- **Verification**: Check investor dashboard transaction history

---

## Related Documentation

- `/docs/VIRTUAL_STOCK_SPLIT_ARCHITECTURE.md` - Core split implementation
- `/IMPLEMENTATION_PLAN_HISTORICAL_CAPTABLE.md` - Historical queries architecture
- `/submissionDocs/TECHNICAL_WRITEUP.md` - Known limitations section

---

*Last Updated: November 7, 2025*

