# Phase 4 UI Testing - Issues & Fixes

## Issues Discovered

### 1. ✅ **FIXED**: Non-Admin Users See Dashboard by Default
**Problem**: When Investor A or Investor B connects, they see the Dashboard page first (which shows nothing since it's hidden for non-admins), instead of being redirected to the Investor page.

**Expected**: 
- Admin connects → Dashboard page
- Investor connects → Investor page

**Fix**: Updated `ui/src/App.tsx` to add route-based redirects based on admin status.

```typescript
// Non-admin users connecting to root "/" get redirected to "/investor"
<Route path="/" element={isAdmin ? <Dashboard /> : <Navigate to="/investor" replace />} />
```

**Status**: ✅ Code updated, awaiting deployment

---

### 2. 🐛 **CRITICAL**: Database Showing 2x Actual Token Balances
**Problem**: The cap-table and dashboard show incorrect data:

| Source | Investor A Balance | Investor B Balance | Total Supply |
|--------|-------------------|-------------------|--------------|
| **Blockchain (Truth)** | 1100 | 400 | 1500 |
| **Database (Wrong)** | 2200 | 800 | 3000 |
| **Frontend Display** | 1100 ✅ | Shows 2200 on cap-table ❌ | Shows 3000 ❌ |

**Root Cause**: The indexer processed the backfill twice when it was restarted after contract redeployment. The balance update logic adds to existing balances, so running backfill twice doubled everything.

**Evidence**:
```bash
# Blockchain truth (via cast):
cast call 0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e "totalSupply()(uint256)" --rpc-url https://sepolia.base.org
# Returns: 1500000000000000000000 (1500 tokens)

cast call 0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e "balanceOf(address)(uint256)" 0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e --rpc-url https://sepolia.base.org
# Returns: 1100000000000000000000 (1100 tokens)

cast call 0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e "balanceOf(address)(uint256)" 0xefd94a1534959e04630899abdd5d768601f4af5b --rpc-url https://sepolia.base.org  
# Returns: 400000000000000000000 (400 tokens)

# Database (via API):
curl -s "https://tender-achievement-production-3aa5.up.railway.app/api/cap-table" | jq
# Shows: Investor A: 2200, Investor B: 800, Total: 3000 (all 2x actual)
```

**Fix Options**:

**Option A: Reset Database and Re-Index (RECOMMENDED)**
1. Access Railway PostgreSQL database
2. Delete all records from `balances` table:
   ```sql
   DELETE FROM balances;
   ```
3. Restart the indexer service on Railway
4. Indexer will re-backfill from START_BLOCK with correct values

**Option B: Manual Correction (Quick Fix)**
```sql
UPDATE balances SET balance = (balance::numeric / 2)::text WHERE address IN (
  '0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e',
  '0xefd94a1534959e04630899abdd5d768601f4af5b'
);
```

**Status**: 🐛 Needs database reset on Railway

---

### 3. 🐛 **MINOR**: Block Number Shows "N/A"
**Problem**: The Dashboard and Cap Table pages show "N/A" for current block number.

**Root Cause**: The `/api/cap-table` endpoint doesn't return a `blockNumber` field.

**Fix**: Update `backend/src/routes/data.ts` to include current block number in response:

```typescript
// In the /api/cap-table route handler
const blockNumber = await publicClient.getBlockNumber();

res.json({
  capTable,
  totalSupply: totalSupply.toString(),
  totalHolders: capTable.length,
  blockNumber: Number(blockNumber),  // Add this
  timestamp: new Date().toISOString(),
});
```

**Status**: 🔧 Needs code update

---

## Summary of Required Actions

### Immediate (Blocking Demo):
1. ✅ Deploy frontend fix for admin routing (`ui/src/App.tsx`)
2. 🐛 **CRITICAL**: Reset indexer database to fix 2x balances
   - Option: SSH into Railway PostgreSQL
   - Run: `DELETE FROM balances;`
   - Restart indexer service

### Nice-to-Have (Non-Blocking):
3. 🔧 Add block number to cap-table API response

---

## Test Results After Fixes

Once the database is reset, expected results:
- ✅ Total Supply: 1500 tokens
- ✅ Investor A: 1100 tokens (73.33%)
- ✅ Investor B: 400 tokens (26.67%)
- ✅ Cap Table matches blockchain
- ✅ Dashboard shows correct stats
- ✅ Non-admin users land on Investor page
- ✅ Block number displays correctly

---

*Created: 2025-11-06*
*Phase: 4 - Integration & Testing*

