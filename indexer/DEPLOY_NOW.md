# 🚂 Railway Deployment - Quick Start

## Three Ways to Deploy

### Option 1: Automated Script (Recommended)

```bash
cd /Users/mylessjs/Desktop/ChainEquity/indexer
./deploy-to-railway.sh
```

This script will:
1. ✅ Check/install Railway CLI
2. ✅ Build TypeScript
3. ✅ Authenticate with Railway
4. ✅ Initialize project
5. ✅ Guide you through environment setup
6. ✅ Deploy the indexer
7. ✅ Initialize database
8. ✅ Show logs

### Option 2: Manual Step-by-Step

```bash
cd /Users/mylessjs/Desktop/ChainEquity/indexer

# 1. Login
railway login

# 2. Initialize project
railway init

# 3. Add PostgreSQL in Railway dashboard
# Go to https://railway.app/dashboard
# Click project → New → Database → Add PostgreSQL

# 4. Set environment variables (in Railway dashboard)
# Go to service → Variables → Add each:
#   DATABASE_URL=<from PostgreSQL service - INTERNAL url>
#   BASE_SEPOLIA_RPC=https://sepolia.base.org
#   CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
#   START_BLOCK=33313307
#   CHAIN_ID=84532
#   NODE_ENV=production

# 5. Deploy
railway up

# 6. Initialize database
railway run npm run init-db

# 7. Check logs
railway logs
```

### Option 3: GitHub Integration (Alternative)

```bash
# 1. Push to GitHub
git add .
git commit -m "Add indexer"
git push origin main

# 2. In Railway dashboard:
#    - New Project → Deploy from GitHub
#    - Select repo and branch
#    - Set root directory to "indexer"
#    - Add PostgreSQL
#    - Set environment variables
#    - Railway auto-deploys on push
```

## ⚠️ Important Notes

### DATABASE_URL Format

Railway provides TWO connection strings:

1. **Internal** (use for indexer on Railway):
   ```
   postgresql://postgres:xxx@postgres.railway.internal:5432/railway
   ```

2. **Public** (save for Phase 2A backend on Vercel):
   ```
   postgresql://postgres:xxx@junction.proxy.rlwy.net:12345/railway
   ```

### Getting DATABASE_URL

After adding PostgreSQL in Railway:

1. Click PostgreSQL service
2. Go to "Variables" tab
3. Find `DATABASE_URL` variable
4. Copy the value (it's the internal one)
5. Paste into your indexer service's variables

**OR** use the "Connect" tab:
- **Private Network**: For indexer (Railway internal)
- **Public Network**: For backend API (external services)

## 🎯 What to Expect

### During Deployment (~2-3 minutes)
```
Building...
Installing dependencies...
Compiling TypeScript...
Starting service...
```

### After Deployment (logs)
```
🚀 ChainEquity Event Indexer Starting...
📜 Contract: 0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
📊 Starting from block: 33313307
⛓️  Current block: 33315847
⏪ Backfilling historical events...
📥 Found 0 Transfer events
📥 Found 0 WalletApproved events
📥 Found 0 WalletRevoked events
📥 Found 0 StockSplit events
📥 Found 0 SymbolChanged events
✅ Historical events processed
✅ Backfill complete
👀 Watching for new events...
✅ Indexer running
📡 Listening for blockchain events...
```

*Note: Event counts will be 0 if no test transactions have been made yet*

### Database After Initialization

```sql
-- 4 tables created:
transfers         (0 rows initially)
balances          (0 rows initially)
approvals         (0 rows initially)
corporate_actions (0 rows initially)
```

## ✅ Verification Checklist

After deployment, verify everything works:

```bash
# 1. Check service is running
railway status

# 2. View logs (should show "✅ Indexer running")
railway logs

# 3. Connect to database
railway connect postgres

# 4. In psql, check tables exist:
\dt

# 5. Query tables (will be empty initially):
SELECT COUNT(*) FROM transfers;
SELECT COUNT(*) FROM balances;
SELECT COUNT(*) FROM approvals;
SELECT COUNT(*) FROM corporate_actions;
```

## 🧪 Test the Indexer

Make a test transaction to verify the indexer catches it:

1. Use your Gnosis Safe to approve a wallet
2. Wait 5-10 seconds
3. Check Railway logs: `railway logs`
4. Should see: `✅ Wallet approved: 0x...`
5. Query database: `SELECT * FROM approvals;`

## 🚨 Troubleshooting

### "Cannot connect to DATABASE_URL"
- Make sure PostgreSQL service is running in Railway
- Check you're using the INTERNAL url (postgres.railway.internal)
- Wait 30 seconds after adding PostgreSQL

### "Build failed"
- Check you're in the indexer directory
- Run `npm run build` locally to test
- Check Railway logs for specific error

### "No events found during backfill"
- This is normal if no test transactions have been made
- The contract was deployed but may not have any activity yet
- Indexer will catch new events as they happen

### "Rate limit exceeded"
- Base Sepolia public RPC has rate limits
- Consider using Alchemy/Infura RPC
- Or slow down polling: set POLL_INTERVAL_MS=10000

## 📊 Monitoring Commands

```bash
# View logs (live tail)
railway logs -f

# Check service status
railway status

# View environment variables
railway variables

# Restart service
railway restart

# Open Railway dashboard
railway open

# Connect to PostgreSQL
railway connect postgres

# Run one-off command
railway run <command>
```

## 💰 Expected Costs

- **PostgreSQL**: ~$5/month (minimum)
- **Indexer Service**: ~$5/month
- **Total**: ~$10/month

Railway Starter plan includes $5/month credit.

## 🎉 Success!

Once you see this in the logs:
```
✅ Indexer running
📡 Listening for blockchain events...
```

**Your indexer is live and monitoring the blockchain 24/7!**

## Next Steps

1. ✅ **Phase 2B Complete** - Indexer deployed and running
2. **Save the PUBLIC DATABASE_URL** for Phase 2A
3. **Phase 2A Next**: Build Backend API that queries this database
4. **Phase 3 Next**: Build Frontend that queries the API

---

**Need help?** Check `RAILWAY_DEPLOYMENT.md` for detailed instructions.

