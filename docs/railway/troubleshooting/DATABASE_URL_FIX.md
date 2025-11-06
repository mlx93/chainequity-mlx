# Database URL Format Fix

## Current Issue
Your DATABASE_URL is missing the port and database name:
```
postgresql://postgres:PASSWORD@postgres.railway.internal
```

## Correct Format
A PostgreSQL connection string needs the port (5432) and database name:
```
postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway
```

## Fix Steps

### Option 1: Update in Railway Dashboard
1. Go to Railway → Indexer service → Variables
2. Find `DATABASE_URL`
3. Update it to include port and database:
   ```
   postgresql://postgres:joxTPTOHVYlcpIYwyeBkSOFEgzDlSIKK@postgres.railway.internal:5432/railway
   ```
4. Save (Railway will auto-redeploy)

### Option 2: Use Railway CLI
```bash
cd indexer
railway variables set DATABASE_URL="postgresql://postgres:joxTPTOHVYlcpIYwyeBkSOFEgzDlSIKK@postgres.railway.internal:5432/railway"
```

## Why This Matters
- Without `:5432`, PostgreSQL defaults might not work in Railway's internal network
- Without `/railway`, it might connect to wrong database or fail

## Verify After Fix
After updating, check logs - you should see:
- ✅ Database schema initialized successfully
- No more ENOTFOUND errors

