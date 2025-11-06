# Phase 2A & 2B Integration Testing Guide

**Purpose**: Verify Backend API (Phase 2A) and Event Indexer (Phase 2B) work together correctly.

---

## Part 1: Test Phase 2B (Event Indexer)

### Test 1.1: Verify Indexer is Running

```bash
# Check indexer logs
cd /Users/mylessjs/Desktop/ChainEquity/indexer
railway logs
```

**Expected Output**:
```
✅ Database schema ready
✅ Indexer running
📡 Listening for blockchain events...
```

**Status Check**: ✅ Indexer running and monitoring blockchain

---

### Test 1.2: Verify Database Tables Exist and Have Data

**Via Backend API** (tests both Phase 2A and database connection):

```bash
# Test cap-table endpoint (queries balances table)
curl https://tender-achievement-production-3aa5.up.railway.app/api/cap-table | jq .

# Test transfers endpoint (queries transfers table)
curl https://tender-achievement-production-3aa5.up.railway.app/api/transfers?limit=10 | jq .

# Test wallet info (queries balances + approvals tables)
curl https://tender-achievement-production-3aa5.up.railway.app/api/wallet/0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6 | jq .

# Test corporate actions (queries corporate_actions table)
curl https://tender-achievement-production-3aa5.up.railway.app/api/corporate-actions | jq .
```

**Expected Results**:
- `/api/cap-table` should return Admin wallet with 10M tokens (if minted)
- `/api/transfers` should return array (may be empty if no transfers yet)
- `/api/wallet/:address` should return balance and approval status
- `/api/corporate-actions` should return array (may be empty)

**Status Check**: ✅ Database tables accessible via Backend API

---

### Test 1.3: Direct Database Query (Optional)

If you want to verify database directly:

```bash
# Connect to Railway database
cd /Users/mylessjs/Desktop/ChainEquity/indexer
railway connect postgres

# Inside psql:
\dt                          # List all tables
SELECT COUNT(*) FROM transfers;
SELECT COUNT(*) FROM balances;
SELECT COUNT(*) FROM approvals;
SELECT COUNT(*) FROM corporate_actions;
SELECT * FROM balances LIMIT 5;
\q
```

**Expected**: 4 tables exist, may have 0 rows if no transactions yet.

---

## Part 2: Test Phase 2A (Backend API)

### Test 2.1: Health Check

```bash
curl https://tender-achievement-production-3aa5.up.railway.app/api/health | jq .
```

**Expected**:
```json
{
  "status": "ok",
  "blockchain": {
    "connected": true,
    "chainId": 84532
  },
  "database": {
    "connected": true
  }
}
```

**Status Check**: ✅ Backend connected to both database and blockchain

---

### Test 2.2: Data Query Endpoints (GET)

```bash
BASE_URL="https://tender-achievement-production-3aa5.up.railway.app/api"

# 1. Cap Table
echo "=== Cap Table ==="
curl -s $BASE_URL/cap-table | jq .

# 2. Transfers (with filters)
echo "=== Transfers ==="
curl -s "$BASE_URL/transfers?limit=5&offset=0" | jq .

# 3. Corporate Actions
echo "=== Corporate Actions ==="
curl -s "$BASE_URL/corporate-actions?limit=5" | jq .

# 4. Wallet Info
echo "=== Wallet Info ==="
curl -s "$BASE_URL/wallet/0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6" | jq .
```

**Expected**: All endpoints return 200 with JSON data

---

### Test 2.3: Transaction Submission Endpoints (POST)

**Test Transfer** (requires approved recipient):

```bash
BASE_URL="https://tender-achievement-production-3aa5.up.railway.app/api"

# First, check if Investor A is approved
curl -s "$BASE_URL/wallet/0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e" | jq .isApproved

# If approved, submit transfer (1000 tokens = 1000000000000000000000 wei)
curl -X POST $BASE_URL/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e",
    "amount": "1000000000000000000000"
  }' | jq .
```

