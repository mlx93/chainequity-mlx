# ChainEquity - Technical Context

## Technology Stack

### Smart Contracts
- **Language**: Solidity ^0.8.20
- **Framework**: Foundry (forge, cast, anvil)
- **Libraries**: OpenZeppelin Contracts 5.x
  - `ERC20.sol` - Base token implementation
  - `Ownable.sol` - Access control
- **Network**: Base Sepolia Testnet
  - Chain ID: 84532
  - RPC: https://sepolia.base.org (public endpoint)
  - Block Explorer: https://sepolia.basescan.org
- **Testing**: Foundry's forge test framework
- **Deployment**: Foundry scripts with Gnosis Safe ownership transfer

### Event Indexer
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Blockchain Library**: viem (modern alternative to ethers.js/web3.js)
- **Database Client**: pg (node-postgres)
- **Database**: PostgreSQL 17 (Railway-hosted)
- **Build**: tsc (TypeScript compiler)
- **Process Management**: Railway's container runtime
- **Environment**: dotenv for local, Railway variables for production

### Backend API (Pending Implementation)
- **Framework**: Express.js
- **Language**: TypeScript
- **Blockchain Library**: viem
- **Database Client**: pg
- **Validation**: zod or joi (TBD)
- **CORS**: cors middleware
- **Logging**: winston or pino (TBD)

