# Railway Dockerfile Configuration Fix

## Problem Summary
Railway ignores `railway.json` Dockerfile configuration and forces Railpack instead. This happens because:
1. **Root Directory Not Set**: Railway scans from repo root, not `indexer/` subdirectory
2. **GitHub Auto-Deploy**: When connected via GitHub, Railway needs explicit root directory configuration
3. **Railpack Override**: Railway defaults to Railpack when it detects Node.js, ignoring Dockerfile preference

## Solution: Set Service Root Directory

### Method 1: Railway Dashboard (Recommended)

1. Go to Railway dashboard: https://railway.app
2. Select your **Indexer** service
3. Click **Settings** tab
4. Scroll to **Source** section (or **Build** section)
5. Find **Root Directory** setting
6. Set it to: `indexer`
7. Save changes
8. Trigger a new deployment (push to GitHub or click "Redeploy")

### Method 2: Railway CLI

If dashboard doesn't show Root Directory option, use CLI:

```bash
cd indexer

# Login to Railway (if needed)
railway login

# Link to your service (if not already linked)
railway link

# Set root directory using Railway API via CLI
# Note: This may require using Railway's GraphQL API or updating service config
```

### Method 3: Railway Service Configuration File

Create or update `.railway` directory configuration (if Railway supports this):

**Option A: Use Environment Variable Override**

Add this to your Railway service environment variables:

```bash
RAILWAY_DOCKERFILE_PATH=Dockerfile
```

**Option B: Update railway.json with Root Directory**

Update `indexer/railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile",
    "rootDirectory": "."
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Note: The `rootDirectory` field might not be standard, but worth trying.

### Method 4: Force Docker Build with Environment Variables

Add these environment variables in Railway dashboard:

```bash
# Force Railway to use Docker
RAILWAY_DOCKERFILE_PATH=Dockerfile
RAILWAY_BUILD_COMMAND="docker build -t railway ."
```

### Method 5: Move Railway Config to Repo Root (Workaround)

If Railway absolutely won't respect `indexer/railway.json`, create a repo-root-level `railway.json` that points to the indexer:

**Create `railway.json` at repo root:**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "services": {
    "indexer": {
      "build": {
        "builder": "DOCKERFILE",
        "dockerfilePath": "indexer/Dockerfile"
      },
      "rootDirectory": "indexer"
    }
  }
}
```

Note: Railway may not support multi-service config like this, but it's worth trying.

## Step-by-Step Fix (Recommended Approach)

### Step 1: Verify Current Service Configuration

```bash
cd indexer
railway status
railway variables
```

### Step 2: Set Root Directory via Railway Dashboard

1. Open Railway dashboard
2. Navigate to your Indexer service
3. Go to **Settings** → **Source** (or **General**)
4. Look for **Root Directory** field
5. If visible, set to: `indexer`
6. If NOT visible, continue to Step 3

### Step 3: Use Railway CLI to Update Service Config

```bash
# Link to service (if not linked)
railway link

# Try to set root directory via Railway API
# Railway CLI might support this in newer versions
railway service --help
```

If Railway CLI doesn't support root directory directly:

### Step 4: Recreate Service with Correct Root Directory

**Option A: Disconnect and Reconnect GitHub**

1. In Railway dashboard → Service → Settings → Source
2. Click **Disconnect** GitHub
3. Click **Connect** GitHub again
4. This time, when selecting the repo, **manually specify Root Directory as `indexer`**
5. Railway should remember this setting

**Option B: Create Service from Indexer Directory Only**

If Railway supports deploying a specific subdirectory:

1. Create a new Railway service
2. Instead of connecting entire repo, connect `indexer/` subdirectory
3. Railway will automatically set root to that directory

### Step 5: Verify Dockerfile Detection

After setting root directory:

1. Push a small change to trigger deployment
2. Check Railway build logs
3. Look for: `Building Docker image...` or `Using Dockerfile...`
4. Should NOT see: `Detected Node.js... Using Railpack...`

### Step 6: Force Docker if Still Failing

If Railway still uses Railpack, add to Railway service environment variables:

```bash
NO_BUILDPACK=1
RAILWAY_DOCKERFILE_PATH=Dockerfile
```

Or create a `.railwayignore` file in `indexer/`:

```
# Force Railway to use Dockerfile
```

## Verification Checklist

After applying the fix, verify:

- [ ] Railway dashboard shows root directory set to `indexer/`
- [ ] Build logs show "Building with Dockerfile" (not "Using Railpack")
- [ ] Build succeeds without "Error creating build plan with Railpack"
- [ ] Service starts correctly with `node dist/index.js`
- [ ] No errors about missing `start.sh` or Procfile

## Alternative: Accept Railpack but Fix It

If you cannot force Dockerfile, make Railpack work:

1. Ensure `Procfile` exists in `indexer/` root:
   ```
   web: node dist/index.js
   ```

2. Ensure `start.sh` is executable and in correct location:
   ```bash
   chmod +x indexer/start.sh
   ```

3. Ensure `package.json` has correct start script:
   ```json
   "scripts": {
     "start": "node dist/index.js"
   }
   ```

4. Ensure build script exists:
   ```json
   "scripts": {
     "build": "tsc && npm run copy-files"
   }
   ```

## Why This Happens

Railway's GitHub integration:
- Scans repo root for `package.json` or `Dockerfile`
- If found at root → uses that directory as service root
- If not configured → defaults to Railpack for Node.js
- Monorepo structures need explicit **Root Directory** configuration

## Still Having Issues?

1. **Check Railway Service Logs**:
   ```bash
   railway logs
   ```

2. **Check Railway Service Settings**:
   - Verify environment variables are set
   - Check build/start commands aren't overriding Dockerfile

3. **Contact Railway Support**:
   - Railway dashboard → Help → Support
   - Reference this issue: "GitHub-connected service ignoring railway.json Dockerfile builder"

4. **Try Railway CLI Latest Version**:
   ```bash
   npm install -g @railway/cli@latest
   ```

## Success Indicators

You'll know it's working when:
- Build logs show: `Step 1/6 : FROM node:18-alpine`
- No Railpack detection messages
- Build completes successfully
- Service starts from Docker CMD




