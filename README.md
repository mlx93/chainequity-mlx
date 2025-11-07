# ChainEquity

**Tokenized Securities Prototype with Compliance Gating**

A working prototype demonstrating how tokenized securities can function on-chain with compliance gating, corporate actions, and operator workflows. Built on Base Sepolia testnet with architecture ready for mainnet deployment.

---

## 🎯 Project Overview

ChainEquity provides a complete system for managing tokenized equity with:
- **Compliance Gating**: Only approved wallets can hold/transfer tokens
- **Corporate Actions**: Virtual stock splits and mutable token symbols
- **Cap Table Management**: Real-time and historical ownership tracking
- **Multi-Signature Control**: Gnosis Safe (2-of-3) for all admin operations

### Live Demo

- **Frontend**: https://chainequity-mlx.vercel.app/
- **Backend API**: https://tender-achievement-production-3aa5.up.railway.app/api
- **Contract**: [0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e](https://sepolia.basescan.org/address/0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e)

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vercel)                      │
│                  React + Vite + wagmi                       │
└───────────────┬──────────────────────┬──────────────────────┘
                │                      │
                │ (Read State)         │ (Write Txns)
                ▼                      ▼
┌────────────────────────┐   ┌─────────────────────────────────┐
│   BACKEND API          │   │   BASE SEPOLIA BLOCKCHAIN       │
│   (Railway)            │   │                                 │
│   Express + TypeScript │   │  ┌───────────────────────────┐  │
│   + viem + PostgreSQL  │   │  │  GatedToken Contract      │  │
│                        │   │  │  (Source of Truth)        │  │
│   Reads: Database      │   │  │  Owned by Gnosis Safe     │  │
│   Writes: Blockchain   │   │  └───────────────────────────┘  │
└────────┬───────────────┘   └──────────────┬──────────────────┘
         │                                   │
         │ (Queries)                         │ (Events)
         ▼                                   ▼
┌────────────────────────────────────────────────────────────┐
│              POSTGRESQL DATABASE (Railway)                 │
│                                                             │
│  Tables: transfers, balances, approvals, corporate_actions │
│  (Query Cache - derived from blockchain events)            │
└───────────────────────────▲────────────────────────────────┘
                            │
                            │ (Writes)
                    ┌───────┴────────┐
                    │  EVENT INDEXER │
                    │   (Railway)    │
                    │  Node.js +     │
                    │  viem + pg     │
                    └────────────────┘
```

### Technology Stack

**Smart Contracts**:
- Solidity ^0.8.20
- Foundry (development framework)
- OpenZeppelin Contracts 5.x

**Backend Services**:
- Node.js 18+ with TypeScript
- Express.js (REST API)
- viem (blockchain interactions)
- PostgreSQL (data storage)

**Frontend**:
- React 19 + Vite
- wagmi (Web3 integration)
- shadcn/ui + Tailwind CSS
- React Query (data fetching)

**Deployment**:
- Base Sepolia Testnet (smart contracts)
- Railway (backend + indexer + database)
- Vercel (frontend)

---

## ✨ Key Features

### ✅ Compliance Gating
- Allowlist-based transfer restrictions
- Both sender and recipient must be approved
- Real-time approval status checking

### ✅ Corporate Actions
- **Virtual Stock Split**: Gas-efficient multiplier-based implementation
- **Symbol Changes**: Mutable token metadata
- All actions require multi-sig approval

### ✅ Cap Table Management
- Real-time ownership tracking
- Historical cap table queries at any block
- CSV/JSON export functionality
- Transaction history with pagination

### ✅ Multi-Signature Security
- Gnosis Safe (2-of-3) controls all admin functions
- No single point of failure
- Production-ready security model

---

## 🚀 Quick Start

### Prerequisites

- **Foundry**: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
- **Node.js**: v18 or higher
- **MetaMask**: Browser extension
- **Git**: Version control

### Local Development

**1. Clone Repository**:
```bash
git clone https://github.com/mlx93/chainequity-mlx.git
cd chainequity-mlx
```

**2. Install Dependencies**:
```bash
# Contracts
cd contracts && forge install && cd ..

# Indexer
cd indexer && npm install && cd ..

# Backend
cd backend && npm install && cd ..

# Frontend
cd ui && npm install && cd ..
```

**3. Configure Environment Variables**:
See `submissionDocs/SETUP_GUIDE.md` for detailed environment variable setup.

**4. Run Services**:
```bash
# Contracts (compile & test)
cd contracts && forge build && forge test && cd ..

# Indexer (requires database)
cd indexer && npm run dev && cd ..

# Backend (requires database)
cd backend && npm run dev && cd ..

