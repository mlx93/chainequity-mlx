# ChainEquity - Reproducible Setup Guide

**Version**: 1.0  
**Last Updated**: November 7, 2025

This guide provides step-by-step instructions to set up and run the ChainEquity prototype locally and deploy to production.

---

## Prerequisites

### Required Software

1. **Foundry** (for smart contracts)
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Node.js** v18 or higher
   ```bash
   node --version  # Should be >= 18
   ```

3. **Git**
   ```bash
   git --version
   ```

4. **MetaMask** browser extension (for wallet interactions)

5. **Railway CLI** (for deployment)
   ```bash
   npm install -g @railway/cli
   ```

6. **Vercel CLI** (optional, for frontend deployment)
   ```bash
   npm install -g vercel
   ```

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/mlx93/chainequity-mlx.git
cd chainequity-mlx
```

### Step 2: Install Dependencies

**Contracts**:
```bash
cd contracts
forge install
cd ..
```

**Indexer**:
```bash
cd indexer
npm install
cd ..
```

**Backend**:
```bash
cd backend
npm install
cd ..
```

**Frontend**:
```bash
cd ui
npm install
cd ..
```

### Step 3: Configure Environment Variables

Create `.env` files in each directory:

**`contracts/.env`**:
```bash
ADMIN_PRIVATE_KEY=0xYourPrivateKeyHere
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASESCAN_API_KEY=YourBasescanKeyHere  # Optional
SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
```

**`indexer/.env`**:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname  # Use PUBLIC URL for local
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
START_BLOCK=33313307
CHAIN_ID=84532
NODE_ENV=development
```

**`backend/.env`**:
```bash
ADMIN_PRIVATE_KEY=0xYourPrivateKeyHere
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
DATABASE_URL=postgresql://user:pass@host:5432/dbname  # Use PUBLIC URL
PORT=3000
NODE_ENV=development
CHAIN_ID=84532
```

**`ui/.env`**:
```bash
VITE_CONTRACT_ADDRESS=0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
VITE_SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
VITE_CHAIN_ID=84532
VITE_BACKEND_URL=http://localhost:3000/api  # For local dev
```

### Step 4: Run Services Locally

**Contracts** (compile & test):
```bash
cd contracts
forge build
forge test
forge test --gas-report
```

**Indexer** (requires database):
```bash
cd indexer
npm run build
npm run dev  # Starts indexer, processes events
```

**Backend** (requires database):
```bash
cd backend
npm run build
npm run dev  # Starts Express server on http://localhost:3000
```

**Frontend**:
```bash
cd ui
npm run dev  # Starts Vite dev server on http://localhost:5173
```

---

## Deployment Scripts

### Deploy Smart Contract

**Script**: `contracts/script/Deploy.s.sol`

```bash
cd contracts
forge script script/Deploy.s.sol \
    --rpc-url $BASE_SEPOLIA_RPC \
    --broadcast \
    --verify \
    --etherscan-api-key $BASESCAN_API_KEY
```

**Post-Deployment**:
1. Save contract address to all `.env` files
2. Transfer ownership to Gnosis Safe:
   ```bash
   cast send $CONTRACT_ADDRESS \
     "transferOwnership(address)" \
     $SAFE_ADDRESS \
     --rpc-url $BASE_SEPOLIA_RPC \
     --private-key $ADMIN_PRIVATE_KEY
   ```

---

### Deploy to Railway (Backend/Indexer)

**Backend Deployment**:
```bash
cd backend
./deploy-to-railway.sh
```

**Or Manual Railway Deployment**:
```bash
# Link Railway project
railway link

# Set environment variables (see deploy-to-railway.sh for list)
railway variables set KEY=VALUE

# Deploy
railway up
```

**Indexer Deployment**:
```bash
cd indexer
./deploy-to-railway.sh
```

**Or Manual Railway Deployment**:
```bash
# Link Railway project
railway link

# Set environment variables
railway variables set DATABASE_URL=<internal-url>
railway variables set BASE_SEPOLIA_RPC=https://sepolia.base.org
railway variables set CONTRACT_ADDRESS=0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
railway variables set START_BLOCK=33313307
railway variables set CHAIN_ID=84532

# Deploy
railway up
```

