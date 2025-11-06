# ChainEquity Event Indexer - Railway Deployment Guide

## 🚂 Step-by-Step Railway Deployment

### Prerequisites ✅
- [x] Railway CLI installed
- [x] Indexer code complete
- [x] TypeScript compiled successfully

### Step 1: Login to Railway

Run this command and follow the browser authentication:

```bash
cd /Users/mylessjs/Desktop/ChainEquity/indexer
railway login
```

This will open your browser to authenticate with Railway.

### Step 2: Create a New Railway Project

You have two options:

#### Option A: Create New Project (Recommended for First Time)
```bash
railway init
```

This will:
- Create a new Railway project
- Link your local directory to it
- Set up the connection

#### Option B: Link to Existing Project
```bash
railway link
```

Then select your existing Railway project from the list.

### Step 3: Add PostgreSQL Database

In the Railway dashboard (https://railway.app):

1. Click your project
2. Click "New" → "Database" → "Add PostgreSQL"
3. Railway will provision a PostgreSQL database
4. **Copy the connection strings** (you'll need both):
   - **Internal URL**: `postgresql://postgres:password@postgres.railway.internal:5432/railway`
   - **Public URL**: `postgresql://postgres:password@junction.proxy.rlwy.net:xxxxx/railway`

### Step 4: Set Environment Variables

You need to set these in Railway dashboard or via CLI:

```bash
# Set variables one by one
railway variables set DATABASE_URL="<INTERNAL_POSTGRES_URL>"
railway variables set BASE_SEPOLIA_RPC="https://sepolia.base.org"
railway variables set CONTRACT_ADDRESS="0xFCc9E74019a2be5808d63A941a84dEbE0fC39964"
railway variables set START_BLOCK="33313307"
railway variables set CHAIN_ID="84532"
railway variables set NODE_ENV="production"
```

**Or** set them in the Railway dashboard:
1. Go to your service
2. Click "Variables" tab
3. Add each variable

### Step 5: Deploy to Railway

```bash
# Make sure you're in the indexer directory
cd /Users/mylessjs/Desktop/ChainEquity/indexer

# Deploy
railway up
```

This will:
- Upload your code
- Install dependencies
- Build TypeScript
- Start the indexer

### Step 6: Initialize Database

Once deployed, initialize the database schema:

```bash
railway run npm run init-db
```

This creates the 4 tables with indexes.

### Step 7: Verify Deployment

Check the logs to see the indexer running:

```bash
railway logs
```

You should see:
```
🚀 ChainEquity Event Indexer Starting...
📜 Contract: 0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
📊 Starting from block: 33313307
⛓️  Current block: XXXXX
⏪ Backfilling historical events...
✅ Backfill complete
👀 Watching for new events...
✅ Indexer running
```

### Step 8: Verify Database Data

Connect to your Railway PostgreSQL and check the data:

```bash
railway connect postgres
```

Then run these queries:

```sql
-- Check tables exist
\dt

-- Check transfers
SELECT COUNT(*) FROM transfers;

-- Check balances
SELECT * FROM balances ORDER BY balance DESC;

-- Check approvals
SELECT * FROM approvals;

-- Check corporate actions
SELECT * FROM corporate_actions;
```

## 🎯 Quick Commands Reference

```bash
# View logs
railway logs

# View logs (live tail)
railway logs -f

# Check status
railway status

# Restart service
railway restart

# Open Railway dashboard
railway open

# View environment variables
railway variables

# Connect to database
railway connect postgres

# Run a one-off command
railway run <command>
```

## 🔍 Troubleshooting

### Issue: "DATABASE_URL not set"
**Solution**: Make sure you set the DATABASE_URL variable in Railway dashboard with the **internal** connection string.

### Issue: "Cannot connect to database"
**Solution**: 
- Verify PostgreSQL service is running in Railway
- Check that DATABASE_URL uses internal hostname (postgres.railway.internal)
- Wait a few seconds for PostgreSQL to fully start

### Issue: "TypeScript compilation fails"
**Solution**: Run `npm run build` locally first to verify no errors.

### Issue: "RPC rate limit exceeded"
**Solution**: 
- Base Sepolia public RPC has rate limits
- Consider using Alchemy or Infura RPC endpoint
- Add rate limiting/retry logic

### Issue: "Backfill taking too long"
**Solution**: This is normal! Processing thousands of blocks can take 5-10 minutes. Watch the logs to see progress.

## 📊 Expected Results After Deployment

Once deployed and backfilled:

1. **Transfers Table**: Will contain all Transfer events since block 33313307
2. **Balances Table**: Will show current balances for all addresses that have received tokens
3. **Approvals Table**: Will show all approved/revoked wallets
4. **Corporate Actions Table**: Will show any splits or symbol changes

## 🔗 Getting Public DATABASE_URL for Backend

For Phase 2A (Backend API), you'll need the **public** DATABASE_URL:

1. Go to Railway dashboard
2. Click PostgreSQL service
3. Click "Connect" tab
4. Copy the "Public Network" URL
5. Save this for Phase 2A deployment

## 📱 Railway Dashboard URLs

After deployment, you can access:

- **Project Dashboard**: `railway open`
- **Service Logs**: Click service → "Deployments" → "Logs"
- **Metrics**: Click service → "Metrics"
- **Database**: Click PostgreSQL → "Data" (to browse tables)

## 💰 Railway Pricing

- **Starter Plan**: $5/month (includes $5 credit)
- **PostgreSQL**: ~$5-10/month depending on usage
- **Indexer Service**: ~$5/month (runs continuously)

**Total**: ~$10-15/month for indexer + database

## 🎉 Success Checklist

- [ ] Railway CLI installed and authenticated
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Code deployed with `railway up`
- [ ] Database initialized with `npm run init-db`
- [ ] Logs show "✅ Indexer running"
- [ ] Database tables populated with events
- [ ] Public DATABASE_URL saved for Phase 2A

## Next Steps

Once indexer is deployed and running:

1. ✅ **Phase 2B Complete** - Indexer monitoring blockchain 24/7
2. 🚧 **Phase 2A Next** - Build Backend API (queries this database)
3. 🚧 **Phase 3 Next** - Build Frontend (queries Backend API)

---

**Need Help?** Check Railway docs at https://docs.railway.app


