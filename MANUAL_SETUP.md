# ChainEquity - Manual Setup Guide

This document covers manual setup steps for external services that cannot be automated through code. Follow these instructions before running the automated deployment scripts.

---

## Prerequisites

### **Required Accounts**
- GitHub account (for repository hosting)
- MetaMask wallet (or compatible Web3 wallet)
- Coinbase account (for Base Sepolia faucet access)
- Vercel account (for frontend hosting)
- Railway account (for backend/indexer hosting)

---

## 1. Base Sepolia Testnet Setup

### **Add Base Sepolia to MetaMask**

1. Open MetaMask browser extension
2. Click network dropdown (top center)
3. Click "Add Network" → "Add network manually"
4. Enter the following details:
   - **Network Name**: Base Sepolia
   - **RPC URL**: `https://sepolia.base.org`
   - **Chain ID**: `84532`
   - **Currency Symbol**: `ETH`
   - **Block Explorer**: `https://sepolia.basescan.org`
5. Click "Save"

### **Alternative Method**: Use Chainlist
1. Visit https://chainlist.org
2. Search for "Base Sepolia"
3. Click "Add to MetaMask" (auto-fills all details)

---

## 2. Test Wallet Creation & Funding

### **Create Three Test Wallets**

You'll need three separate wallets for the demo:
- **Admin Wallet**: Contract owner and Safe signer
- **Investor A Wallet**: First test investor
- **Investor B Wallet**: Second test investor

**Option A: Create New MetaMask Accounts**
1. Open MetaMask
2. Click account icon (top right)
3. Select "Create Account"
4. Name it "ChainEquity Admin"
5. Repeat for "Investor A" and "Investor B"
6. Save all three addresses (0x...) to a secure note

**Option B: Import Existing Wallets**
1. Use test wallets from development if you already have them
2. Click "Import Account" in MetaMask
3. Enter private key
4. Never use wallets with real funds on mainnet

### **Fund Wallets with Base Sepolia ETH**

1. Visit Coinbase Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. Sign in with Coinbase account (create one if needed)
3. Paste Admin wallet address
4. Complete any verification (captcha, etc.)
5. Click "Send me ETH"
6. Wait 1-2 minutes for funds to arrive (~0.5 ETH)
7. Repeat for Investor A and Investor B wallets
8. Verify all three wallets have ~0.5 ETH in MetaMask (switch to Base Sepolia network)

**Troubleshooting**:
- If faucet is rate-limited, try again in 24 hours
- Alternative faucets: Check Alchemy or QuickNode Base Sepolia faucets
- Minimum needed: 0.1 ETH per wallet (less than 0.05 ETH will be used in demo)

---

## 3. Gnosis Safe Multi-Sig Setup

### **Deploy Safe Contract**

1. Visit Safe App: https://app.safe.global
2. Click "Create new Safe"
3. Select network: **Base Sepolia**
4. Name your Safe: "ChainEquity Admin Safe"
5. Add signers (owners):
   - **Signer 1**: Admin wallet address (0xAAA...)
   - **Signer 2**: Create or use second address (0xCCC...)
   - **Signer 3**: Create or use third address (0xDDD...)
   
   **Note**: For demo purposes, you can use one of your investor wallets as signers 2 and 3 if needed

6. Set threshold: **2 of 3** (requires 2 signatures for any transaction)
7. Review configuration
8. Click "Create" → MetaMask popup → Confirm transaction (~$0.50 in gas)
9. Wait for deployment confirmation (30-60 seconds)
10. **SAVE THIS ADDRESS**: Copy Safe contract address (0x...)
11. Add this to your `.env` file as `SAFE_ADDRESS=0x...`

### **Fund the Safe** (Optional)
If you want the Safe itself to pay for transactions:
1. Send 0.1 ETH from Admin wallet to Safe address
2. This is optional - signers can pay individually

### **Test Safe Functionality**
1. In Safe dashboard, click "New Transaction"
2. Type: Send tokens
3. Recipient: Any address
4. Amount: 0.001 ETH
5. Click "Create" → Confirm with Signer 1
6. Notice "Awaiting confirmation (1/2)"
7. Switch MetaMask to Signer 2 → Confirm transaction
8. Transaction executes when 2/3 threshold reached

