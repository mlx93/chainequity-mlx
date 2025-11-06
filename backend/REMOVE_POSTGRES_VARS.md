# Remove Variables from Postgres Service

## Via Railway Dashboard (Recommended - Fastest)

1. Go to: https://railway.app/project/superb-trust
2. Click on **Postgres** service
3. Click **"Variables"** tab
4. Delete these variables (click X next to each):
   - ADMIN_PRIVATE_KEY
   - ADMIN_ADDRESS
   - SAFE_ADDRESS
   - BASE_SEPOLIA_RPC
   - CONTRACT_ADDRESS
   - CHAIN_ID
   - NODE_ENV
   - PORT
   - DATABASE_URL (unless Railway requires it - but Railway auto-generates PGHOST/PGPASSWORD/etc)

**Keep all Railway auto-generated variables**:
   - PGHOST ✅
   - PGPASSWORD ✅
   - PGUSER ✅
   - PGPORT ✅
   - POSTGRES_DB ✅
   - POSTGRES_PASSWORD ✅
   - POSTGRES_USER ✅
   - All RAILWAY_* variables ✅

This takes 2 minutes. Railway CLI doesn't support variable deletion.

