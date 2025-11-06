# Vercel Deployment Fix - Root Directory & Auto-Deploy

## Current Issues

1. ✅ Root Directory is set to `ui` (confirmed in dashboard)
2. ❌ `https://chainequity-mlx.vercel.app/` showing 404
3. ❌ MetaMask not detected on alternative URL
4. ⏳ Auto-deploy on git push needs verification

## Fixes Applied

### 1. MetaMask Detection ✅
- Updated `wagmi.ts` to only initialize connectors on client-side
- Updated `NotConnected.tsx` with client-side hydration check
- Added fallback MetaMask detection using `window.ethereum?.isMetaMask`

### 2. Vercel Configuration ✅
- Project linked: `chainequity-mlx`
- Environment variables set
- `vercel.json` created in `ui/` directory

## Remaining Actions Needed

### Verify Root Directory in Vercel Dashboard
1. Go to: https://vercel.com/mlxventures/chainequity-mlx/settings
2. Check: **Root Directory** = `ui` ✅ (You confirmed this is set)
3. Verify: **Build Command** = `npm run build` (should auto-detect)
4. Verify: **Output Directory** = `dist` (should auto-detect)
5. Save if any changes made

### Enable Auto-Deploy (if not enabled)
1. Go to: https://vercel.com/mlxventures/chainequity-mlx/settings/git
2. Verify: **Production Branch** = `main` ✅
3. Verify: **Auto-deploy** is enabled ✅
4. Should see: "Deploy automatically from this branch"

### Force Redeploy
If 404 persists after confirming root directory:
1. Go to: https://vercel.com/mlxventures/chainequity-mlx/deployments
2. Find latest deployment
3. Click "..." → **Redeploy**
4. Or push empty commit to trigger:
   ```bash
   git commit --allow-empty -m "Trigger Vercel redeploy"
   git push origin main
   ```

## Current Deployment URLs

- **Expected**: `https://chainequity-mlx.vercel.app/` (404 - needs redeploy after root directory fix)
- **Alternative**: `https://chainequity-mlx-mlx-ventures-mlxventures.vercel.app/` (works but MetaMask issue)

## MetaMask Detection Fix

The MetaMask detection issue should be resolved with:
1. ✅ Client-side connector initialization
2. ✅ Window.ethereum fallback check
3. ✅ Proper hydration handling

After redeploy, MetaMask should be detected correctly.

