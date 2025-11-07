# Phase 2B - Manual Railway Deployment Guide

## Quick Start (3 Steps)

Since the automated script requires interactive mode, follow these manual steps:

---

## Step 1: Login to Railway (30 seconds)

```bash
cd /Users/mylessjs/Desktop/ChainEquity/indexer
railway login
```

This will open your browser. Login with GitHub if not already authenticated.

---

## Step 2: Initialize Project (1 minute)

```bash
# Initialize Railway project in indexer directory
railway init

# Choose option: "Create a new project"
# Name: ChainEquity-Indexer
```

---

## Step 3: Add PostgreSQL Database (2 minutes)

```bash
# Add PostgreSQL to your project
railway add

# Select: PostgreSQL
# Wait for provisioning (~30 seconds)
```

**⚠️ CRITICAL**: After PostgreSQL is added, get the PUBLIC connection string:

1. Go to Railway dashboard: https://railway.app/
2. Click on your "ChainEquity-Indexer" project
3. Click on the **PostgreSQL** service
4. Go to **"Connect"** tab
5. Copy the **PUBLIC** PostgreSQL Connection URL (starts with `postgresql://`)

**Save this for Phase 2A!** It will look like:
```
postgresql://postgres:PASSWORD@junction.proxy.rlwy.net:PORT/railway
```

---

## Step 4: Set Environment Variables (3 minutes)

```bash
# Set all required environment variables
railway variables set DATABASE_URL=<INTERNAL_URL_FROM_POSTGRESQL>
railway variables set BASE_SEPOLIA_RPC=https://sepolia.base.org
railway variables set CONTRACT_ADDRESS=0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
railway variables set START_BLOCK=33313307
railway variables set CHAIN_ID=84532
railway variables set NODE_ENV=production
```

**For DATABASE_URL**: Use the **INTERNAL** connection string from PostgreSQL service (ends with `postgres.railway.internal:5432/railway`)

---

## Step 5: Initialize Database Schema (1 minute)

```bash
# Connect to PostgreSQL and create tables
railway run npm run init-db

# Expected output:
# ✅ Database schema initialized successfully
```

---

## Step 6: Deploy (2 minutes)

```bash
# Deploy the indexer
railway up

# Wait for deployment...
```

---

## Step 7: Verify (2 minutes)

```bash
# Check logs to see if indexer is running
railway logs

# Expected output:
# 🚀 ChainEquity Event Indexer Starting...
# ⏪ Backfilling historical events...
# ✅ Backfill complete
# 👀 Watching for new events...
# ✅ Indexer running
```

---

## Step 8: Test Database Connection (1 minute)

```bash
# Connect to PostgreSQL
railway connect postgres

# Check tables exist
\dt

# Should show:
# transfers
# balances  
# approvals
# corporate_actions

# Check initial state
SELECT COUNT(*) FROM transfers;

# Exit
\q
```

---

## What to Save for Phase 2A:

From Railway PostgreSQL service, save **TWO** connection strings:

1. **INTERNAL** (for indexer): `postgres.railway.internal:5432`
   - Already set in environment variables ✅

2. **PUBLIC** (for Phase 2A backend): `junction.proxy.rlwy.net:PORT`
   - Save this! Backend will need it ⚠️

**Example PUBLIC URL**:
```
postgresql://postgres:MyPassword123@junction.proxy.rlwy.net:12345/railway
```

---

## Troubleshooting

### "Cannot login in non-interactive mode"
- **Solution**: Run commands manually (above steps)

### "Railway CLI not found"
- **Solution**: Install with `npm install -g @railway/cli`

### "Schema initialization failed"
- **Solution**: Verify DATABASE_URL is set correctly
- Check: `railway variables`

### "No events being processed"
- **Solution**: Check START_BLOCK is correct (33313307)
- Check: `railway logs | grep "Backfill"`

---

## Success Checklist

- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] All 6 environment variables set
- [ ] Database schema initialized (4 tables)
- [ ] Indexer deployed and running
- [ ] Logs show "✅ Indexer running"
- [ ] PUBLIC DATABASE_URL saved for Phase 2A

---

**Once complete, tell the orchestrator:**

> Phase 2B deployed! Indexer is live on Railway. PUBLIC DATABASE_URL: `postgresql://postgres:...@junction.proxy.rlwy.net:XXXXX/railway`. Ready for Phase 2A backend development.

---

**Estimated Total Time**: 10-15 minutes

