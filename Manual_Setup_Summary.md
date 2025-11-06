Manual Setup Summary (One Line Per Section)
Here's what YOU actually have to do manually:
Prerequisites (10 min)

Create GitHub, MetaMask, Coinbase, Vercel, Railway accounts (if you don't have them)

Base Sepolia Setup (5 min)

Add Base Sepolia network to MetaMask (auto via Chainlist.org)

Wallet Creation (5 min)

Create 3 MetaMask accounts: Admin, Investor A, Investor B

Funding Wallets (5 min)

Visit Coinbase faucet 3x, paste each address, get 0.5 ETH per wallet

Gnosis Safe Deployment (10 min)

Go to app.safe.global → Create Safe → Add 3 signers → Set 2/3 threshold → Deploy → Save address

GitHub Repository (5 min)

Create repo on GitHub → Clone locally (Cursor will generate code here)

Vercel Project (5 min)

Import GitHub repo → Set framework to Vite → Add env vars (contract address added later)

Railway Project (10 min)

Create project from GitHub → Add Postgres addon → Create Backend service → Create Indexer service → Add env vars

Contract Deployment (Cursor does this, you just run command) (5 min)

forge script script/Deploy.s.sol --broadcast → Copy contract address → Update all .env files

Safe Ownership Transfer (5 min)

Run cast send command to transfer contract ownership to Safe address

Verification (5 min)

Check Basescan for contract → Check Railway logs → Check Vercel deployment → Connect wallet to UI