---

### Deploy Frontend to Vercel

**Option 1: Vercel CLI**:
```bash
cd ui
vercel --prod
```

**Option 2: GitHub Integration** (Recommended):
1. Connect GitHub repository to Vercel
2. Set Root Directory to `ui/`
3. Set Build Command to `npm run build`
4. Set Output Directory to `dist/`
5. Add environment variables in Vercel dashboard
6. Push to `main` branch triggers auto-deploy

**Environment Variables for Vercel**:
- `VITE_CONTRACT_ADDRESS`
- `VITE_SAFE_ADDRESS`
- `VITE_BASE_SEPOLIA_RPC`
- `VITE_CHAIN_ID`
- `VITE_BACKEND_URL`

---

## Database Setup

### Railway PostgreSQL

1. Create Railway project
2. Add PostgreSQL database service
3. Get connection URL from database service
4. Use **INTERNAL URL** for indexer (format: `postgres.railway.internal:5432`)
5. Use **PUBLIC URL** for backend (format: `*.proxy.rlwy.net:*`)

### Initialize Schema

The indexer auto-initializes the schema on startup. Alternatively, run:

```bash
cd indexer
npm run init-db
```

**Schema Tables**:
- `transfers` - All token transfer events
- `balances` - Current balance per wallet
- `approvals` - Wallet allowlist status
- `corporate_actions` - Stock splits, symbol changes, mints, burns

---

## Verification Steps

### 1. Verify Contract Deployment

```bash
# Check contract owner
cast call 0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e \
  "owner()" \
  --rpc-url https://sepolia.base.org

# Check token symbol
cast call 0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e \
  "symbol()" \
  --rpc-url https://sepolia.base.org
```

### 2. Verify Backend Health

```bash
curl https://your-backend.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "blockchain": {
    "connected": true,
    "chainId": 84532,
    "blockNumber": 12345678
  },
  "database": {
    "connected": true
  }
}
```

### 3. Verify Indexer

```bash
railway logs  # Check for "✅ Indexer running" message
```

### 4. Verify Frontend

1. Visit deployed URL
2. Connect MetaMask to Base Sepolia
3. Verify wallet connection works
4. Check that balances load correctly

---

## Troubleshooting

### Contract Deployment Fails

- **Issue**: Insufficient testnet ETH
- **Solution**: Fund wallet from Base Sepolia faucet

### Backend Can't Connect to Database

- **Issue**: Wrong DATABASE_URL format
- **Solution**: Use PUBLIC URL (not internal) for backend

### Indexer Not Processing Events

- **Issue**: Wrong START_BLOCK or CONTRACT_ADDRESS
- **Solution**: Verify contract address and deployment block

### Frontend Can't Connect Wallet

- **Issue**: Wrong network in MetaMask
- **Solution**: Add Base Sepolia network (Chain ID: 84532)

### Build Errors

- **Issue**: Node.js version mismatch
- **Solution**: Use Node.js v18 or higher

---

## Quick Start Commands

### Full Local Setup (One-Time)

```bash
# Clone and install
git clone https://github.com/mlx93/chainequity-mlx.git
cd chainequity-mlx
cd contracts && forge install && cd ..
cd indexer && npm install && cd ..
cd backend && npm install && cd ..
cd ui && npm install && cd ..

# Configure .env files (see Step 3 above)
# Then run services (see Step 4 above)
```

### Run All Tests

```bash
# Contract tests
cd contracts && forge test --gas-report && cd ..

# Backend tests (if available)
cd backend && npm test && cd ..

# Frontend tests (if available)
cd ui && npm test && cd ..
```

---

## Production Deployment Checklist

- [ ] Smart contract deployed and verified
- [ ] Ownership transferred to Gnosis Safe
- [ ] Railway database provisioned
- [ ] Indexer deployed and running
- [ ] Backend deployed and health check passing
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] All services connected and communicating
- [ ] Test transactions successful
- [ ] Documentation updated with deployment addresses

---

## Support

For issues or questions:
- Check `docs/troubleshooting/` for common problems
- Review `docs/railway/` for Railway-specific issues
- See `TECHNICAL_DECISIONS.md` for architectural rationale

---

*Last Updated: November 7, 2025*

