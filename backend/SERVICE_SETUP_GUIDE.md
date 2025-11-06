# Railway Backend Service Setup

## Issue
The backend is currently linked to the "Postgres" service, but we need a separate backend service.

## Solution: Create Backend Service via Railway Dashboard

1. **Go to Railway Dashboard**: https://railway.app/project/superb-trust

2. **Check if Backend Service Already Exists**:
   - Look for a service named "backend" or "chainequity-backend"
   - If it exists, click on it

3. **If No Backend Service Exists, Create One**:
   - Click "+ New" in your project
   - Select "GitHub Repo"
   - Choose the `chainequity-mlx` repository
   - Railway will create a new service

4. **Configure Backend Service**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Set all variables (we already set them, but verify)

5. **Deploy**:
   - Railway should auto-deploy
   - Or trigger manual deployment

## Alternative: Use Railway CLI (if supported)

If you can switch services via CLI:
```bash
railway unlink
railway link  # Select superb-trust project, then create new service
```

Then set variables and deploy again.

## Verify Backend Service

Once the backend service is created and deployed:
```bash
railway status  # Should show "Service: backend" or similar
railway domain  # Should show backend URL
railway logs    # Should show Express server logs, not Postgres
```

## Expected Backend Logs

When viewing the correct backend service logs, you should see:
```
🚀 ChainEquity Backend API running on port 3000
📡 Environment: production
⛓️  Network: Base Sepolia (Chain ID: 84532)
📜 Contract: 0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
✅ Connected to PostgreSQL database
```

**NOT** PostgreSQL initialization logs (which is what we're seeing now).

