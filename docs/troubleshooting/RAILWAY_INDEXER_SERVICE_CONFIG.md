# Railway Indexer Service Configuration

## Current Issue: "The executable `cd` could not be found"

This error appears after clearing the root directory. Railway is trying to execute a command that references `cd`, which isn't needed for a Dockerfile build.

## Solution

Railway needs to know this service should use Dockerfile for deployment, not a build/start command.

### Check Railway Service Configuration

In Railway Dashboard for `chainequity-mlx` service:

1. Go to **Settings** tab
2. Check **Service Settings**:
   - **Build Method**: Should be "Dockerfile" (auto-detected from railway.json)
   - **Start Command**: Should be empty (Dockerfile CMD is used)
   - **Build Command**: Should be empty (Dockerfile handles build)

3. If you see any custom commands set:
   - **Clear the Start Command** field
   - **Clear the Build Command** field
   - Railway should use the Dockerfile CMD: `node dist/index.js`

4. Verify **railway.json** is being used:
   - With root directory empty, Railway should detect `indexer/railway.json`
   - This specifies: `"builder": "DOCKERFILE"` and `"dockerfilePath": "indexer/Dockerfile"`

### If Railway Isn't Detecting railway.json

Railway might not be detecting the `railway.json` in the subdirectory. Try:

**Option 1: Set Watch Paths**
- Settings → Deploy → Watch Paths
- Add: `indexer/**`

**Option 2: Copy railway.json to Root**
Copy the indexer/railway.json to the project root with updated path.

### Manual Redeploy

After clearing any incorrect commands:
1. Click **Deploy** → **Redeploy** in Railway dashboard
2. Or trigger via git push (which we already did)

## Expected Behavior

With correct configuration:
1. Railway detects `dockerfilePath: "indexer/Dockerfile"` from railway.json
2. Builds Docker image from indexer/Dockerfile
3. Runs container with CMD: `node dist/index.js`
4. Indexer starts monitoring blockchain events

## Check Current Configuration

```bash
# From local terminal, check what Railway sees:
cd indexer
railway variables
```

Look for any `RAILWAY_*` variables that might override the Dockerfile configuration.

