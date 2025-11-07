# Implementation Plan: Historical Cap Table & Transaction Pagination

**Date**: November 7, 2025  
**Status**: Ready for Implementation  
**Estimated Time**: 3-4 hours

---

## Overview

This document outlines the implementation plan for two remaining features required by the PRDs:

1. **Historical Cap Table Queries** (US-4.3, FR-3.4, FR-4.11, NFR-4)
2. **Transaction Pagination** (15+ transactions)

These are the final features needed to complete the ChainEquity prototype per the original specifications.

---

## Feature 1: Historical Cap Table Queries

### Goal
Enable admins and auditors to view the cap table as it existed at any historical block number.

### Requirements (from PRDs)
- **US-4.3**: "As an admin or auditor, I can query historical cap-table at any specific block so I can audit past ownership"
- **FR-3.4**: "Indexer MUST generate 'as-of block' snapshots for historical queries"
- **FR-4.11**: "UI MUST support historical cap-table queries by block number"
- **NFR-4**: "Historical cap-table queries MUST complete within 2 seconds for up to 1000 transactions"

### Implementation Steps

#### Step 1: Backend API Endpoint
**File**: `/backend/src/routes/data.ts`

**New Endpoint**: `GET /api/cap-table/historical?blockNumber=<number>`

**Logic**:
1. Accept `blockNumber` query parameter (validate as positive integer)
2. Query transfers table: `WHERE block_number <= :blockNumber`
3. Reconstruct balances from historical transfers:
   ```sql
   WITH historical_transfers AS (
       SELECT from_address AS address, -SUM(amount) AS net_change
       FROM transfers
       WHERE block_number <= :blockNumber 
         AND from_address != '0x0000000000000000000000000000000000000000'
       GROUP BY from_address
       UNION ALL
       SELECT to_address AS address, SUM(amount) AS net_change
       FROM transfers
       WHERE block_number <= :blockNumber
       GROUP BY to_address
   )
   SELECT 
       address,
       SUM(net_change) AS balance
   FROM historical_transfers
   GROUP BY address
   HAVING SUM(net_change) > 0
   ORDER BY balance DESC;
   ```
4. Query `corporate_actions` table to find if stock split occurred before `blockNumber`
5. If split exists and `block_number <= :blockNumber`, apply `splitMultiplier` to all balances
6. Calculate ownership percentages: `(balance / totalSupply) * 100`
7. Query block timestamp from `transfers` table: `SELECT block_timestamp FROM transfers WHERE block_number = :blockNumber LIMIT 1`
8. Return response:
   ```json
   {
     "blockNumber": 12345000,
     "timestamp": "2025-11-06T14:30:00Z",
     "totalSupply": "10500",
     "holderCount": 3,
     "splitMultiplier": 7,
     "capTable": [
       {
         "address": "0xAAA...",
         "balance": "6090",
         "ownershipPercent": "58.00"
       }
     ]
   }
   ```

**Validation**:
- `blockNumber` must be >= contract deployment block (33313307)
- `blockNumber` must be <= current block
- Return 400 if invalid

**Performance**:
- Add index on `transfers.block_number` (already exists per Phase 2B)
- Query should complete in <2 seconds per NFR-4

#### Step 2: Frontend API Client
**File**: `/ui/src/lib/api.ts`

**New Function**:
```typescript
export async function getHistoricalCapTable(blockNumber: number): Promise<CapTableResponse> {
  return fetchAPI<CapTableResponse>(`/cap-table/historical?blockNumber=${blockNumber}`)
}
```

#### Step 3: UI Component - Version Selector
**File**: `/ui/src/pages/CapTable.tsx`

**Changes**:
1. Add state for historical mode:
   ```typescript
   const [isHistorical, setIsHistorical] = useState(false)
   const [selectedBlock, setSelectedBlock] = useState<number | null>(null)
   ```

2. Add dropdown/toggle for version selection:
   - **Default**: "Current" (shows live cap table from existing endpoint)
   - **Historical Mode**: Show input field for block number OR dropdown of recent blocks
   - Button: "View Historical" → triggers API call

3. Display historical timestamp when in historical mode:
   - "Cap Table as of Block 12,345,000 (November 6, 2025 at 2:30 PM UTC)"