**Expected Response**:
```json
{
  "success": true,
  "transactionHash": "0x...",
  "blockExplorerUrl": "https://sepolia.basescan.org/tx/0x...",
  "message": "Transfer submitted successfully"
}
```

**Test Approve Wallet** (if recipient not approved):

```bash
curl -X POST $BASE_URL/admin/approve-wallet \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e"
  }' | jq .
```

---

## Part 3: Integration Test (End-to-End)

### Test 3.1: Complete Transaction Flow

**Goal**: Submit transaction via Backend → Indexer picks it up → Backend can query it

**Step 1**: Submit transaction via Backend API
```bash
# Submit transfer
curl -X POST https://tender-achievement-production-3aa5.up.railway.app/api/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e",
    "amount": "1000000000000000000000"
  }' | jq .transactionHash
```

**Save the transaction hash** (e.g., `TX_HASH=0x...`)

**Step 2**: Wait 10-15 seconds for block confirmation and indexing

**Step 3**: Verify transaction appears in transfers
```bash
# Query transfers endpoint
curl -s "https://tender-achievement-production-3aa5.up.railway.app/api/transfers?limit=1" | jq .

# Should show the transaction we just submitted
```

**Step 4**: Verify balances updated
```bash
# Check sender balance (Admin)
curl -s "https://tender-achievement-production-3aa5.up.railway.app/api/wallet/0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6" | jq .balance

# Check recipient balance (Investor A)
curl -s "https://tender-achievement-production-3aa5.up.railway.app/api/wallet/0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e" | jq .balance

# Check cap-table reflects changes
curl -s "https://tender-achievement-production-3aa5.up.railway.app/api/cap-table" | jq .
```

**Expected Results**:
- ✅ Transaction appears in `/api/transfers` within 15 seconds
- ✅ Sender balance decreased by 1000 tokens
- ✅ Recipient balance increased by 1000 tokens
- ✅ Cap table shows updated balances

**Status Check**: ✅ Integration working - Backend → Blockchain → Indexer → Database → Backend

---

### Test 3.2: Verify Indexer Picked Up Event

```bash
# Check indexer logs for the transaction
cd /Users/mylessjs/Desktop/ChainEquity/indexer
railway logs | grep -i "transfer\|processing" | tail -10
```

**Expected**: Indexer logs showing Transfer event processed

---

### Test 3.3: Test Admin Functions

**Approve Wallet**:
```bash
curl -X POST https://tender-achievement-production-3aa5.up.railway.app/api/admin/approve-wallet \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0xefd94a1534959e04630899abdd5d768601f4af5b"
  }' | jq .
```

**Wait 10 seconds**, then verify:
```bash
curl -s "https://tender-achievement-production-3aa5.up.railway.app/api/wallet/0xefd94a1534959e04630899abdd5d768601f4af5b" | jq .isApproved
# Should return: true
```

**Stock Split** (via Gnosis Safe in production, but can test transaction submission):
```bash
curl -X POST https://tender-achievement-production-3aa5.up.railway.app/api/admin/stock-split \
  -H "Content-Type: application/json" \
  -d '{
    "multiplier": 2
  }' | jq .
```

**Note**: This will submit transaction but needs Gnosis Safe approval. Check transaction hash on Basescan.

---

## Part 4: Test Script (Automated)

Create a test script:

