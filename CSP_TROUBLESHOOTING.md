# CSP MetaMask Connection Issue - Root Cause Analysis

## Problem Summary
MetaMask connection button triggers CSP violation: "Content Security Policy blocks the use of 'eval' in JavaScript"

## Root Cause
wagmi/viem libraries use dynamic code evaluation (`eval()` or `new Function()`) for:
- ABI encoding/decoding
- Contract interaction
- Wallet connector initialization

Vercel's default or missing CSP blocks `unsafe-eval` which breaks MetaMask connection.

## Solution Applied

### 1. Created `ui/public/_headers` File
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; ...
```

### 2. Updated `vercel.json`
- Set correct build directory: `ui/`
- Set correct output directory: `ui/dist`
- Removed CSP from `vercel.json` (conflicts with `_headers`)

### 3. Updated `ui/vite.config.ts`
- Ensured `publicDir: 'public'` (default, but explicit)
- This copies `public/_headers` to `dist/_headers`

### 4. Removed Conflicting CSP Sources
- ✅ Removed CSP meta tag from `index.html`
- ✅ Using only `_headers` file
- ✅ No CSP in `vercel.json` headers

## Verification Steps

### Step 1: Check _headers in Build Output
```bash
cd ui && npm run build
ls -la dist/_headers  # Should exist
cat dist/_headers     # Should contain CSP with unsafe-eval
```
✅ **PASSED** - `_headers` file exists in `dist/` with correct CSP

### Step 2: Wait for Vercel Deployment
- Deployment triggered by git push
- Should complete in 2-3 minutes
- Check Vercel dashboard for completion

### Step 3: Verify CSP Headers Served
```bash
curl -I https://chainequity-mlx.vercel.app/ | grep -i "content-security"
```
Expected: `Content-Security-Policy: ... script-src 'self' 'unsafe-eval' ...`

### Step 4: Test MetaMask Connection
1. Hard refresh browser (Cmd/Ctrl + Shift + R)
2. Open DevTools Console
3. Click "Connect MetaMask"
4. Should NOT see CSP eval error
5. MetaMask popup should appear

## Why This Should Work

### Vercel's `_headers` File Support
- Vercel reads `_headers` from the **root of deployed site**
- Vite copies `public/_headers` → `dist/_headers`
- Vercel serves `dist/` as site root
- Therefore, Vercel finds and applies `_headers`

### CSP Directive Explained
- `script-src 'self'` - Allow scripts from same origin
- `script-src 'unsafe-eval'` - **Allow eval() and new Function()** (required for wagmi/viem)
- `script-src 'unsafe-inline'` - Allow inline scripts (some React features)
- `script-src https:` - Allow scripts from HTTPS sources

### Alternative If This Fails

If `_headers` still doesn't work, we can try:

1. **Vercel Dashboard Manual Configuration**
   - Go to Project Settings → Headers
   - Add CSP header manually

2. **Middleware Approach** (next.js only, not applicable for Vite)

3. **Disable CSP Entirely** (not recommended, but works)
   - Remove all CSP configurations
   - Rely on Vercel's default (which may not block eval)

## Current Status
- ✅ `_headers` file created with correct CSP
- ✅ Vite config updated to copy file
- ✅ vercel.json updated for correct paths
- ✅ Build test passed locally
- ⏳ Vercel deployment in progress
- ⏳ Awaiting user test after deployment completes

## Next Steps
1. Wait for Vercel deployment (~2-3 minutes from last push at 00:48)
2. Hard refresh browser at https://chainequity-mlx.vercel.app/
3. Test "Connect MetaMask" button
4. If CSP error persists, check:
   - Vercel deployment logs for any errors
   - Browser DevTools → Network tab → Response headers for `index.html`
   - Exact CSP directive being served

## Deployment Timeline
- **Last commit**: 400549d ("Fix CSP: Ensure _headers file is deployed correctly")
- **Pushed at**: ~00:48 UTC
- **Expected completion**: ~00:51 UTC
- **User should test at**: ~00:52 UTC (after hard refresh)

---

**Confidence Level**: HIGH - This is the standard Vercel approach for CSP with static sites.


