# Railway Database Connection Fix

## Problem
Error: `getaddrinfo ENOTFOUND postgres.railway.internal`

The indexer can't resolve the database hostname, meaning DATABASE_URL isn't configured correctly.

## Solution Steps

### Step 1: Verify PostgreSQL Service Exists

1. Go to Railway dashboard
2. Check if you have a **PostgreSQL** service in the same project
3. If not, create one:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Wait for it to provision

### Step 2: Check Railway Auto-Provides DATABASE_URL

Railway **automatically** creates a `DATABASE_URL` environment variable when you add PostgreSQL and shares it with other services. Check:

1. Go to your **Indexer service** → **Variables** tab
2. Look for `DATABASE_URL` - it should be auto-provided (grayed out/purple icon)
3. If you see it, the value should already be correct

### Step 3: If DATABASE_URL Not Auto-Provided

If `DATABASE_URL` isn't automatically there:

1. Go to **PostgreSQL service** → **Variables** tab
2. Find `DATABASE_URL` variable
3. Copy its value (should show internal URL)
4. Go to **Indexer service** → **Variables** tab
5. Click **"New Variable"**
6. Name: `DATABASE_URL`
7. Value: Paste the URL from PostgreSQL service
8. **Important**: Use the URL that shows `postgres.railway.internal` (internal) not the public proxy URL
9. Save

### Step 4: Verify Connection String Format

The DATABASE_URL should look like:
```
postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway
```

NOT like:
```
postgresql://postgres:PASSWORD@proxy.rlwy.net:PORT/railway
```
(That's the public URL - only use for external services)

### Step 5: Make Sure Services Are in Same Project

Both Indexer and PostgreSQL must be in the **same Railway project** for internal hostname to work.

### Step 6: Redeploy After Setting Variables

After adding/updating DATABASE_URL:
1. Railway should auto-redeploy
2. Or trigger manual redeploy: Click "Deployments" → "Redeploy"

## Quick Fix Command (Railway CLI)

If you have Railway CLI:

```bash
cd indexer
railway link  # Link to your service

# Get DATABASE_URL from PostgreSQL service variables
# Then set it:
railway variables set DATABASE_URL="postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway"
```

## Troubleshooting

### Still Getting ENOTFOUND?

1. **Check project structure**: Both services must be in same project
2. **Try public URL temporarily**: Use `proxy.rlwy.net` URL to test if it's a DNS issue
3. **Check Railway status**: Ensure PostgreSQL service is running
4. **Contact Railway support**: If internal hostname still doesn't resolve

### Alternative: Use Public URL (Not Recommended)

If internal hostname won't work, you can use the public URL:
1. Get public URL from PostgreSQL → Connect tab
2. Set it as DATABASE_URL in Indexer service
3. This works but is less secure and slower

## Expected Result

After fixing DATABASE_URL:
- Indexer should connect successfully
- Logs should show: `✅ Database schema initialized successfully`
- No more `ENOTFOUND` errors


