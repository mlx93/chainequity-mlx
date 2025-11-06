# Fix Railway Postgres Service Variables

## Issue
Backend-specific environment variables were incorrectly set on the Postgres service:
- ADMIN_PRIVATE_KEY
- ADMIN_ADDRESS  
- SAFE_ADDRESS
- BASE_SEPOLIA_RPC
- CONTRACT_ADDRESS
- CHAIN_ID
- NODE_ENV
- PORT
- DATABASE_URL (overwritten with public URL)

## Impact
**Good News**: Postgres service itself uses Railway's auto-generated variables (PGHOST, PGPASSWORD, PGUSER, PGPORT), so it's still working correctly. These extra variables won't hurt Postgres, but they shouldn't be there.

**Note**: DATABASE_URL on Postgres service isn't actually used by Postgres itself - it's used by services that CONNECT to Postgres.

## Fix Option 1: Via Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**: https://railway.app/project/superb-trust
2. **Click on Postgres service**
3. **Click "Variables" tab**
4. **Delete these variables** (they don't belong on Postgres):
   - ADMIN_PRIVATE_KEY
   - ADMIN_ADDRESS
   - SAFE_ADDRESS
   - BASE_SEPOLIA_RPC
   - CONTRACT_ADDRESS
   - CHAIN_ID
   - NODE_ENV
   - PORT
   - DATABASE_URL (unless Railway requires it - but it should auto-generate)

**Keep these** (Railway auto-generated):
   - PGHOST ✅
   - PGPASSWORD ✅
   - PGUSER ✅
   - PGPORT ✅
   - POSTGRES_DB ✅
   - All RAILWAY_* variables ✅

## Fix Option 2: Leave As-Is

Since Postgres doesn't actually use these variables, you can leave them. They'll just be ignored. The important thing is to set up the backend service correctly.

## Next: Set Up Backend Service Correctly

1. **In Railway Dashboard**: https://railway.app/project/superb-trust
2. **Click "+ New" → "GitHub Repo"**
3. **Select**: `chainequity-mlx` repository
4. **Configure**:
   - **Root Directory**: `backend` (important!)
   - **Build Command**: (auto-detected) `npm install && npm run build`
   - **Start Command**: (auto-detected) `npm start`
5. **Set Environment Variables** on the NEW backend service:
   - NODE_ENV=production
   - PORT=3000
   - BASE_SEPOLIA_RPC=https://sepolia.base.org
   - CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
   - CHAIN_ID=84532
   - ADMIN_PRIVATE_KEY=0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe
   - ADMIN_ADDRESS=0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6
   - SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
   - DATABASE_URL=postgresql://postgres:opjpippLFhoVcIuuMllwtrKcSGTBJgar@yamanote.proxy.rlwy.net:23802/railway (PUBLIC URL for backend)

6. **Deploy** - Railway will auto-deploy from GitHub

## Verify Postgres Variables (After Cleanup)

The Postgres service should only have:
- Railway auto-generated variables (PGHOST, PGPASSWORD, etc.)
- RAILWAY_* variables
- POSTGRES_* variables

**No backend variables** (ADMIN_PRIVATE_KEY, CONTRACT_ADDRESS, etc.)

