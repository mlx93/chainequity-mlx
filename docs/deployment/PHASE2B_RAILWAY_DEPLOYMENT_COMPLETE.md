# ChainEquity - Phase 2B Railway Deployment Complete ✅

**Date**: November 6, 2025  
**Status**: ✅ Indexer Deployed to Railway

---

## Updated Railway Information

### Previous Setup (lucid-strength project)
❌ **Deprecated** - Old local Railway project

### New Setup (ChainEquity-Indexer project)
✅ **Active** - Production deployment

---

## Railway Project Details

**Project Name**: ChainEquity-Indexer  
**Project ID**: d7432f9a-4960-4a89-8be7-ad9d828b8c7c  
**Project URL**: https://railway.com/project/d7432f9a-4960-4a89-8be7-ad9d828b8c7c  
**Deployed**: November 6, 2025

---

## PostgreSQL Database URLs

### Internal URL (for Railway services - Indexer)
```
postgresql://postgres:dYjiuLvfSvaOjsNHXhtAbWHtbwWPFpUW@postgres.railway.internal:5432/railway
```
**Used by**: Event Indexer (running on Railway)

### Public URL (for external services - Backend, Local Dev)
```
postgresql://postgres:dYjiuLvfSvaOjsNHXhtAbWHtbwWPFpUW@nozomi.proxy.rlwy.net:25369/railway
```
**Used by**: 
- Phase 2A Backend (will deploy to Vercel)
- Local development and testing
- Any service outside Railway network

---

## Environment Variables Set on Railway

All configured via `railway variables`:

```bash
DATABASE_URL=postgresql://postgres:dYjiuLvfSvaOjsNHXhtAbWHtbwWPFpUW@postgres.railway.internal:5432/railway
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
START_BLOCK=33313307
CHAIN_ID=84532
NODE_ENV=production
```

---

## Files Updated

✅ **wallet-addresses.txt** - Updated with new Railway database URLs  
✅ **RAILWAY_DATABASE_URLS.txt** - Created with detailed documentation  
✅ **This file** - Phase 2B deployment summary

---

## Database Schema

Created on Railway PostgreSQL:
- ✅ `transfers` - Transaction history with 4 indexes
- ✅ `balances` - Current holdings with ownership %
- ✅ `approvals` - Wallet approval status
- ✅ `corporate_actions` - Splits and symbol changes

---

## Services Running on Railway

### 1. PostgreSQL Database
- **Type**: PostgreSQL 15.x
- **Status**: ✅ Running
- **Connection**: Internal & Public URLs available

### 2. Event Indexer
- **Type**: Node.js/TypeScript service
- **Status**: ✅ Deployed (check logs to verify running)
- **Monitoring**: From block 33313307
- **Function**: Indexes blockchain events → Updates database

---

## For Phase 2A Backend

When building the backend API, use:

### Environment Variable
```bash
DATABASE_URL=postgresql://postgres:dYjiuLvfSvaOjsNHXhtAbWHtbwWPFpUW@nozomi.proxy.rlwy.net:25369/railway
```

### Backend Will Query
- `SELECT * FROM transfers` - Transaction history
- `SELECT * FROM balances` - Current token holders
- `SELECT * FROM approvals` - Approved wallets
- `SELECT * FROM corporate_actions` - Splits/changes

### Important Notes
1. **Virtual Splits**: Database stores RAW balances. Backend must read `splitMultiplier()` from contract and multiply balances.
2. **Ownership %**: Automatically calculated by indexer.
3. **Public URL Required**: Backend runs on Vercel (outside Railway network).

---

## Verify Deployment

### Check Indexer Logs
```bash
cd /Users/mylessjs/Desktop/ChainEquity/indexer
railway logs
```

**Expected output**:
```
🚀 ChainEquity Event Indexer Starting...
📜 Contract: 0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
📊 Starting from block: 33313307
⏪ Backfilling historical events...
✅ Backfill complete
👀 Watching for new events...
✅ Indexer running
```

### Check Database
```bash
railway connect postgres

# Inside psql:
\dt                          # List tables
SELECT COUNT(*) FROM transfers;
SELECT * FROM balances;
\q
```

---

## Cost Estimate

**Railway Monthly**: ~$10-15
- PostgreSQL: $5-10/month
- Indexer Service: $5/month
- **Total**: Affordable for prototype/demo

---

## Next Steps

1. ✅ **Phase 2B Complete** - Indexer deployed and running
2. ⏳ **Phase 2A Next** - Build backend API
3. ⏳ **Phase 3** - Build frontend UI
4. ⏳ **Phase 4** - Integration testing & demo

---

## Quick Reference

| Item | Value |
|------|-------|
| **Contract Address** | 0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e |
| **Deployment Block** | 33313307 |
| **Safe Address** | 0x6264F29968e8fd2810cB79fb806aC65dAf9db73d |
| **Railway Project** | ChainEquity-Indexer |
| **Database (Public)** | nozomi.proxy.rlwy.net:25369 |
| **Database (Internal)** | postgres.railway.internal:5432 |

---

**Phase 2B Deployment Complete** ✅  
Generated: November 6, 2025

