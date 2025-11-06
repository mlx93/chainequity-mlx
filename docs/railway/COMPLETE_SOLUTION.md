# Railway Deployment - Complete Solution Guide

**Date**: November 5, 2025  
**Status**: ✅ Fully Deployed and Operational

## Executive Summary

Successfully deployed ChainEquity Event Indexer to Railway with Dockerfile build, PostgreSQL database integration, and GitHub auto-deployment. Resolved multiple deployment issues including Dockerfile detection, build context paths, package synchronization, and database connectivity.

---

## Final Architecture

### Railway Project: `superb-trust`
- **Indexer Service**: `chainequity-mlx`
  - GitHub repo: `chainequity-mlx`
  - Auto-deploys on push to `main` branch
  - Uses Dockerfile for builds
  - Running and monitoring blockchain events
  
- **PostgreSQL Database**: Auto-provisioned in same project
  - Tables: `approvals`, `balances`, `corporate_actions`, `transfers`
  - Auto-provides `DATABASE_URL` to indexer service
  - Internal networking enabled

### Contract Monitored
- **Address**: `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964`
- **Chain**: Base Sepolia (Chain ID: 84532)
- **Start Block**: 33313307

---

## Issues Encountered and Resolutions

### Issue 1: Railway Ignoring Dockerfile (Using Railpack Instead)

**Problem**: Railway forced Railpack build instead of Dockerfile, causing build failures.

**Root Cause**: Railway scans from repo root, but service code is in `indexer/` subdirectory.

**Solution**:
1. Set environment variable: `RAILWAY_DOCKERFILE_PATH=indexer/Dockerfile`
2. Updated Dockerfile to use repo-root build context:
   ```dockerfile
   COPY indexer/package.json indexer/package-lock.json ./
   COPY indexer/ ./
   ```

**Files Modified**:
- `indexer/Dockerfile` - Updated COPY paths for monorepo structure
- Railway service variables - Added `RAILWAY_DOCKERFILE_PATH`

---

### Issue 2: Package Lock File Out of Sync

**Problem**: `npm ci` failed with version mismatches between `package.json` and `package-lock.json`.

**Root Cause**: `package-lock.json` was ignored by `.gitignore` and contained outdated versions.

**Solution**:
1. Updated `.gitignore` to allow `indexer/package-lock.json`
2. Regenerated `package-lock.json` using `npm install`
3. Committed updated `package-lock.json` to repository

**Files Modified**:
- `.gitignore` - Added exception for `!/indexer/package-lock.json`
- `indexer/package-lock.json` - Regenerated and committed

---

### Issue 3: Database Connection Failure (ENOTFOUND)

**Problem**: Indexer couldn't resolve `postgres.railway.internal` hostname.

**Root Cause**: Services were in different Railway projects (`superb-trust` and `lucid-strength`), so internal DNS couldn't resolve.

**Solution**:
1. Added PostgreSQL database to `superb-trust` project (same as indexer)
2. Railway automatically provided `DATABASE_URL` variable
3. Internal hostname resolution now works correctly

**Key Learning**: Railway's internal DNS (`postgres.railway.internal`) only works within the same project.

---

## Complete Deployment Steps

### Prerequisites
- Railway account
- GitHub repository: `chainequity-mlx`
- PostgreSQL contract deployed at `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964`

### Step 1: Create Railway Project

1. Go to Railway dashboard → New Project
2. Connect GitHub repository: `chainequity-mlx`
3. Project name: `superb-trust`

### Step 2: Configure Indexer Service

1. Railway auto-creates service from GitHub connection
2. Go to service → **Variables** tab
3. Add environment variables:
   ```
   RAILWAY_DOCKERFILE_PATH=indexer/Dockerfile
   BASE_SEPOLIA_RPC=https://sepolia.base.org
   CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
   START_BLOCK=33313307
   CHAIN_ID=84532
   NODE_ENV=production
   ```

### Step 3: Add PostgreSQL Database

1. In same project, click **New** → **Database** → **Add PostgreSQL**
2. Wait for provisioning (~30 seconds)
3. Railway automatically:
   - Creates `DATABASE_URL` variable
   - Shares it with indexer service
   - Sets up internal networking

### Step 4: Verify Dockerfile Configuration

Ensure `indexer/Dockerfile` exists and has correct paths:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY indexer/package.json indexer/package-lock.json ./
RUN npm ci
COPY indexer/ ./
RUN npm run build
CMD ["node", "dist/index.js"]
```

### Step 5: Deploy

1. Push code to GitHub `main` branch
2. Railway automatically detects push and deploys
3. Monitor logs for successful startup

---

## Verification Checklist

After deployment, verify:

- [x] Build completes successfully (Dockerfile used, not Railpack)
- [x] Database schema initialized (4 tables created)
- [x] Indexer starts without errors
- [x] Historical events backfilled
- [x] Indexer monitoring for new events
- [x] Logs show: "✅ Indexer running"

---

## Database Schema

Successfully created tables:

1. **transfers** - All token transfer events
2. **balances** - Current token balances per address
3. **approvals** - Wallet approval/revocation events  
4. **corporate_actions** - Stock splits and symbol changes

---

## Environment Variables Reference

### Indexer Service Variables
```
RAILWAY_DOCKERFILE_PATH=indexer/Dockerfile
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
START_BLOCK=33313307
CHAIN_ID=84532
NODE_ENV=production
```

### Database Variables (Auto-Provided)
```
DATABASE_URL=postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway
```

**Note**: `DATABASE_URL` is automatically created and shared by Railway when PostgreSQL is added to the same project.

---

## Key Learnings and Best Practices

1. **Monorepo Dockerfiles**: Must account for subdirectory structure in COPY paths
2. **Package Lock Files**: Should be committed to ensure reproducible builds
3. **Railway Projects**: Services must be in same project for internal DNS
4. **Dockerfile Detection**: Use `RAILWAY_DOCKERFILE_PATH` env var for subdirectory Dockerfiles
5. **Service References**: Railway auto-provides database URLs when services are linked

---

## Troubleshooting Reference

See individual troubleshooting guides:
- `RAILWAY_DOCKERFILE_FIX.md` - Dockerfile detection issues
- `DATABASE_FIX.md` - Database connection problems
- `PROJECT_MISMATCH_FIX.md` - Cross-project connectivity

---

## Next Steps

1. ✅ **Phase 2B Complete** - Indexer deployed and running
2. 🚧 **Phase 2A Next** - Build Backend API to query database
3. 🚧 **Phase 3 Next** - Build Frontend UI

---

## Related Documentation

- `RAILWAY_DEPLOYMENT_SUCCESS.md` - Deployment completion report
- `RAILWAY_SERVICES.md` - Service configuration details
- `indexer/README.md` - Indexer service documentation

