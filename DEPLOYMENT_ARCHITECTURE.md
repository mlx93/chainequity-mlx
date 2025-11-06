# ChainEquity Deployment Architecture

## Overview

ChainEquity uses a hybrid deployment strategy optimizing each service for its specific requirements.

## Deployment Map

### Railway (Long-Running Services)
- **PostgreSQL Database** - Managed database service
- **Event Indexer** (Phase 2B) - 24/7 blockchain event monitoring

### Vercel (Serverless API)
- **Backend API** (Phase 2A) - HTTP endpoints for frontend queries
- **Frontend** (Phase 3) - Static site with Next.js

## Why This Architecture?

### Railway for Indexer ✅
- **Persistent connections** to blockchain RPC
- **Continuous monitoring** without timeouts
- **Database connection pooling** without cold starts
- **24/7 uptime** for real-time event processing
- **Simple deployment** with `railway up`

### Vercel for Backend API ✅
- **Serverless scaling** - auto-scales with traffic
- **Zero management** - no servers to maintain
- **Global edge network** - fast response times worldwide
- **Perfect for REST APIs** - request/response pattern
- **Free tier** - generous for side projects

### Shared Railway PostgreSQL ✅
- Both indexer and backend API connect to same database
- Indexer writes events, API reads for queries
- Single source of truth

## Network Access

### Railway PostgreSQL Connection Strings

Railway provides two connection strings:

1. **Internal URL** (for Railway services only):
```
postgresql://postgres:password@postgres.railway.internal:5432/railway
```

2. **Public URL** (for external services like Vercel):
```
postgresql://postgres:password@junction.proxy.rlwy.net:12345/railway
```

**For this project:**
- Indexer (on Railway): Uses internal URL
- Backend API (on Vercel): Uses public URL

## Environment Variables

### Indexer (.env on Railway)
```bash
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
START_BLOCK=33313307
CHAIN_ID=84532
NODE_ENV=production
```

### Backend API (.env on Vercel)
```bash
DATABASE_URL=postgresql://postgres:password@junction.proxy.rlwy.net:12345/railway
CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
BASE_SEPOLIA_RPC=https://sepolia.base.org
CHAIN_ID=84532
```

## Getting Public DATABASE_URL from Railway

### Option 1: Railway Dashboard
1. Go to Railway dashboard
2. Click on PostgreSQL service
3. Go to "Connect" tab
4. Copy "Public Network" connection string

### Option 2: Railway CLI
```bash
railway variables -s <postgres-service-name>
```

## Deployment Steps

### 1. Deploy Indexer to Railway

```bash
cd indexer

# Login to Railway
railway login

# Link to project (or create new)
railway link

# Set environment variables in Railway dashboard
# (Use internal DATABASE_URL)

# Deploy
railway up

# Initialize database
railway run npm run init-db

# Check logs
railway logs
```

### 2. Deploy Backend API to Vercel (Phase 2A)

```bash
cd backend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# (Use public DATABASE_URL from Railway)
```

### 3. Deploy Frontend to Vercel (Phase 3)

```bash
cd frontend

# Deploy
vercel

# Set environment variables (API URL)
```

## Monitoring

### Indexer (Railway)
```bash
# View logs
railway logs -s indexer

# Check status
railway status -s indexer

# Restart if needed
railway restart -s indexer
```

### Backend API (Vercel)
- View logs in Vercel dashboard
- Monitor function execution times
- Check edge caching performance

### Database (Railway)
```bash
# Connect to database
railway connect postgres

# Run queries
SELECT COUNT(*) FROM transfers;
SELECT * FROM balances ORDER BY balance DESC LIMIT 10;
```

## Cost Estimates

### Railway (Monthly)
- **PostgreSQL**: $5-10 (Hobby plan)
- **Indexer Service**: $5-10 (Hobby plan)
- **Total**: ~$10-20/month

### Vercel (Monthly)
- **Hobby Plan**: Free (100GB bandwidth, 100GB-hrs compute)
- **Pro Plan**: $20/month (if needed for scale)

### Total Monthly Cost
- **Development**: ~$10-20 (Railway only, Vercel free)
- **Production**: ~$30-40 (Railway + Vercel Pro if needed)

## Alternative: All-Railway Setup

If you prefer to keep everything on Railway:

```
Railway Project:
├── PostgreSQL (managed)
├── Indexer (long-running)
└── Backend API (long-running Node.js)
```

**Pros:**
- Simpler deployment (one platform)
- Internal networking (faster)
- Single billing

**Cons:**
- No global edge network
- Manual scaling vs auto-scaling
- Slightly higher cost (~$25-30/month)

## Recommended: Hybrid Setup

For ChainEquity, the hybrid approach is optimal:
- **Railway**: Indexer + Database (what needs to run 24/7)
- **Vercel**: Backend API + Frontend (what benefits from edge network)

This provides the best performance, cost, and developer experience.