# Frontend
cd ui && npm run dev && cd ..
```

### Deployment

See `submissionDocs/SETUP_GUIDE.md` for complete deployment instructions.

**Quick Deploy**:
- **Contract**: `forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast`
- **Backend/Indexer**: `railway up` (after linking project)
- **Frontend**: `vercel --prod` or push to GitHub (auto-deploy)

---

## 📊 Current Status

### ✅ Project Complete

**All Phases Complete**:
- ✅ Phase 1: Smart Contracts (deployed, tested, verified)
- ✅ Phase 2A: Backend API (deployed, all endpoints working)
- ✅ Phase 2B: Event Indexer (running 24/7, processing events)
- ✅ Phase 3: Frontend (deployed, all features working)
- ✅ Phase 4: Integration & Testing (all tests passing)

**Test Results**:
- ✅ 10/10 Foundry contract tests passing
- ✅ 7/7 Manual integration tests passing
- ✅ All PRD requirements implemented
- ✅ All demo scenarios verified

**Performance**:
- ✅ All gas costs within targets
- ✅ Transaction confirmation: 2-3 seconds
- ✅ Historical queries: <2 seconds
- ✅ Frontend load: <3 seconds

---

## 📁 Project Structure

```
ChainEquity/
├── contracts/          # Smart contract development (Foundry)
├── indexer/            # Event indexing service (TypeScript)
├── backend/            # REST API service (Express + TypeScript)
├── ui/                 # React frontend (Vite + TypeScript)
├── memory-bank/        # Project knowledge base
├── docs/               # Documentation
├── submissionDocs/     # Submission materials
│   ├── ARCHITECTURE.md
│   ├── TECHNICAL_WRITEUP.md
│   ├── GAS_REPORT.md
│   ├── TEST_RESULTS.md
│   ├── DEPLOYMENT_ADDRESSES.md
│   └── SETUP_GUIDE.md
└── README.md           # This file
```

---

## 📚 Documentation

### Submission Documents
- **ARCHITECTURE.md**: Complete system architecture and design decisions
- **TECHNICAL_WRITEUP.md**: Technical summary (chain selection, corporate actions, limitations)
- **GAS_REPORT.md**: Gas benchmarks and performance metrics
- **TEST_RESULTS.md**: Complete test results (contract + integration)
- **DEPLOYMENT_ADDRESSES.md**: All deployment addresses and verification commands
- **SETUP_GUIDE.md**: Reproducible setup and deployment instructions

### Additional Documentation
- **PRD_PRODUCT.md**: Product requirements document
- **PRD_TECHNICAL.md**: Technical specifications
- **TECHNICAL_DECISIONS.md**: Architectural decision rationale
- **DEMO_VIDEO.md**: Demo video script
- **docs/KNOWN_LIMITATIONS.md**: Known limitations and future enhancements

---

## 🔗 Deployment Addresses

### Smart Contract
- **Address**: `0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e`
- **Network**: Base Sepolia (Chain ID: 84532)
- **Explorer**: https://sepolia.basescan.org/address/0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e

### Services
- **Frontend**: https://chainequity-mlx.vercel.app/
- **Backend API**: https://tender-achievement-production-3aa5.up.railway.app/api
- **Gnosis Safe**: `0x6264F29968e8fd2810cB79fb806aC65dAf9db73d`

See `submissionDocs/DEPLOYMENT_ADDRESSES.md` for complete address list.

---

## 🧪 Testing

### Contract Tests
```bash
cd contracts
forge test
forge test --gas-report
```

**Results**: 10/10 tests passing ✅

### Integration Tests
All 7 required demo scenarios verified and passing:
1. ✅ Mint tokens to approved wallet
2. ✅ Transfer between approved wallets
3. ✅ Transfer to non-approved wallet (blocked)
4. ✅ Approve new wallet → Transfer succeeds
5. ✅ Execute 7-for-1 stock split
6. ✅ Change ticker symbol
7. ✅ Export cap-table at specific block

See `submissionDocs/TEST_RESULTS.md` for detailed test results.

---

## ⚠️ Disclaimer

**This is a technical prototype demonstration only.**

This software is **NOT regulatory-compliant** and should **NOT** be used for real securities issuance without:
- Professional legal review
- Regulatory compliance verification
- Security audit by qualified auditors
- KYC/AML integration
- Accredited investor verification

**Use at your own risk. The authors assume no liability for any use of this software.**

---

## 🎯 Success Criteria

All project success criteria met:

| Criteria | Target | Actual | Status |
|----------|--------|--------|--------|
| False-positive transfers | 0 | 0 | ✅ |
| False-negative blocks | 0 | 0 | ✅ |
| Cap-table export | Generated | Generated | ✅ |
| Stock split works | Yes | Yes | ✅ |
| Symbol change works | Yes | Yes | ✅ |
| Transfer confirmation | < 5s | 2-3s | ✅ |
| Indexer latency | < 10s | < 10s | ✅ |

---

## 🤝 Contributing

This is a demonstration project. For questions or issues:
- Check `docs/troubleshooting/` for common problems
- Review `submissionDocs/SETUP_GUIDE.md` for setup help
- See `TECHNICAL_DECISIONS.md` for architectural rationale

---

## 📄 License

See `LICENSE` file for details.

---

## 🔗 Links

- **GitHub**: https://github.com/mlx93/chainequity-mlx
- **Frontend**: https://chainequity-mlx.vercel.app/
- **Contract Explorer**: https://sepolia.basescan.org/address/0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e
- **Gnosis Safe**: https://app.safe.global

---

**Last Updated**: November 7, 2025  
**Status**: ✅ Project Complete