**Important**: The Safe address becomes the owner of your token contract. All admin functions (approve wallets, mint tokens) require 2/3 Safe signers to approve.

---

## 4. GitHub Repository Setup

### **Create Repository**

1. Go to https://github.com/new
2. Repository name: `chainequity-prototype`
3. Visibility: Public (or Private if preferred)
4. Initialize with README: ✅ Check this box
5. Click "Create repository"

### **Clone Locally**
```bash
git clone https://github.com/YOUR_USERNAME/chainequity-prototype.git
cd chainequity-prototype
```

### **Set Up Repository Secrets** (for CI/CD, optional)
If you want automated deployments:
1. Go to Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `ADMIN_PRIVATE_KEY` (Admin wallet private key)
   - `BASE_SEPOLIA_RPC` (RPC URL, can be public endpoint)
   - `VERCEL_TOKEN` (from Vercel dashboard)
   - `RAILWAY_TOKEN` (from Railway dashboard)

**Warning**: Never commit private keys to repository. Always use environment variables.

---

## 5. Vercel Deployment Setup

### **Create Vercel Project**

1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Click "Import Project"
4. Select `chainequity-prototype` repository
5. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `ui/`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   - `VITE_CONTRACT_ADDRESS` (will add after contract deployment)
   - `VITE_BASE_SEPOLIA_RPC` (e.g., `https://sepolia.base.org`)
   - `VITE_BACKEND_URL` (will add after Railway deployment)
7. Click "Deploy"
8. Wait for deployment (~2-3 minutes)
9. **Save deployment URL**: `https://chainequity-prototype.vercel.app`

### **Custom Domain** (Optional)
1. Go to project settings → Domains
2. Add custom domain if you have one
3. Follow DNS configuration instructions

---

## 6. Railway Deployment Setup

### **Create Railway Project**

1. Go to https://railway.app/new
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `chainequity-prototype` repository
5. Railway will detect monorepo structure

### **Create Two Services**

**Service 1: Backend (Issuer Service)**
1. Click "Add Service" → "Backend"
2. Root directory: `backend/`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables:
   - `ADMIN_PRIVATE_KEY` (Admin wallet private key)
   - `BASE_SEPOLIA_RPC` (RPC endpoint)
   - `CONTRACT_ADDRESS` (will add after deployment)
   - `SAFE_ADDRESS` (from Step 3)
   - `DATABASE_URL` (will auto-populate from database addon)
   - `PORT=3000`
6. Click "Deploy"

**Service 2: Indexer**
1. Click "Add Service" → "Indexer"
2. Root directory: `indexer/`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables:
   - `BASE_SEPOLIA_RPC` (RPC endpoint)
   - `CONTRACT_ADDRESS` (will add after deployment)
   - `DATABASE_URL` (same as backend)
6. Click "Deploy"

### **Add PostgreSQL Database**

1. In Railway project, click "New" → "Database" → "Add PostgreSQL"
2. Wait for provisioning (~30 seconds)
3. Database will auto-populate `DATABASE_URL` env var in both services
4. Copy connection string from database settings for local development

### **Generate Public URLs**

1. Click on Backend service → Settings → Networking
2. Click "Generate Domain"
3. **Save backend URL**: `https://chainequity-backend-production.up.railway.app`
4. Add this to Vercel environment variables as `VITE_BACKEND_URL`
5. Repeat for Indexer if you need public access (optional)

### **Verify Deployment**

1. Check backend logs: Should show "Server listening on port 3000"
2. Check indexer logs: Should show "Indexer started, waiting for events..."
3. Test backend health: Visit `https://your-backend-url/health`
4. Should return: `{"status":"ok"}`

---

## 7. Local Development Setup

### **Install Dependencies**

```bash
# Install Foundry (Solidity toolkit)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install Node.js dependencies (run from project root)
npm install

# Install contract dependencies
cd contracts && forge install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Install indexer dependencies
cd indexer && npm install && cd ..

# Install UI dependencies
cd ui && npm install && cd ..
```

### **Create .env Files**

