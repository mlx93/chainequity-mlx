# Railway Internal DNS Resolution Fix

## Problem
`ENOTFOUND postgres.railway.internal` - The internal hostname isn't resolving.

## Root Cause
This happens when:
1. Services aren't in the same Railway project
2. PostgreSQL isn't properly linked/shared with the indexer service
3. Railway's internal DNS isn't configured correctly

## Solution Steps

### Step 1: Verify Both Services Are in Same Project

1. Go to Railway dashboard
2. Check the project name shown at the top (e.g., "superb-trust")
3. Verify BOTH services are listed:
   - Indexer service: `superb-trust` 
   - PostgreSQL service: `lucid-strength`
4. If they're in different projects, that's the problem!

### Step 2: Use Railway's Service Reference (Recommended)

Railway has a better way to reference services. Instead of hardcoding the hostname, use Railway's variable reference syntax.

1. Go to **Indexer service** (`superb-trust`) → **Variables** tab
2. Find or create `DATABASE_URL`
3. Instead of hardcoding, use Railway's service reference:
   ```
   ${{Postgres.DATABASE_URL}}
   ```
   Or if your PostgreSQL service is named `lucid-strength`:
   ```
   ${{lucid-strength.DATABASE_URL}}
   ```
4. Railway will automatically resolve this to the correct internal URL

### Step 3: Check PostgreSQL Service Connection

1. Go to **PostgreSQL service** (`lucid-strength`) → **Variables** tab
2. Verify `DATABASE_URL` exists there
3. Note the exact format - Railway should provide it automatically
4. It should include `postgres.railway.internal:5432/railway`

### Step 4: Verify Service Sharing

In Railway, when PostgreSQL is added:
- It should automatically create a `${{Postgres.DATABASE_URL}}` variable available to other services
- Check if this variable is available in your Indexer service variables list
- If yes, use that instead of hardcoding

### Step 5: Temporary Workaround - Use Public URL

If internal DNS still doesn't work, temporarily use the public URL to verify connectivity:

1. Get public URL from PostgreSQL → **Connect** tab
2. Format: `postgresql://postgres:PASSWORD@proxy.rlwy.net:PORT/railway`
3. Set this as `DATABASE_URL` in Indexer service (temporary test)
4. If this works, the issue is Railway's internal networking
5. Then revert back and fix the internal networking issue

## Railway Service Reference Variables

Railway supports these variable references:
- `${{Postgres.DATABASE_URL}}` - Auto-provided if PostgreSQL is an addon
- `${{SERVICE_NAME.DATABASE_URL}}` - Reference specific service's variable
- `${{SERVICE_NAME.PGHOST}}` - Get just the hostname
- `${{SERVICE_NAME.PGPORT}}` - Get just the port

## Alternative: Use Railway CLI to Link Services

```bash
cd indexer
railway link  # Link to indexer service

# Check available variables
railway variables

# Set using service reference (Railway CLI might support this)
railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'
```

## Verification Checklist

After fixing:
- [ ] Both services in same project
- [ ] DATABASE_URL uses service reference OR correct internal URL
- [ ] PostgreSQL service shows "shared" or "linked" status
- [ ] Indexer can resolve hostname
- [ ] Connection succeeds

## If Still Failing

1. **Contact Railway Support** - Internal DNS issues require Railway support
2. **Use Public URL** - As temporary workaround (less secure, slower)
3. **Recreate Services** - Sometimes recreating PostgreSQL in same project fixes DNS