```bash
#!/bin/bash
# test-integration.sh

BASE_URL="https://tender-achievement-production-3aa5.up.railway.app/api"

echo "🧪 Testing ChainEquity Backend & Indexer Integration"
echo ""

echo "1️⃣ Health Check"
curl -s $BASE_URL/health | jq -r '.status' && echo "✅" || echo "❌"
echo ""

echo "2️⃣ Database Connection"
curl -s $BASE_URL/health | jq -r '.database.connected' && echo "✅ Database connected" || echo "❌ Database not connected"
echo ""

echo "3️⃣ Blockchain Connection"
curl -s $BASE_URL/health | jq -r '.blockchain.connected' && echo "✅ Blockchain connected" || echo "❌ Blockchain not connected"
echo ""

echo "4️⃣ Cap Table"
CAP_TABLE=$(curl -s $BASE_URL/cap-table)
echo "$CAP_TABLE" | jq -r '.totalHolders // "error"' > /dev/null && echo "✅ Cap table accessible" || echo "❌ Cap table error"
echo ""

echo "5️⃣ Transfers"
TRANSFERS=$(curl -s "$BASE_URL/transfers?limit=1")
echo "$TRANSFERS" | jq -r '.transfers // "error"' > /dev/null && echo "✅ Transfers accessible" || echo "❌ Transfers error"
echo ""

echo "6️⃣ Wallet Info"
WALLET=$(curl -s "$BASE_URL/wallet/0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6")
echo "$WALLET" | jq -r '.address // "error"' > /dev/null && echo "✅ Wallet info accessible" || echo "❌ Wallet info error"
echo ""

echo "7️⃣ Corporate Actions"
ACTIONS=$(curl -s "$BASE_URL/corporate-actions?limit=1")
echo "$ACTIONS" | jq -r '.actions // "error"' > /dev/null && echo "✅ Corporate actions accessible" || echo "❌ Corporate actions error"
echo ""

echo "✅ Basic tests complete!"
echo ""
echo "Next: Test transaction submission and verify indexer picks it up"
```

**Run it**:
```bash
chmod +x test-integration.sh
./test-integration.sh
```

---

## Test Checklist

### Phase 2B (Indexer)
- [ ] Indexer running (logs show "Listening for blockchain events...")
- [ ] Database tables exist (4 tables: transfers, balances, approvals, corporate_actions)
- [ ] Indexer processes new events (check logs after transaction)

### Phase 2A (Backend)
- [ ] Health endpoint returns 200
- [ ] Database connection shows `connected: true`
- [ ] Blockchain connection shows `connected: true`
- [ ] Cap-table endpoint returns data
- [ ] Transfers endpoint returns data (may be empty)
- [ ] Wallet info endpoint returns data
- [ ] Corporate actions endpoint returns data (may be empty)

### Integration
- [ ] Submit transaction via Backend API succeeds
- [ ] Transaction appears in `/api/transfers` within 15 seconds
- [ ] Balances update correctly in `/api/cap-table`
- [ ] Wallet info reflects new balance
- [ ] Indexer logs show Transfer event processed

---

## Success Criteria

**Phase 2A & 2B are working correctly if**:
1. ✅ Backend API can query database (Phase 2B populated data)
2. ✅ Backend API can submit transactions to blockchain
3. ✅ Indexer picks up new transactions within 15 seconds
4. ✅ Backend API can query newly indexed data
5. ✅ All endpoints return proper JSON responses
6. ✅ No errors in logs

---

## Troubleshooting

### Issue: Cap table empty
**Check**: Has contract minted tokens? Admin wallet should have balance if minted during deployment.

### Issue: Transfers empty
**Expected**: No transfers yet - submit a test transaction to verify indexing works.

### Issue: Transaction submission fails
**Check**: 
- Admin wallet has testnet ETH?
- Recipient is approved?
- RPC endpoint accessible?

### Issue: Transaction submitted but not appearing in API
**Check**:
- Wait 15-20 seconds for block confirmation
- Check indexer logs for errors
- Verify database connection
- Check transaction on Basescan

### Issue: Indexer not processing events
**Check**:
- Indexer logs show "Listening for blockchain events..."
- Contract address matches in indexer config
- Start block is correct (33313307)
- Database connection working

---

**Ready to test! Start with Part 1, then Part 2, then Part 3 for full integration verification.** 🚀

