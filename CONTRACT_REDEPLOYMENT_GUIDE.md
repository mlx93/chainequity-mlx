# Contract Redeployment - Configuration Update Guide

## ✅ NEW CONTRACT DEPLOYED

**New Contract Address**: `0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e`  
**Owner**: `0x4F10f93E2B0F5fAf6b6e5A03E8E48f96921D24C6` (Admin wallet) ✅  
**Network**: Base Sepolia (Chain ID: 84532)  
**Deployment Block**: [See below]  
**Block Explorer**: https://sepolia.basescan.org/address/0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e

---

## IMMEDIATE ACTIONS REQUIRED

### 1. Update Backend (Railway)

Go to Railway dashboard → `tender-achievement` service → Variables:

```
CONTRACT_ADDRESS=0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
```

**Then**: Redeploy the backend service (it will pick up the new env var)

### 2. Update Indexer (Railway)

Go to Railway dashboard → `chainequity-mlx` service → Variables:

```
CONTRACT_ADDRESS=0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
START_BLOCK=[DEPLOYMENT_BLOCK_NUMBER]
```

**Then**: Redeploy the indexer service

### 3. Update Frontend (Vercel)

The frontend has a default contract address. Check if it needs updating:

Go to Vercel dashboard → `chainequity-mlx` project → Settings → Environment Variables:

```
VITE_CONTRACT_ADDRESS=0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
```

**Then**: Redeploy from Vercel dashboard or push to GitHub (auto-deploys)

### 4. Update Local Files

Update `wallet-addresses.txt`:

```
## Smart Contract (NEW - 2025-11-06)
Contract Address: 0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
Owner: Admin Wallet (0x4f10...24C6)
Deployment Block: [BLOCK_NUMBER]
Network: Base Sepolia
```

---

## VERIFICATION STEPS

### Step 1: Verify Contract Owner

```bash
cast call 0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e "owner()" --rpc-url https://sepolia.base.org
```

Should return: `0x0000000000000000000000004f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6`

### Step 2: Test Backend API

```bash
curl -s "https://tender-achievement-production-3aa5.up.railway.app/api/health" | jq '.'
```

Should show new contract address in response.

### Step 3: Test Approval (Should Work Now!)

```bash
curl -s -X POST "https://tender-achievement-production-3aa5.up.railway.app/api/admin/approve-wallet" \
  -H "Content-Type: application/json" \
  -d '{"address":"0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e"}' | jq '.'
```

Should return transaction hash (not an error) ✅

### Step 4: Test Frontend

1. Go to https://chainequity-mlx.vercel.app/
2. Connect Admin wallet
3. Try approving Investor A
4. Should work! ✅

---

## OLD vs NEW Contract

| Property | Old Contract | New Contract |
|----------|-------------|--------------|
| Address | `0xFCc9...9964` | `0xd7Eb...7A5e` |
| Owner | Empty Safe (❌ broken) | Admin Wallet (✅ works) |
| Status | Unusable | ✅ Ready |

---

## NEXT STEPS (In Order)

1. ✅ Deploy script updated
2. ✅ New contract deployed
3. ⏳ Update Railway backend env var
4. ⏳ Update Railway indexer env var
5. ⏳ Update Vercel frontend env var (if needed)
6. ⏳ Redeploy all services
7. ⏳ Test approving a wallet
8. ⏳ Continue with manual testing guide

---

## Railway Update Instructions (Detailed)

### Update Backend:
1. Go to https://railway.app/dashboard
2. Select `superb-trust` project
3. Click `tender-achievement` service
4. Click "Variables" tab
5. Find `CONTRACT_ADDRESS` variable
6. Click edit → Change to `0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e`
7. Click "Deploy" (top right) to redeploy with new config

### Update Indexer:
1. Still in `superb-trust` project
2. Click `chainequity-mlx` service
3. Click "Variables" tab
4. Update `CONTRACT_ADDRESS` → `0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e`
5. Update `START_BLOCK` → [deployment block number from verification]
6. Click "Deploy" to redeploy

Wait 1-2 minutes for services to restart, then test!

---

## Demo Narration Note

For the demo video, you can say:

> "The contract owner is the admin wallet. In production, ownership would be transferred to a Gnosis Safe multi-signature wallet requiring 2-of-3 signatures, but for demo purposes we're using direct signing to show the functionality more clearly."

This is completely acceptable for a technical demo.

---

✅ **You're now ready to test the UI!**