4. Disable sorting when in historical mode (data is static snapshot)

5. Export buttons should export historical data when in historical mode

**UI Design** (minimalist, compact):
```
┌─────────────────────────────────────────────────────────┐
│ Cap Table                                                │
│ Current token holders                                    │
│                                                          │
│ Version: [Current ▼]  OR  Block: [_________] [Query]   │
│                                                          │
│ [If historical: "Viewing snapshot at block X (Date)"]   │
└─────────────────────────────────────────────────────────┘
```

**Dropdown Options**:
- "Current" (default)
- "Enter Block Number..." (opens input field)
- Optionally: Recent milestones (last split, last mint, etc.)

#### Step 4: Hook for Historical Data
**File**: `/ui/src/hooks/useHistoricalCapTable.ts` (NEW)

**Purpose**: Separate hook for historical queries to avoid conflicts with real-time data

```typescript
import { useQuery } from '@tanstack/react-query'
import { getHistoricalCapTable } from '@/lib/api'

export function useHistoricalCapTable(blockNumber: number | null) {
  return useQuery({
    queryKey: ['historicalCapTable', blockNumber],
    queryFn: () => blockNumber ? getHistoricalCapTable(blockNumber) : null,
    enabled: !!blockNumber,
    staleTime: Infinity, // Historical data never changes
  })
}
```

#### Step 5: Export Historical Data
**File**: `/ui/src/components/captable/ExportButtons.tsx`

**Changes**:
- Accept `isHistorical` and `blockNumber` props
- Modify CSV/JSON filenames: `captable_block_12345000_2025-11-06.csv`
- Include block number in exported data header

---

## Feature 2: Transaction Pagination

### Goal
Paginate transaction history when >15 transactions exist to improve performance and UX.

### Requirements
- Display 15 transactions per page
- Show "Previous" / "Next" buttons
- Display "Page X of Y"
- Maintain current filters (address, event type)

### Implementation Steps

#### Step 1: Backend API Pagination
**File**: `/backend/src/routes/data.ts`

**Modify Endpoint**: `GET /api/transfers`

**Add Query Parameters**:
- `page` (default: 1)
- `limit` (default: 15, max: 100)
- Calculate `offset = (page - 1) * limit`

**SQL Query**:
```sql
-- Count total matching records
SELECT COUNT(*) FROM transfers 
WHERE (:address IS NULL OR from_address = :address OR to_address = :address);

-- Get paginated results
SELECT * FROM transfers
WHERE (:address IS NULL OR from_address = :address OR to_address = :address)
ORDER BY block_number DESC
LIMIT :limit OFFSET :offset;
```

