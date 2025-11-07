# Set Backend Service Root Directory

## Service: tender-achievement (in superb-trust project)

## Method 1: Via Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**: https://railway.app/project/superb-trust
2. **Click on "tender-achievement" service**
3. **Go to "Settings" tab**
4. **Find "Root Directory" setting**
5. **Set Root Directory to**: `backend`
6. **Save changes**

Railway will automatically detect:
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

## Method 2: Via Railway Service Settings

If Root Directory isn't visible in Settings:
1. Go to service **"Settings"**
2. Look for **"Source"** or **"Build"** section
3. Set **"Root Directory"** or **"Working Directory"** to `backend`

## Method 3: Create railway.json (Alternative)

I've created `/Users/mylessjs/Desktop/ChainEquity/railway.json` which tells Railway:
- Start command: `cd backend && npm start`

But the **Root Directory** setting in dashboard is still the best way.

## Verify Configuration

After setting root directory:
1. Railway will redeploy automatically
2. Check logs - should show backend compilation
3. Should see: `🚀 ChainEquity Backend API running on port 3000`

## Link Local CLI to Backend Service

After configuring, link your local CLI to the backend service:

```bash
cd /Users/mylessjs/Desktop/ChainEquity/backend
railway unlink
railway link
# Select: superb-trust
# Select: tender-achievement (NOT Postgres!)
```

Then set environment variables:
```bash
railway variables --set NODE_ENV=production
railway variables --set PORT=3000
railway variables --set BASE_SEPOLIA_RPC=https://sepolia.base.org
railway variables --set CONTRACT_ADDRESS=0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
railway variables --set CHAIN_ID=84532
railway variables --set ADMIN_PRIVATE_KEY=0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe
railway variables --set ADMIN_ADDRESS=0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6
railway variables --set SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
railway variables --set DATABASE_URL=postgresql://postgres:opjpippLFhoVcIuuMllwtrKcSGTBJgar@yamanote.proxy.rlwy.net:23802/railway
```