### Frontend (Phase 3 - COMPLETE)
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Language**: TypeScript 5.9.3 (strict mode)
- **Wallet Integration**: wagmi 2.19.2 + @wagmi/connectors + viem 2.38.6
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind CSS 3.4.17)
- **Styling**: Tailwind CSS with custom theme
- **Routing**: React Router 7.9.5
- **Data Fetching**: @tanstack/react-query 5.90.7
- **Forms**: react-hook-form 7.66.0 + zod 4.1.12
- **Icons**: Lucide React 0.552.0
- **Notifications**: Sonner (toast notifications)
- **Location**: `/ui/` directory
- **Deployment**: Vercel (https://chainequity-mlx.vercel.app/)

## Development Setup

### Prerequisites
1. **Foundry**: Solidity toolchain
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Node.js**: v18 or higher
   ```bash
   node --version  # Should be >= 18
   ```

3. **Git**: Version control
4. **MetaMask**: Browser extension for wallet operations

### Environment Variables

**Root `.env` file** (for local development):
```bash
# Wallets
ADMIN_ADDRESS=0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6
INVESTOR_A_ADDRESS=0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e
INVESTOR_B_ADDRESS=0xefd94a1534959e04630899abdd5d768601f4af5b
ADMIN_PRIVATE_KEY=0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe

# Safe
SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d

# Database (Railway)
DATABASE_URL_INTERNAL=postgresql://postgres:dYjiuLvfSvaOjsNHXhtAbWHtbwWPFpUW@postgres.railway.internal:5432/railway
DATABASE_URL_PUBLIC=postgresql://postgres:dYjiuLvfSvaOjsNHXhtAbWHtbwWPFpUW@nozomi.proxy.rlwy.net:25369/railway

# RPC
BASE_SEPOLIA_RPC=https://sepolia.base.org

# Contract
CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
START_BLOCK=33313307
CHAIN_ID=84532
```

**Indexer Env (Railway)**: Uses `DATABASE_URL_INTERNAL` for fast private network connection

**Backend Env (Railway)**: Uses `DATABASE_URL_PUBLIC` for external connection

### Local Development

**Contracts**:
```bash
cd contracts
forge build          # Compile
forge test           # Run tests
forge test --gas-report  # Gas benchmarks
```

**Indexer**:
```bash
cd indexer
npm install
npm run dev          # Run locally (requires .env with PUBLIC database URL)
npm run build        # Compile TypeScript
npm run init-db      # Initialize database schema (PUBLIC URL only)
```

**Backend** (when implemented):
```bash
cd backend
npm install
npm run dev          # Start dev server with hot reload
npm run build        # Production build
```

**Frontend**:
```bash
cd ui
npm install
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build locally
```

## External Services

### Railway (Backend + Indexer Hosting)
- **Project**: ChainEquity-Indexer (needs to be reconfigured)
- **Services Required**:
  1. PostgreSQL Database
  2. Indexer Node.js App
  3. Backend Node.js App (future)
- **Dashboard**: https://railway.app/dashboard
- **CLI**: `railway` command-line tool
- **Deployment**: Git push to main branch OR `railway up`
- **Variables**: Set via dashboard or `railway variables set KEY=VALUE`

### Vercel (Frontend Hosting)
- **Project**: chainequity-mlx
- **URL**: https://chainequity-mlx.vercel.app/
- **GitHub Integration**: Auto-deploys from main branch
- **Repository**: https://github.com/mlx93/chainequity-mlx

### Base Sepolia Testnet
- **Purpose**: Ethereum L2 testnet for development
- **Advantages**:
  - Low gas fees (~$0.001 per transaction)
  - Fast block times (~2 seconds)
  - OP-Stack maturity (production-grade)
  - Compatible with Ethereum tooling
- **Faucet**: Alchemy faucet (0.1 ETH daily limit)
- **Explorer**: https://sepolia.basescan.org

### Gnosis Safe
- **Purpose**: Multi-signature wallet for admin controls
- **Address**: 0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
- **Configuration**: 2-of-3 signers
  - Admin wallet (0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6)
  - Investor A (0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e)
  - Investor B (0xefd94a1534959e04630899abdd5d768601f4af5b)
- **Interface**: https://app.safe.global

## Technical Constraints

### RPC Rate Limits
- **Public Base Sepolia RPC**: ~100 requests/second
- **Mitigation**: Database caching via indexer
- **Risk**: High-frequency queries may hit limits
- **Solution for Production**: Use private RPC provider (Alchemy, QuickNode)

### Database Limitations (Railway Free Tier)
- **Storage**: 1 GB (sufficient for demo)
- **Connections**: 100 concurrent (more than enough)
- **Backups**: Not included in free tier
- **Uptime**: 99.9% SLA (acceptable for demo)

### Block Explorer Limitations
- **Symbol Caching**: Basescan caches token symbol, doesn't auto-refresh
- **Workaround**: Manual update request to Basescan support
- **Impact**: Block explorer may show old symbol after `updateSymbol()`
- **Acceptable**: Contract `symbol()` is correct, just explorer UI lag

### Gas Fees
- **Expected Costs** (Base Sepolia):
  - Deploy contract: ~$0.50
  - Approve wallet: ~$0.01
  - Transfer: ~$0.01
  - Stock split: ~$0.02
  - Symbol update: ~$0.02
- **Total Demo Budget**: < $2 in testnet ETH

### Security Considerations (Demo Scope)
- **Private keys in .env**: Acceptable for testnet, NEVER for mainnet
- **Public RPC**: Acceptable for demo, use private RPC for production
- **No input validation**: Minimal validation acceptable for demo
- **No rate limiting**: Not implemented (out of scope)
- **No audit**: Smart contracts not audited (demo only)

## Build & Deployment Pipeline

### Contracts (Phase 1 - Complete)
1. Write contracts in `/contracts/src/`
2. Write tests in `/contracts/test/`
3. Run `forge test --gas-report`
4. Deploy via `forge script` with Admin wallet
5. Transfer ownership to Gnosis Safe
6. Verify on Basescan (optional)

### Indexer (Phase 2B - In Progress)
1. Write TypeScript code in `/indexer/src/`
2. Test locally with `npm run dev`
3. Commit and push to GitHub
4. Deploy to Railway:
   - Option A: `railway up` (CLI)
   - Option B: Git push triggers auto-deploy
5. Set environment variables on Railway
6. Verify logs show "✅ Indexer running"
7. Verify database tables created

### Backend (Phase 2A - Next)
1. Write Express API in `/backend/src/`
2. Test locally against Railway database (PUBLIC URL)
3. Deploy to Railway (separate service)
4. Configure CORS for Vercel frontend

### Frontend (Phase 3 - COMPLETE)
1. ✅ Built React app in `/ui/` (45+ source files)
2. ✅ Configured wagmi with Base Sepolia + MetaMask
3. ✅ Tested locally with `npm run dev`
4. ✅ Pushed to GitHub (auto-deploys to Vercel)
5. ✅ Configured environment variables on Vercel
6. ✅ MetaMask connection working (connector ID fix applied)
7. ✅ All 14 functional requirements from PRD implemented

## Debugging Tools

### Smart Contracts
- `forge test -vvvv` - Verbose test output with stack traces
- `cast call` - Read contract state
- `cast send` - Submit transactions
- `cast logs` - Query event logs
- Basescan - View transactions and events in browser

### Indexer
- `railway logs` - View Railway logs
- `railway run node --version` - Test Railway environment
- `psql $DATABASE_URL_PUBLIC -c "\dt"` - View database tables locally
- Database UI tools: TablePlus, pgAdmin, DataGrip

### Backend
- Postman / Insomnia - Test API endpoints
- `curl` - Command-line API testing
- Railway logs - View server logs

### Frontend
- React DevTools - Component inspection
- MetaMask - Transaction debugging (Base Sepolia network)
- Browser console - JavaScript errors, wagmi connector logs
- Network tab - API request/response inspection
- Vercel deployment logs - Build and runtime errors
- React Query DevTools - Data fetching inspection (optional)

## Known Issues & Limitations

1. **Railway Database Initialization**: Tables must be created manually OR via auto-init on first indexer startup. CLI `railway run` doesn't work for database init due to internal DNS limitations.

2. **Symbol Update Lag**: Block explorers cache token symbol. Contract returns correct symbol but UI may be stale.

3. **Split Safe Transfers**: After stock split, transfers must use amounts divisible by 700 to avoid rounding issues with Safe signature verification.

4. **No Websockets**: Real-time updates require polling. Websocket implementation out of scope.

5. **Single Region Deployment**: Railway free tier = single US region. No multi-region for latency optimization.

