# Immediate Fix: Force Railway to Use Dockerfile

## Quick Workaround (Works Right Now)

Since finding the Root Directory field can be tricky, use this environment variable method:

### Step 1: Go to Service Settings → Variables

1. Close Project Settings (click X)
2. Click on your **Indexer service** card (not the project)
3. Click **Variables** tab (or **Settings** → **Variables**)
4. Add these environment variables:

```
RAILWAY_DOCKERFILE_PATH=Dockerfile
NO_BUILDPACK=1
```

### Step 2: Verify Dockerfile Location

Make sure Railway can find your Dockerfile. Since root directory isn't set, Railway might look at repo root. Let's verify the path:

**Option A: If Railway scans from repo root**, create a symlink or copy:
```bash
# From repo root, create a Dockerfile that Railway can find
cd /Users/mylessjs/Desktop/ChainEquity
cp indexer/Dockerfile ./Dockerfile
cp indexer/railway.json ./railway.json  # Also copy railway.json
```

**Option B: Set the path relative to repo root**:
Set environment variable:
```
RAILWAY_DOCKERFILE_PATH=indexer/Dockerfile
```

### Step 3: Update railway.json at Repo Root

If Railway scans from repo root, create `railway.json` at repo root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "indexer/Dockerfile"
  }
}
```

### Step 4: Trigger Redeploy

```bash
git add .
git commit -m "Add Railway config at repo root"
git push origin main
```

## Why This Works

- `RAILWAY_DOCKERFILE_PATH` tells Railway explicitly where the Dockerfile is
- `NO_BUILDPACK=1` (if supported) disables Railpack detection
- Railway will use the Dockerfile at the specified path

## Better Long-Term Solution

Once you can find the Service Settings → Source → Root Directory:
1. Set it to `indexer`
2. Remove the repo-root Dockerfile copies
3. Keep just `indexer/Dockerfile` and `indexer/railway.json`

