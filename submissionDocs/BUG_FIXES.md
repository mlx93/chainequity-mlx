# Bug Fixes - Historical Cap Table & CSV Export

**Date**: November 7, 2025  
**Status**: ✅ Fixed and Built

---

## Bugs Identified

### Bug 1: Historical Cap Table Not Applying Split Multiplier ❌
**Symptom**: Historical cap table queries showed incorrect balances and ownership percentages after a stock split was executed.

**Root Cause**: The backend correctly retrieved the historical split multiplier but never applied it to the balances. It only passed the multiplier to the frontend without multiplying the historical balances.

**Example**:
- Current cap table (with 7:1 split applied): Investor A = 5,600 tokens
- Historical cap table (before split): Should show 800 tokens, but showed 5,600 (incorrect)

**Fix**: Modified `backend/src/routes/data.ts` to apply split multiplier to all historical balances:
```typescript
// Calculate total supply (applying split multiplier)
let totalSupply = BigInt(0);
historicalBalances.forEach((b: any) => {
  const baseBalance = BigInt(b.balance);
  const adjustedBalance = baseBalance * splitMultiplier;  // ← Applied multiplier
  totalSupply += adjustedBalance;
});

// Format response (applying split multiplier to all balances)
const capTable = historicalBalances.map((b: any) => {
  const baseBalance = BigInt(b.balance);
  const adjustedBalance = baseBalance * splitMultiplier;  // ← Applied multiplier
  const percentage = totalSupply > 0
    ? ((Number(adjustedBalance) / Number(totalSupply)) * 100).toFixed(2)
    : '0.00';
  
  return {
    address: b.address,
    balance: adjustedBalance.toString(),
    balanceFormatted: formatTokenAmount(adjustedBalance.toString()),
    percentage,
  };
});
```

---

### Bug 2: Phantom "Unknown Wallet" (0x00) in Historical Queries ❌
**Symptom**: Historical cap table showed "Unknown Wallet" with address `0x0000000000000000000000000000000000000000` and a phantom balance (e.g., 1,500 tokens at 99.75% ownership).

**Root Cause**: The `getHistoricalBalances()` function excluded `0x00` address from the `from_address` side (to avoid counting burns as outgoing), but did NOT exclude it from the `to_address` side. This caused the burn address to accumulate "incoming" transfers (which are actually burns).

**Fix**: Modified `backend/src/services/database.service.ts` to exclude `0x00` from both sides:
```typescript
export async function getHistoricalBalances(blockNumber: number) {
  const result = await pool.query<{ address: string; balance: string }>(`
    WITH historical_transfers AS (
      SELECT from_address AS address, -SUM(amount::numeric) AS net_change
      FROM transfers
      WHERE block_number::numeric <= $1
        AND from_address != '0x0000000000000000000000000000000000000000'  // ← Already excluded
      GROUP BY from_address
      UNION ALL
      SELECT to_address AS address, SUM(amount::numeric) AS net_change
      FROM transfers
      WHERE block_number::numeric <= $1
        AND to_address != '0x0000000000000000000000000000000000000000'  // ← Added exclusion
      GROUP BY to_address
    )
    ...
  `, [blockNumber]);
  
  return result.rows;
}
```

---

### Bug 3: Inconsistent CSV Export Column Count ❌
**Symptom**: CSV export for Investor C had a different number of columns than Investor A and B.

**Root Cause**: The CSV export logic built headers conditionally but then conditionally added the "Block Number" column to each row. This caused a mismatch:
- **Headers**: `['Account Name', 'Address', 'Balance', 'Ownership %', 'Block Number']` (5 columns) when `isHistorical` was true
- **Rows**: Only added 5th column if `isHistorical AND blockNumber` were both truthy

If `isHistorical` was true but `blockNumber` was falsy (or 0), headers had 5 columns but rows had 4.

