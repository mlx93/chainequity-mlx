# Railway Project Mismatch Fix

## Problem Identified
- **Indexer service** is in project: `superb-trust`
- **PostgreSQL database** is in project: `lucid-strength`

Railway's internal hostname (`postgres.railway.internal`) **only works within the same project**.

## Solutions

### Option 1: Move PostgreSQL to Same Project (Recommended)

**Move PostgreSQL from `lucid-strength` to `superb-trust`:**

1. Go to Railway dashboard → Project `lucid-strength`
2. Find PostgreSQL service
3. **Option A - Delete & Recreate** (if no important data):
   - Delete PostgreSQL from `lucid-strength`
   - Go to project `superb-trust`
   - Click "New" → "Database" → "Add PostgreSQL"
   - Wait for provisioning
   - Railway will auto-create `DATABASE_URL` variable

4. **Option B - Migrate** (if you have data):
   - Export data from old PostgreSQL
   - Create new PostgreSQL in `superb-trust`
   - Import data
   - Update `DATABASE_URL` in indexer

### Option 2: Use Public URL (Temporary Workaround)

If you can't move services, use PostgreSQL's public URL:

1. Go to project `lucid-strength` → PostgreSQL service → **Connect** tab
2. Copy the **"Public Network"** URL
   - Format: `postgresql://postgres:PASSWORD@proxy.rlwy.net:PORT/railway`
3. Go to project `superb-trust` → Indexer service → **Variables**
4. Set `DATABASE_URL` to the public URL
5. Redeploy indexer

**Note**: Public URL works but:
- Less secure (exposed to internet)
- Slower than internal connection
- Requires firewall/authentication setup

## Recommended Action

**Move PostgreSQL to `superb-trust` project**:
- Railway will auto-provide `DATABASE_URL`
- Uses secure internal networking
- Better performance
- Standard Railway architecture pattern

## After Moving PostgreSQL

1. Railway will automatically create `DATABASE_URL` variable in indexer
2. Internal hostname will resolve correctly
3. Connection will use secure internal network
4. No code changes needed - just Railway configuration

## Verification

After fixing:
- Both services visible in same project (`superb-trust`)
- `DATABASE_URL` auto-provided (grayed/purple icon)
- Indexer connects successfully
- Logs show: `✅ Database schema initialized successfully`




