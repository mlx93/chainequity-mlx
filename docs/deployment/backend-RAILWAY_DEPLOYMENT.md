# Backend Railway Deployment Guide

**Status**: Ready to deploy  
**Backend Location**: `/Users/mylessjs/Desktop/ChainEquity/backend`  
**Target Project**: `superb-trust` (Railway)

---

## Step 1: Link Railway Project (Manual - Requires Interactive Input)

```bash
cd /Users/mylessjs/Desktop/ChainEquity/backend
railway link
```

**When prompted**:
1. Select workspace: **mlx93's Projects**
2. Select project: **superb-trust**
3. Create new service OR select existing backend service:
   - If creating new: Name it `backend` or `chainequity-backend`
   - If existing: Select the backend service

✅ **Expected Result**: Creates `.railway` file in backend directory

---

## Step 2: Set Environment Variables (Automated)

After linking, run:

```bash
# Option A: Use the deployment script
./deploy-to-railway.sh

# Option B: Set manually
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set BASE_SEPOLIA_RPC=https://sepolia.base.org
railway variables set CONTRACT_ADDRESS=0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
railway variables set CHAIN_ID=84532
railway variables set ADMIN_PRIVATE_KEY=0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe
railway variables set ADMIN_ADDRESS=0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6
railway variables set SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
railway variables set DATABASE_URL=postgresql://postgres:opjpippLFhoVcIuuMllwtrKcSGTBJgar@yamanote.proxy.rlwy.net:23802/railway
```

---

## Step 3: Deploy to Railway

```bash
railway up
```

This will:
- Build the TypeScript code
- Deploy to Railway
- Start the Express server

⏱️ **Expected Time**: 2-5 minutes

---

## Step 4: Get Service URL

```bash
railway domain
```

This will output your backend URL, e.g.:
- `https://chainequity-backend-production.up.railway.app`

**Save this URL** - you'll need it for Phase 3 (Frontend)!

---

## Step 5: Check Deployment Logs

```bash
railway logs
```

**Look for**:
```
🚀 ChainEquity Backend API running on port 3000
📡 Environment: production
⛓️  Network: Base Sepolia (Chain ID: 84532)
📜 Contract: 0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
✅ Connected to PostgreSQL database
```

If you see errors, check:
- Database connection errors → Verify DATABASE_URL
- Missing environment variables → Run `railway variables` to check
- Build errors → Check Railway build logs

---

## Step 6: Test Endpoints

### 6.1 Health Check
```bash
# Replace [YOUR_URL] with your Railway domain
curl https://[YOUR_URL]/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T...",
  "blockchain": {
    "connected": true,
    "chainId": 84532,
    "blockNumber": 33318XXX
  },
  "database": {
    "connected": true
  }
}
```

### 6.2 Cap Table
```bash
curl https://[YOUR_URL]/api/cap-table
```

**Expected Response**:
```json
{
  "capTable": [
    {
      "address": "0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6",
      "balance": "10000000000000000000000000",
      "balanceFormatted": "10,000,000",
      "percentage": "100.00",
      "lastUpdated": "2025-11-06T..."
    }
  ],
  "totalSupply": "10000000000000000000000000",
  "totalHolders": 1,
  "timestamp": "2025-11-06T..."
}
```

### 6.3 Transfers
```bash
curl https://[YOUR_URL]/api/transfers?limit=10
```

### 6.4 Wallet Info
```bash
curl https://[YOUR_URL]/api/wallet/0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6
```

### 6.5 Test Transaction Submission (Requires testnet ETH)
```bash
curl -X POST https://[YOUR_URL]/api/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e",
    "amount": "1000000000000000000000"
  }'
```

**Expected Response** (if recipient is approved):
```json
{
  "success": true,
  "transactionHash": "0x...",
  "from": "0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6",
  "to": "0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e",
  "amount": "1000000000000000000000",
  "blockExplorerUrl": "https://sepolia.basescan.org/tx/0x...",
  "message": "Transfer submitted successfully",
  "timestamp": "2025-11-06T..."
}
```

---

## Troubleshooting

### Issue: Railway link fails with "No linked project"
**Solution**: Run `railway link` manually and follow prompts

### Issue: Environment variables not set
**Solution**: Run `railway variables` to verify, then set missing ones

### Issue: Database connection fails
**Check**:
- DATABASE_URL is correct (PUBLIC URL: yamanote.proxy.rlwy.net:23802)
- Password matches: `opjpippLFhoVcIuuMllwtrKcSGTBJgar`
- Railway PostgreSQL service is running

### Issue: Build fails
**Check**:
- `npm run build` works locally (we verified ✅)
- Railway build logs for specific errors
- TypeScript compilation errors

### Issue: Health endpoint returns 503
**Check**:
- `railway logs` for errors
- Database connection status
- Blockchain RPC connectivity

---

## Deployment Checklist

- [ ] Railway project linked (`.railway` file exists)
- [ ] All 9 environment variables set
- [ ] Deployment successful (`railway up` completed)
- [ ] Service URL obtained (`railway domain`)
- [ ] GET /api/health returns 200 with database:connected:true
- [ ] GET /api/cap-table returns data
- [ ] Database connection verified
- [ ] Service URL saved for Phase 3

---

## Next Steps After Successful Deployment

1. **Save Railway URL**:
   ```bash
   # Add to wallet-addresses.txt
   BACKEND_API_URL=https://[YOUR_URL]/api
   ```

2. **Test All Endpoints**:
   - Use Postman or curl to test all 10 endpoints
   - Verify database queries work
   - Test transaction submission

3. **Update Documentation**:
   - Add backend URL to Phase 3 prompt
   - Update activeContext.md with deployment status

4. **Generate Phase 3 Prompt**:
   - Use backend URL in frontend configuration
   - Include all endpoint examples

---

**Ready to deploy! Follow steps 1-6 above.** 🚀

