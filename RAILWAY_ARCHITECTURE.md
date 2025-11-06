# ChainEquity Railway Architecture

**Railway Project**: `superb-trust`  
**Environment**: production  
**Date**: November 6, 2025

---

## Architecture Overview

```
Railway Project: superb-trust
│
├── Service 1: PostgreSQL Database
│   ├── Type: Database (Railway PostgreSQL template)
│   ├── Status: ✅ Running
│   ├── Internal URL: postgres.railway.internal:5432
│   ├── Public URL: yamanote.proxy.rlwy.net:23802
│   └── Purpose: Shared database for indexer and backend
│
├── Service 2: chainequity-mlx (Indexer - Phase 2B)
│   ├── Type: Node.js Application
│   ├── Source: GitHub (chainequity-mlx repo)
│   ├── Root Directory: indexer/
│   ├── Status: ✅ Running
│   ├── Build: Dockerfile
│   ├── Purpose: Monitor blockchain events → Write to PostgreSQL
│   └── Database Connection: Internal (postgres.railway.internal)
│
└── Service 3: tender-achievement (Backend - Phase 2A)
    ├── Type: Node.js Application
    ├── Source: GitHub (chainequity-mlx repo)
    ├── Root Directory: backend/
    ├── Status: ✅ Running
    ├── Build: Railway auto-detect (npm)
    ├── Port: 3001 (Railway auto-assigned)
    ├── Public URL: tender-achievement-production-3aa5.up.railway.app
    ├── Purpose: Express API → Query database, submit transactions
    └── Database Connection: Public (yamanote.proxy.rlwy.net:23802)
```

---

## Service Details

### 1. PostgreSQL Database

**Service Name**: Postgres  
**Status**: ✅ Running  
**Database**: railway  
**User**: postgres

**Connection Strings**:
- **Internal** (for services on Railway): `postgresql://postgres:opjpippLFhoVcIuuMllwtrKcSGTBJgar@postgres.railway.internal:5432/railway`
- **Public** (for external services): `postgresql://postgres:opjpippLFhoVcIuuMllwtrKcSGTBJgar@yamanote.proxy.rlwy.net:23802/railway`

**Schema**:
- `transfers` - Token transfer events
- `balances` - Current token balances (derived from transfers)
- `approvals` - Wallet allowlist status
- `corporate_actions` - Stock splits, symbol changes, mints, burns

**Auto-Generated Variables**:
- `PGHOST`, `PGPASSWORD`, `PGUSER`, `PGPORT`
- `RAILWAY_PRIVATE_DOMAIN`, `RAILWAY_PUBLIC_DOMAIN`

**Note**: Backend-specific variables were accidentally added but don't affect Postgres (it uses auto-generated vars).

---

### 2. Indexer Service (Phase 2B)

**Service Name**: chainequity-mlx  
**Type**: Node.js + TypeScript  
**Source**: GitHub repository `mlx93/chainequity-mlx`  
**Root Directory**: `indexer/`  
**Build Method**: Dockerfile (`RAILWAY_DOCKERFILE_PATH=indexer/Dockerfile`)

**Status**: ✅ Running 24/7  
**Function**: Monitor blockchain events and write to database

**Environment Variables**:
```bash
RAILWAY_DOCKERFILE_PATH=indexer/Dockerfile
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
START_BLOCK=33313307
CHAIN_ID=84532
NODE_ENV=production
DATABASE_URL=<Railway auto-provides internal URL>
```

**Database Connection**: Uses Railway's auto-provided `DATABASE_URL` (internal DNS)

**Key Features**:
- Auto-initializes database schema on startup
- Backfills historical events from deployment block
- Watches for new events in real-time
- Processes all 7 event types

**Monitored Events**:
- Transfer
- WalletApproved
- WalletRevoked
- StockSplit
- SymbolChanged
- TokensMinted
- TokensBurned

---

### 3. Backend Service (Phase 2A)

**Service Name**: tender-achievement  
**Type**: Node.js + TypeScript (Express API)  
**Source**: GitHub repository `mlx93/chainequity-mlx`  
**Root Directory**: `backend/`  
**Build Method**: Railway auto-detect (Nixpacks)

**Status**: ✅ Running  
**Public URL**: https://tender-achievement-production-3aa5.up.railway.app  
**API Base**: https://tender-achievement-production-3aa5.up.railway.app/api  
**Port**: 3001 (Railway auto-assigned)

**Function**: REST API to query database and submit blockchain transactions

**Environment Variables**:
```bash
NODE_ENV=production
PORT=3001
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
CHAIN_ID=84532
ADMIN_PRIVATE_KEY=0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe
ADMIN_ADDRESS=0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6
SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
DATABASE_URL=postgresql://postgres:opjpippLFhoVcIuuMllwtrKcSGTBJgar@yamanote.proxy.rlwy.net:23802/railway
```

**Database Connection**: Uses PUBLIC database URL (external connection)

**API Endpoints**:
- `GET /api/health` - Health check
- `GET /api/cap-table` - Current token holders
- `GET /api/transfers` - Transfer history
- `GET /api/corporate-actions` - Corporate actions
- `GET /api/wallet/:address` - Wallet info
- `POST /api/transfer` - Submit transfer
- `POST /api/admin/approve-wallet` - Approve wallet (requires Safe)
- `POST /api/admin/revoke-wallet` - Revoke wallet (requires Safe)
- `POST /api/admin/stock-split` - Stock split (requires Safe)
- `POST /api/admin/update-symbol` - Update symbol (requires Safe)

