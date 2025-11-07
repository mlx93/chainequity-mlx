# ChainEquity - Deployment Addresses

**Network**: Base Sepolia Testnet (Chain ID: 84532)  
**Last Updated**: November 7, 2025

---

## Smart Contract

### GatedToken Contract

- **Address**: `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964`
- **Network**: Base Sepolia
- **Chain ID**: 84532
- **Deployment Block**: `33313307`
- **Deployment Transaction**: Available on Basescan
- **Explorer**: https://sepolia.basescan.org/address/0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
- **Contract Name**: GatedToken
- **Token Name**: ACME Corp Equity
- **Token Symbol**: ACME
- **Owner**: Gnosis Safe (see below)

---

## Gnosis Safe Multi-Signature Wallet

- **Address**: `0x6264F29968e8fd2810cB79fb806aC65dAf9db73d`
- **Network**: Base Sepolia
- **Threshold**: 2-of-3 signers required
- **Interface**: https://app.safe.global
- **Purpose**: Controls all admin functions on GatedToken contract

### Safe Signers

1. **Admin Wallet**: `0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6`
2. **Investor A**: `0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e`
3. **Investor B**: `0xefd94a1534959e04630899abdd5d768601f4af5b`

---

## Backend Services

### Backend API

- **URL**: https://tender-achievement-production-3aa5.up.railway.app
- **API Base**: https://tender-achievement-production-3aa5.up.railway.app/api
- **Health Check**: https://tender-achievement-production-3aa5.up.railway.app/api/health
- **Platform**: Railway
- **Service Name**: tender-achievement
- **Project**: superb-trust
- **Status**: ✅ Deployed and Running
- **Port**: 3001 (Railway auto-assigned)

### Event Indexer

- **Platform**: Railway
- **Service Name**: chainequity-mlx
- **Project**: superb-trust
- **Status**: ✅ Running 24/7
- **Database**: PostgreSQL (shared with backend)

### Database

- **Platform**: Railway PostgreSQL
- **Project**: superb-trust
- **Status**: ✅ Provisioned and Running
- **Connection**: Internal DNS for indexer, public URL for backend

---

## Frontend

### React Application

- **URL**: https://chainequity-mlx.vercel.app/
- **Platform**: Vercel
- **Repository**: https://github.com/mlx93/chainequity-mlx
- **Status**: ✅ Deployed
- **Build**: Vite production build
- **CDN**: Global edge network

---

## Test Wallets

### Admin Wallet

- **Address**: `0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6`
- **Purpose**: Admin operations, Safe signer
- **Balance**: 0.0125 ETH (Base Sepolia)
- **Status**: ✅ Funded

### Investor A

- **Address**: `0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e`
- **Purpose**: Test investor, Safe signer
- **Balance**: 0.0125 ETH (Base Sepolia)
- **Status**: ✅ Funded

### Investor B

- **Address**: `0xefd94a1534959e04630899abdd5d768601f4af5b`
- **Purpose**: Test investor, Safe signer
- **Balance**: 0.0125 ETH (Base Sepolia)
- **Status**: ✅ Funded

---

## RPC Endpoints

### Base Sepolia

- **Public RPC**: https://sepolia.base.org
- **Chain ID**: 84532
- **Block Explorer**: https://sepolia.basescan.org
- **Faucet**: Coinbase Base Sepolia Faucet

---

## GitHub Repository

- **URL**: https://github.com/mlx93/chainequity-mlx
- **Owner**: mlx93
- **Visibility**: Public
- **Auto-Deploy**: 
  - Frontend → Vercel (on push to main)
  - Backend/Indexer → Railway (on push to main)

---

## Verification Commands

### Verify Contract Deployment

```bash
# Check contract owner
cast call 0xFCc9E74019a2be5808d63A941a84dEbE0fC39964 \
  "owner()" \
  --rpc-url https://sepolia.base.org

# Expected: 0x6264F29968e8fd2810cB79fb806aC65dAf9db73d (Gnosis Safe)

# Check token symbol
cast call 0xFCc9E74019a2be5808d63A941a84dEbE0fC39964 \
  "symbol()" \
  --rpc-url https://sepolia.base.org

# Expected: "ACME"
```

### Verify Backend Health

```bash
curl https://tender-achievement-production-3aa5.up.railway.app/api/health

# Expected: {"status":"ok","timestamp":"...","blockchain":{"connected":true,...}}
```

### Verify Frontend

```bash
# Visit in browser
open https://chainequity-mlx.vercel.app/

# Or check with curl
curl -I https://chainequity-mlx.vercel.app/
# Expected: HTTP/2 200
```

---

## Security Notes

⚠️ **IMPORTANT**: These are testnet addresses only.

- Never use these wallets on mainnet with real funds
- Private keys should NEVER be committed to Git or shared publicly
- Testnet ETH has no real value
- All addresses are for demonstration purposes only

---

## Quick Links

- **Contract Explorer**: https://sepolia.basescan.org/address/0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
- **Gnosis Safe**: https://app.safe.global
- **Frontend**: https://chainequity-mlx.vercel.app/
- **Backend API**: https://tender-achievement-production-3aa5.up.railway.app/api
- **GitHub**: https://github.com/mlx93/chainequity-mlx

---

*Last Updated: November 7, 2025*