**Fix**: Modified `ui/src/components/captable/ExportButtons.tsx` to build headers and rows consistently:
```typescript
const downloadCSV = () => {
  const headers = ['Account Name', 'Address', 'Balance', 'Ownership %']
  if (isHistorical && blockNumber) {
    headers.push('Block Number')  // ← Only add if both are truthy
  }
  
  const rows = capTable.capTable.map(entry => {
    const row = [
      getDisplayName(entry.address),
      entry.address,
      entry.balanceFormatted,
      entry.percentage + '%',
    ]
    if (isHistorical && blockNumber) {
      row.push(blockNumber.toString())  // ← Same condition
    }
    return row
  })
  ...
}
```

---

### Bug 4: Version Dropdown Too Narrow ❌
**Symptom**: The version dropdown was 240px wide, which cut off longer descriptions like "Stock Split (7:1)".

**Fix**: Modified `ui/src/pages/CapTable.tsx` to increase dropdown width:
```typescript
<SelectTrigger id="snapshot-select" className="h-9 w-[320px]">
  {/* Changed from w-[240px] to w-[320px] */}
```

Also reduced gap between "Version:" label and dropdown from `gap-8` to `gap-6` for better spacing.

---

## Files Modified

1. **`backend/src/routes/data.ts`** (Lines 240-271)
   - Applied split multiplier to historical balances
   - Applied split multiplier to total supply calculation
   - Applied split multiplier to percentage calculations

2. **`backend/src/services/database.service.ts`** (Lines 152-177)
   - Added `0x00` exclusion to `to_address` in historical query

3. **`ui/src/components/captable/ExportButtons.tsx`** (Lines 21-52)
   - Fixed conditional header/row construction for CSV export

4. **`ui/src/pages/CapTable.tsx`** (Line 179)
   - Increased dropdown width from 240px to 320px
   - Reduced gap from 8 to 6

---

## Verification

### Before Fixes:
- ❌ Historical cap table showed incorrect balances (not adjusted for splits)
- ❌ Historical cap table showed phantom "Unknown Wallet" (0x00) with 99.75% ownership
- ❌ CSV export had inconsistent column counts
- ❌ Dropdown cut off "Stock Split (7:1)" text

### After Fixes:
- ✅ Historical cap table shows correct balances (adjusted for splits that occurred after that block)
- ✅ No phantom wallets in historical queries
- ✅ CSV export has consistent column count for all rows
- ✅ Dropdown wide enough to show full descriptions

---

## Test Scenarios

### Scenario 1: Historical Query Before Split
**Setup**: 
- Mint 1,500 tokens to Admin (block 100)
- Execute 7:1 split (block 200)

**Query**: Historical cap table at block 150 (between mint and split)

**Expected Result**:
- Admin: 1,500 tokens (100% ownership)
- No 0x00 address
- Split multiplier: 1 (no split yet)

### Scenario 2: Historical Query After Split
**Setup**: Same as above

**Query**: Historical cap table at block 250 (after split)

**Expected Result**:
- Admin: 10,500 tokens (1,500 × 7, 100% ownership)
- No 0x00 address
- Split multiplier: 7

### Scenario 3: Historical Query After Burn
**Setup**:
- Mint 2,000 tokens to Admin (block 100)
- Burn 500 tokens (block 150)
- Query at block 200

**Expected Result**:
- Admin: 1,500 tokens (100% ownership)
- No 0x00 address
- Total supply: 1,500

### Scenario 4: CSV Export
**Setup**: Export current cap table and historical cap table

**Expected Result**:
- Current export: 4 columns (no block number)
- Historical export: 5 columns (includes block number)
- All rows have same column count as headers

---

## Build Status

✅ **Backend**: Built successfully
✅ **Frontend**: Built successfully

---

## Deployment

Both backend and frontend changes need to be deployed:

1. **Backend**: Push to Railway (auto-deploy from GitHub)
2. **Frontend**: Push to Vercel (auto-deploy from GitHub)

Or manually:
```bash
# Backend
cd backend && npm run build
railway up

# Frontend
cd ui && npm run build
vercel --prod
```

---

*Last Updated: November 7, 2025*