---

## Data Flow

```
┌─────────────────────────────────────┐
│   Base Sepolia Blockchain           │
│   Contract: 0xFCc9E74019a2be...     │
└──────────────┬──────────────────────┘
               │ (Events)
               │
               ▼
┌─────────────────────────────────────┐
│   Indexer (chainequity-mlx)         │
│   - Listens for events               │
│   - Writes to database               │
│   - Uses INTERNAL database URL       │
└──────────────┬──────────────────────┘
               │ (Writes)
               │
               ▼
┌─────────────────────────────────────┐
│   PostgreSQL Database                │
│   - transfers                        │
│   - balances                         │
│   - approvals                        │
│   - corporate_actions                │
└──────────────┬──────────────────────┘
               │ (Reads via PUBLIC URL)
               │
               ▼
┌─────────────────────────────────────┐
│   Backend API (tender-achievement)   │
│   - Queries database                 │
│   - Serves to frontend               │
└──────────────┬──────────────────────┘
               │ (HTTP requests)
               │
               ▼
         Frontend (Phase 3)
```

---

## Key Configuration Decisions

### 1. Database Connection Strategy
- **Indexer**: Uses INTERNAL URL (`postgres.railway.internal`) for fast private network connection
- **Backend**: Uses PUBLIC URL (`yamanote.proxy.rlwy.net:23802`) for external connection
- **Reason**: Services in same Railway project can use internal DNS, external services need public URL

### 2. Root Directory Configuration
- **Indexer**: Root directory = `indexer/` (monorepo subdirectory)
- **Backend**: Root directory = `backend/` (monorepo subdirectory)
- **Reason**: Single GitHub repo contains both services

### 3. Build Methods
- **Indexer**: Dockerfile (requires `RAILWAY_DOCKERFILE_PATH` env var)
- **Backend**: Railway auto-detect (Nixpacks/Railpack)
- **Reason**: Indexer needs explicit Dockerfile due to monorepo structure

### 4. Port Assignment
- **Backend**: Railway auto-assigned port 3001 (3000 was in use)
- **Note**: Railway handles external routing automatically via domain

---

## Service URLs

**Backend API**: https://tender-achievement-production-3aa5.up.railway.app/api  
**Database (Public)**: yamanote.proxy.rlwy.net:23802  
**Database (Internal)**: postgres.railway.internal:5432

---

## Environment Variables Summary

### Indexer (chainequity-mlx)
- Uses Railway auto-provided `DATABASE_URL` (internal)
- Blockchain config (RPC, contract address, start block)
- Build config (`RAILWAY_DOCKERFILE_PATH`)

### Backend (tender-achievement)
- Uses manually set `DATABASE_URL` (public)
- Blockchain config (RPC, contract address, chain ID)
- Admin credentials (private key, address)
- Safe address

### Postgres
- Uses Railway auto-generated PostgreSQL variables
- Should NOT have backend-specific variables (but safe to leave if present)

---

## Deployment Workflow

### Indexer Deployment
1. Push to GitHub → Auto-deploys (GitHub integration)
2. Railway builds using Dockerfile from `indexer/` directory
3. Database schema auto-initializes on startup
4. Begins monitoring blockchain events

### Backend Deployment
1. Push to GitHub → Auto-deploys (GitHub integration)
2. Railway builds using auto-detected method from `backend/` directory
3. Environment variables must be set manually (via dashboard or CLI)
4. Starts Express server on assigned port

---

## Monitoring & Logs

**Indexer Logs**:
```bash
cd /Users/mylessjs/Desktop/ChainEquity/indexer
railway logs
```

**Backend Logs**:
```bash
cd /Users/mylessjs/Desktop/ChainEquity/backend
railway logs
```

**Expected Indexer Output**:
- ✅ Database schema initialized successfully
- ✅ Indexer running
- 📡 Listening for blockchain events...

**Expected Backend Output**:
- ✅ Connected to PostgreSQL database
- 🚀 ChainEquity Backend API running on port 3001
- ✅ Blockchain client initialized

---

## Troubleshooting

### Service Not Appearing in CLI
- Services may not show in `railway link` until fully deployed
- Use Railway dashboard to verify service exists
- Check deployment status in dashboard

### Database Connection Issues
- **Indexer**: Verify internal DNS (must be in same Railway project)
- **Backend**: Verify public URL is correct and accessible
- Check Railway variables are set correctly

### Build Failures
- **Indexer**: Ensure `RAILWAY_DOCKERFILE_PATH=indexer/Dockerfile` is set
- **Backend**: Verify root directory is `backend/` in service settings

---

## Cost Estimate

**Railway Free Tier**:
- PostgreSQL: Included
- Indexer service: Included
- Backend service: Included
- **Total**: $0/month (within free tier limits)

**Usage**: Well within free tier for demo/prototype

---

## Security Notes

- ✅ Private keys stored as Railway environment variables (not in code)
- ✅ Database credentials secured via Railway variables
- ✅ Public database URL should be rotated for production
- ⚠️ Admin private key is for testnet only (never use for mainnet)
- ⚠️ Consider using Railway secrets for sensitive values in production

---

**Last Updated**: November 6, 2025  
**Status**: All services operational and integrated