Create `.env` files in each directory based on `.env.example`:

**`contracts/.env`**:
```
ADMIN_PRIVATE_KEY=0xYourPrivateKey
BASE_SEPOLIA_RPC=https://sepolia.base.org
SAFE_ADDRESS=0xYourSafeAddress
```

**`backend/.env`**:
```
ADMIN_PRIVATE_KEY=0xYourPrivateKey
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xWillBeAddedAfterDeploy
SAFE_ADDRESS=0xYourSafeAddress
DATABASE_URL=postgresql://user:pass@localhost:5432/chainequity
PORT=3000
```

**`indexer/.env`**:
```
BASE_SEPOLIA_RPC=https://sepolia.base.org
CONTRACT_ADDRESS=0xWillBeAddedAfterDeploy
DATABASE_URL=postgresql://user:pass@localhost:5432/chainequity
```

**`ui/.env`**:
```
VITE_CONTRACT_ADDRESS=0xWillBeAddedAfterDeploy
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
VITE_BACKEND_URL=http://localhost:3000
```

### **Set Up Local PostgreSQL** (Alternative to Railway for local dev)

**Option A: Docker**
```bash
docker run --name chainequity-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

**Option B: Install Postgres locally**
- macOS: `brew install postgresql && brew services start postgresql`
- Ubuntu: `sudo apt install postgresql`
- Create database: `createdb chainequity`

---

## 8. Contract Deployment

After all services are set up, deploy the contracts:

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast --verify
```

This will:
1. Deploy GatedToken contract
2. Set Safe as owner
3. Output contract address
4. Verify on Basescan

**Save the contract address** and update all `.env` files:
- Backend `.env`: `CONTRACT_ADDRESS=0x...`
- Indexer `.env`: `CONTRACT_ADDRESS=0x...`
- UI `.env`: `VITE_CONTRACT_ADDRESS=0x...`
- Update Railway environment variables
- Redeploy Railway services (they'll pick up new env vars)

---

## 9. Seed Historical Data

Run the seeding script to create historical transactions:

```bash
cd contracts
forge script script/SeedData.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast
```

This creates:
- 3 founder wallets with equal initial distribution
- 5 seed investor wallets from simulated funding round
- 1 secondary transfer between investors
- 10-15 total transactions over "6 months" (different block times)

---

## 10. Verification Checklist

Before recording demo video, verify all systems:

- [ ] All three test wallets funded with Base Sepolia ETH
- [ ] Gnosis Safe deployed with 2/3 threshold
- [ ] Contract deployed and verified on Basescan
- [ ] Backend deployed to Railway and responding
- [ ] Indexer deployed and processing events (check logs)
- [ ] PostgreSQL database created and accessible
- [ ] Frontend deployed to Vercel and loading
- [ ] MetaMask can connect to frontend
- [ ] Historical data seeded (check cap-table export)
- [ ] Safe is set as contract owner (verify with `cast call`)

---

## Troubleshooting

### **MetaMask Connection Issues**
- Ensure Base Sepolia network is selected
- Try disconnecting and reconnecting wallet
- Clear browser cache and reload page

### **Transaction Failures**
- Check wallet has sufficient ETH for gas
- Verify contract address is correct in all `.env` files
- Check Basescan for transaction error details

### **Railway Deployment Errors**
- Check service logs for specific errors
- Verify all environment variables are set
- Ensure DATABASE_URL is populated from Postgres addon
- Try "Restart" on the service

### **Indexer Not Updating**
- Check indexer logs for connection errors
- Verify RPC endpoint is accessible
- Ensure CONTRACT_ADDRESS matches deployed contract
- Check PostgreSQL connection

### **Frontend Not Loading Contract**
- Open browser console (F12) for errors
- Verify `VITE_CONTRACT_ADDRESS` is set
- Check Network tab for API call failures
- Ensure backend URL is correct

---

## Support Resources

- **Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Safe Documentation**: https://docs.safe.global
- **Vercel Documentation**: https://vercel.com/docs
- **Railway Documentation**: https://docs.railway.app
- **Foundry Book**: https://book.getfoundry.sh

---

*Last Updated: [Auto-generated]*
