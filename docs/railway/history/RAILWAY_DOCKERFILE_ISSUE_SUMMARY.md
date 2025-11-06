# Railway Dockerfile Issue Summary

## Problem Description

We have a TypeScript Node.js indexer application deployed on Railway that needs to use a Dockerfile for building, but Railway keeps forcing Railpack instead of respecting our Dockerfile configuration. Despite having a `railway.json` file explicitly configured with `"builder": "DOCKERFILE"` and `"dockerfilePath": "Dockerfile"`, Railway ignores this configuration and attempts to use Railpack for every deployment. The service is connected via GitHub (auto-deploys on push), and we've verified that both `Dockerfile` and `railway.json` exist in the repository at `indexer/Dockerfile` and `indexer/railway.json`. When Railway uses Railpack, it fails with "Error creating build plan with Railpack" and "⚠ Script start.sh not found", even though we've created `start.sh`, `Procfile`, and `nixpacks.toml` files as fallbacks.

## Root Cause

**The service root directory is not configured correctly.** When Railway connects via GitHub auto-deploy, it scans from the repository root. Since our service lives in the `indexer/` subdirectory, Railway:
1. Doesn't find the Dockerfile at repo root
2. Detects Node.js files and defaults to Railpack
3. Ignores `indexer/railway.json` because it's not at the scanned root

## Solution

### Primary Fix: Set Root Directory in Railway Dashboard

1. Go to Railway dashboard → Your Indexer service → Settings
2. Find **Root Directory** field (may be under "Source" or "General" section)
3. Set it to: `indexer`
4. Save and redeploy

### Alternative Methods

If Root Directory option is not visible:
1. Disconnect and reconnect GitHub, specifying `indexer/` as the root during setup
2. Set environment variable: `RAILWAY_DOCKERFILE_PATH=Dockerfile`
3. Use Railway CLI: Run `indexer/fix-railway-root-directory.sh` script

### Verification

After fix, verify:
- Build logs show "Building Docker image..." or "Step 1/X : FROM node:18-alpine"
- Should NOT see "Detected Node.js... Using Railpack..."
- Build completes successfully
- Service starts correctly

## ✅ RESOLVED

**Status**: Successfully deployed and running as of November 5, 2025

### Final Solution Applied
1. Set environment variable: `RAILWAY_DOCKERFILE_PATH=indexer/Dockerfile`
2. Updated Dockerfile to use repo-root build context paths
3. Fixed `package-lock.json` sync issues
4. Moved PostgreSQL to same project for internal DNS resolution

### Deployment Status
- ✅ Dockerfile builds successfully
- ✅ Database schema initialized
- ✅ Indexer running and monitoring blockchain events
- ✅ Historical events backfilled
- ✅ Listening for new events

## Documentation

See `indexer/RAILWAY_DOCKERFILE_FIX.md` for detailed troubleshooting steps and all available methods.
See `RAILWAY_DEPLOYMENT_SUCCESS.md` for deployment completion details.

