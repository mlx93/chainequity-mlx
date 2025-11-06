# Action Plan: Fix Railway Dockerfile Issue

## Current Situation
- You're looking at **Project Settings** (wrong level)
- Root directory field is at **Service Settings** level
- GitHub auto-deploys are connected

## Three Options (Pick One)

### ✅ Option 1: Navigate to Service Settings (Best Long-Term)

1. Close Project Settings modal
2. Click your **Indexer service** (the card/name, not the project)
3. Click **Settings** tab
4. Look for **Source** section → **Root Directory**
5. Set to: `indexer`
6. Save

**If Root Directory not visible**: Use Option 2

---

### ✅ Option 2: Environment Variable (Immediate Fix)

1. Close Project Settings modal  
2. Click **Indexer service** → **Variables** tab
3. Add variable:
   - Name: `RAILWAY_DOCKERFILE_PATH`
   - Value: `indexer/Dockerfile`
4. Save
5. Push to trigger deploy:
   ```bash
   git commit --allow-empty -m "Configure Railway Dockerfile path"
   git push origin main
   ```

---

### ✅ Option 3: Copy Config to Repo Root (Workaround)

If Railway scans from repo root, temporarily copy files:

```bash
cd /Users/mylessjs/Desktop/ChainEquity
cp indexer/Dockerfile ./Dockerfile
cp indexer/railway.json ./railway.json
git add Dockerfile railway.json
git commit -m "Add Railway config at repo root for auto-detection"
git push origin main
```

Then later, once root directory is set, remove these copies.

---

## Which to Choose?

- **Can't find Service Settings?** → Use Option 2 (Environment Variable)
- **Found Service Settings but no Root Directory field?** → Use Option 2
- **Want quick fix now?** → Use Option 2, then try Option 1 later
- **Railway keeps ignoring config?** → Use Option 3 as temporary workaround

## Verification

After applying any option:
1. Push a commit to trigger deployment
2. Watch Railway logs: `railway logs -f`
3. Should see: `Building Docker image...` or `Step 1/X : FROM node:18-alpine`
4. Should NOT see: `Detected Node.js... Using Railpack...`

