# Railway Indexer Fix - Root Directory Issue

## Problem
Railway deployment failing with: "Dockerfile `Dockerfile` does not exist"
**Root Cause**: Root directory was accidentally set to `indexer` instead of leaving it empty or checking the Dockerfile path.

## Solution

### Option 1: Fix Root Directory (Recommended)
In Railway Dashboard:
1. Go to `chainequity-mlx` service → Settings → General
2. **Clear** the Root Directory field (leave empty)
3. The `railway.json` in the `indexer/` directory specifies `dockerfilePath: "Dockerfile"`
4. Railway will find the Dockerfile at `indexer/Dockerfile` automatically
5. Save and redeploy

### Option 2: Set Correct Root Directory
If Railway requires a root directory:
1. Set Root Directory to: `indexer`
2. Railway will build from `indexer/` directory
3. Dockerfile will be found at `indexer/Dockerfile`

### Option 3: Update railway.json
If the Dockerfile path needs adjustment, update `indexer/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "indexer/Dockerfile"  // Update if needed
  }
}
```

## Verify Configuration
After fixing, check:
```bash
cd indexer
railway variables
# Should show:
# RAILWAY_DOCKERFILE_PATH=indexer/Dockerfile (or empty if using railway.json)
```

## Current Status
- Service: `chainequity-mlx`
- Project: `superb-trust`
- Root Directory: Currently incorrectly set to `indexer` → Should be empty or `indexer/`
- Dockerfile Location: `indexer/Dockerfile` (exists ✅)