**Response**:
```json
{
  "transfers": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 73,
    "limit": 15,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

#### Step 2: Frontend API Client
**File**: `/ui/src/lib/api.ts`

**Modify Function**:
```typescript
export async function getTransfers(params?: {
  address?: string
  page?: number
  limit?: number
}): Promise<TransfersResponse> {
  const searchParams = new URLSearchParams()
  if (params?.address) searchParams.append('address', params.address)
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.limit) searchParams.append('limit', params.limit.toString())
  
  const query = searchParams.toString()
  return fetchAPI<TransfersResponse>(`/transfers${query ? `?${query}` : ''}`)
}
```

#### Step 3: UI Pagination Component
**File**: `/ui/src/components/transactions/TransactionHistory.tsx`

**Changes**:
1. Add state: `const [page, setPage] = useState(1)`
2. Pass page to API hook: `useTransactions({ address, page, limit: 15 })`
3. Add pagination controls at bottom of table:

**UI Design** (shadcn/ui Button components):
```
┌──────────────────────────────────────────┐
│ [← Previous]  Page 2 of 5  [Next →]     │
│              Showing 16-30 of 73         │
└──────────────────────────────────────────┘
```

4. Disable "Previous" when `page === 1`
5. Disable "Next" when `page === totalPages`
6. Reset to page 1 when filters change

#### Step 4: Hook Update
**File**: `/ui/src/hooks/useTransactions.ts`

**Modify**:
```typescript
export function useTransactions(params?: {
  address?: `0x${string}`
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['transactions', params?.address, params?.page, params?.limit],
    queryFn: () => getTransfers({
      address: params?.address,
      page: params?.page || 1,
      limit: params?.limit || 15,
    }),
    enabled: !!params?.address,
  })
}
```

---

## Testing Plan

### Historical Cap Table Tests

**Manual Test Cases**:
1. **Current Block Query**: Query current block number → should match current cap table
2. **Pre-Split Block**: Query block before stock split → balances should be 7x smaller
3. **Post-Split Block**: Query block after split → balances should reflect multiplier
4. **Before First Mint**: Query block before any mints → empty cap table
5. **After First Mint**: Query block after first mint → should show initial holder
6. **Invalid Block**: Query block > current → should return 400 error
7. **Export Historical**: Export CSV/JSON in historical mode → verify correct data

**Performance Test**:
- Query with 100+ transactions → measure response time → should be <2 seconds

### Transaction Pagination Tests

**Manual Test Cases**:
1. **<15 Transactions**: Should not show pagination controls
2. **>15 Transactions**: Should show "Page 1 of X"
3. **Next Button**: Click next → should load page 2
4. **Previous Button**: Should be disabled on page 1
5. **Last Page**: Next button should be disabled on last page
6. **Filter Change**: Change address filter → should reset to page 1
7. **Navigation Persistence**: Navigate away and back → should remember page

---

## Files to Create/Modify

### New Files (2)
1. `/ui/src/hooks/useHistoricalCapTable.ts` - Hook for historical queries
2. `/ui/src/components/captable/VersionSelector.tsx` - Dropdown UI component (optional, can be inline)

### Modified Files (7)
1. `/backend/src/routes/data.ts` - Add historical endpoint, modify transfers pagination
2. `/ui/src/lib/api.ts` - Add getHistoricalCapTable, modify getTransfers
3. `/ui/src/pages/CapTable.tsx` - Add version selector, historical mode state
4. `/ui/src/components/captable/ExportButtons.tsx` - Support historical exports
5. `/ui/src/components/transactions/TransactionHistory.tsx` - Add pagination UI
6. `/ui/src/hooks/useTransactions.ts` - Add pagination params
7. `/ui/src/types/index.ts` - Update TransfersResponse type with pagination

---

## Implementation Order

### Session 1: Backend (1.5 hours)
1. Add historical cap-table endpoint with SQL query
2. Add pagination to transfers endpoint
3. Test both endpoints with curl/Postman
4. Deploy to Railway

### Session 2: Frontend (1.5-2 hours)
1. Add API client functions
2. Create historical cap table hook
3. Update CapTable.tsx with version selector
4. Update TransactionHistory.tsx with pagination
5. Test locally with `npm run dev`

### Session 3: Integration Testing (30-45 min)
1. Test historical queries with real data
2. Test pagination with 20+ transactions
3. Test exports in both modes
4. Verify performance (<2s for historical queries)
5. Deploy to Vercel

---

## Rollback Plan

If issues arise:
- Historical endpoint is isolated → can be disabled without affecting current cap table
- Pagination is backward compatible → if params missing, returns all results (existing behavior)
- No database schema changes required → zero migration risk

---

## Success Criteria

### Historical Cap Table
- ✅ Can query cap table at any block number
- ✅ Balances correctly reflect split multiplier for historical blocks
- ✅ UI shows clear indication of historical mode
- ✅ Exports include block number and timestamp
- ✅ Response time <2 seconds per NFR-4

### Transaction Pagination
- ✅ Shows 15 transactions per page
- ✅ Pagination controls work (previous/next)
- ✅ Total pages calculated correctly
- ✅ Filters reset to page 1 when changed
- ✅ No pagination shown when <15 transactions

---

## Post-Implementation

**Documentation Updates**:
1. Update `memory-bank/progress.md` - Mark historical queries as complete
2. Update `PHASE4_COMPLETION_REPORT.md` - Add test results
3. Update `backend/README.md` - Document new endpoint
4. Update `DEMO_VIDEO.md` - Add historical query demonstration

**Demo Preparation**:
- Create at least 20 transactions to showcase pagination
- Execute stock split to demonstrate pre/post-split historical queries
- Prepare specific block numbers for demo (e.g., "before split", "after split")

---

**End of Implementation Plan**

