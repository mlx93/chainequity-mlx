# Quick Fix: Railway Dockerfile Issue

## The Problem
Railway ignores Dockerfile and uses Railpack → build fails

## The Solution (2 minutes)

### Step 1: Navigate to SERVICE Settings (NOT Project Settings)

⚠️ **Important**: You need **Service Settings**, not Project Settings!

1. Open https://railway.app
2. Click on your **Project** (e.g., "superb-trust")
3. Click on your **Indexer service** (the service card, not the project)
4. Click **Settings** tab (should be visible at service level)
5. Look for **Source** section (may be at top or middle)
6. Find **Root Directory** field
7. Enter: `indexer` (without trailing slash)
8. Click **Save**

**Note**: If Root Directory is not visible in Service Settings, use the **Immediate Fix** below.

### Step 2: Alternative - Use Environment Variable (If Root Directory Not Visible)

If you can't find the Root Directory field:

1. Stay in **Service Settings** → **Variables** tab (or Settings → Variables)
2. Add environment variable:
   - Name: `RAILWAY_DOCKERFILE_PATH`
   - Value: `indexer/Dockerfile`
3. Save

This tells Railway where your Dockerfile is relative to repo root.

### Step 3: Trigger Redeploy

```bash
# Push empty commit to trigger deployment
git commit --allow-empty -m "Fix Railway root directory"
git push origin main
```

### Step 3: Verify

Watch Railway logs - you should see:
- ✅ `Building Docker image...` or `Step 1/X : FROM node:18-alpine`
- ❌ NOT `Detected Node.js... Using Railpack...`

## If Root Directory Option Not Visible

Run the helper script:
```bash
cd indexer
./fix-railway-root-directory.sh
```

Then manually set in Railway dashboard using these steps:
1. Disconnect GitHub integration
2. Reconnect GitHub integration
3. When prompted for root directory, specify `indexer`

## Environment Variable Fallback

If above doesn't work, set this in Railway service variables:
```
RAILWAY_DOCKERFILE_PATH=Dockerfile
```

## Still Not Working?

See `RAILWAY_DOCKERFILE_FIX.md` for comprehensive troubleshooting.

