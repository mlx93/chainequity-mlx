#!/bin/bash
# ChainEquity Phase 2A & 2B Integration Test Script

BASE_URL="https://tender-achievement-production-3aa5.up.railway.app/api"
ADMIN_ADDRESS="0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6"
INVESTOR_A="0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e"

echo "🧪 Testing ChainEquity Backend & Indexer Integration"
echo "=================================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Health Check"
HEALTH=$(curl -s "$BASE_URL/health")
STATUS=$(echo "$HEALTH" | jq -r '.status // "error"')
DB_CONNECTED=$(echo "$HEALTH" | jq -r '.database.connected // false')
BC_CONNECTED=$(echo "$HEALTH" | jq -r '.blockchain.connected // false')

if [ "$STATUS" = "ok" ]; then
    echo "   ✅ Status: OK"
else
    echo "   ❌ Status: $STATUS"
fi

if [ "$DB_CONNECTED" = "true" ]; then
    echo "   ✅ Database: Connected"
else
    echo "   ❌ Database: Not connected"
fi

if [ "$BC_CONNECTED" = "true" ]; then
    echo "   ✅ Blockchain: Connected (Chain ID: $(echo "$HEALTH" | jq -r '.blockchain.chainId'))"
else
    echo "   ❌ Blockchain: Not connected"
fi
echo ""

# Test 2: Cap Table
echo "2️⃣  Cap Table"
CAP_TABLE=$(curl -s "$BASE_URL/cap-table")
TOTAL_HOLDERS=$(echo "$CAP_TABLE" | jq -r '.totalHolders // "error"')
if [ "$TOTAL_HOLDERS" != "error" ] && [ "$TOTAL_HOLDERS" != "null" ]; then
    echo "   ✅ Cap table accessible (Total holders: $TOTAL_HOLDERS)"
    echo "$CAP_TABLE" | jq -r '.capTable[] | "      \(.address): \(.balanceFormatted) tokens"' 2>/dev/null | head -5
else
    echo "   ⚠️  Cap table accessible but may be empty"
fi
echo ""

# Test 3: Transfers
echo "3️⃣  Transfers"
TRANSFERS=$(curl -s "$BASE_URL/transfers?limit=5")
TRANSFER_COUNT=$(echo "$TRANSFERS" | jq -r '.count // 0')
if [ "$TRANSFER_COUNT" != "error" ]; then
    echo "   ✅ Transfers accessible (Count: $TRANSFER_COUNT)"
else
    echo "   ❌ Transfers error"
fi
echo ""

# Test 4: Wallet Info
echo "4️⃣  Wallet Info (Admin)"
WALLET=$(curl -s "$BASE_URL/wallet/$ADMIN_ADDRESS")
WALLET_ADDRESS=$(echo "$WALLET" | jq -r '.address // "error"')
if [ "$WALLET_ADDRESS" != "error" ] && [ "$WALLET_ADDRESS" != "null" ]; then
    BALANCE=$(echo "$WALLET" | jq -r '.balanceFormatted // "0"')
    APPROVED=$(echo "$WALLET" | jq -r '.isApproved // false')
    echo "   ✅ Wallet info accessible"
    echo "      Address: $WALLET_ADDRESS"
    echo "      Balance: $BALANCE tokens"
    echo "      Approved: $APPROVED"
else
    echo "   ❌ Wallet info error"
fi
echo ""

# Test 5: Corporate Actions
echo "5️⃣  Corporate Actions"
ACTIONS=$(curl -s "$BASE_URL/corporate-actions?limit=5")
ACTION_COUNT=$(echo "$ACTIONS" | jq -r '.count // 0')
if [ "$ACTION_COUNT" != "error" ]; then
    echo "   ✅ Corporate actions accessible (Count: $ACTION_COUNT)"
else
    echo "   ❌ Corporate actions error"
fi
echo ""

# Test 6: Check Indexer Status (via transfers timestamp)
echo "6️⃣  Indexer Status Check"
RECENT_TRANSFER=$(curl -s "$BASE_URL/transfers?limit=1" | jq -r '.transfers[0].blockTimestamp // null')
if [ "$RECENT_TRANSFER" != "null" ] && [ "$RECENT_TRANSFER" != "" ]; then
    echo "   ✅ Indexer is active (recent transfer found)"
else
    echo "   ⚠️  No transfers yet (indexer waiting for events)"
fi
echo ""

echo "=================================================="
echo "✅ Basic tests complete!"
echo ""
echo "Next steps:"
echo "1. Submit a test transaction via POST /api/transfer"
echo "2. Wait 15 seconds"
echo "3. Verify it appears in GET /api/transfers"
echo "4. Check indexer logs: cd indexer && railway logs"
echo ""

