# Set Backend Variables via Railway Dashboard

## Service: tender-achievement (Currently Building)

Since `tender-achievement` is still building and might not appear in Railway CLI yet, set variables via dashboard:

### Steps:

1. **Go to Railway Dashboard**: https://railway.app/project/superb-trust
2. **Click on "tender-achievement" service** (the one that's currently building)
3. **Click "Variables" tab**
4. **Click "+ New Variable"** and add each one:

   ```
   NODE_ENV = production
   PORT = 3000
   BASE_SEPOLIA_RPC = https://sepolia.base.org
   CONTRACT_ADDRESS = 0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
   CHAIN_ID = 84532
   ADMIN_PRIVATE_KEY = 0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe
   ADMIN_ADDRESS = 0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6
   SAFE_ADDRESS = 0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
   DATABASE_URL = postgresql://postgres:opjpippLFhoVcIuuMllwtrKcSGTBJgar@yamanote.proxy.rlwy.net:23802/railway
   ```

5. **Save each variable**

### After Build Completes:

Once the build finishes (check dashboard - should change from "Building" to "Deployed"), then:

```bash
cd /Users/mylessjs/Desktop/ChainEquity/backend
railway unlink
railway link
# Select: superb-trust
# Select: tender-achievement (should appear now after build completes)
```

Then verify variables are set correctly.

