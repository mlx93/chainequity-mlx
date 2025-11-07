# ChainEquity - Setup Implemented

**Date**: November 6, 2025  
**Status**: ✅ Complete - Ready for Phase 1 Implementation

---

## Overview

All manual setup steps have been completed for the ChainEquity tokenized equity prototype. This document summarizes the infrastructure and configuration in place.

---

## 1. Development Environment

### **Foundry Installation**
- **Version**: v1.4.4-stable
- **Tools Installed**:
  - `forge` - Solidity compiler and test runner
  - `cast` - CLI for Ethereum interactions
  - `anvil` - Local testnet (available if needed)
- **Status**: ✅ Verified working

---

## 2. Blockchain Setup

### **Network Configuration**
- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org
- **Status**: ✅ Added to MetaMask

### **Test Wallets Created**

| Account | Address | Balance | Purpose |
|---------|---------|---------|---------|
| **Admin** | `0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6` | 0.0125 ETH | Contract deployment & admin operations |
| **Investor A** | `0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e` | 0.0125 ETH | Test investor wallet |
| **Investor B** | `0xefd94a1534959e04630899abdd5d768601f4af5b` | 0.0125 ETH | Test investor wallet |
| **Total** | - | 0.0375 ETH | Sufficient for demo (~375-3,750 transactions) |

- **Funding Source**: Base Sepolia faucets (Alchemy, community faucets)
- **Status**: ✅ All wallets funded

### **Gnosis Safe (Multi-Sig)**
- **Address**: `0x6264F29968e8fd2810cB79fb806aC65dAf9db73d`
- **Network**: Base Sepolia
- **Configuration**: 2-of-3 multi-signature
- **Signers**:
  1. Admin (`0x4f10...24c6`)
  2. Investor A (`0x0d9c...c13e`)
  3. Investor B (`0xefd9...af5b`)
- **Threshold**: 2 signatures required for execution
- **Purpose**: Contract ownership for decentralized admin control
- **Status**: ✅ Deployed and verified

---

## 3. Version Control

### **GitHub Repository**
- **Repository**: https://github.com/mlx93/chainequity-mlx
- **Owner**: mlx93
- **Visibility**: Public
- **Connected Services**: Vercel (auto-deployment)
- **Status**: ✅ Active

**Note**: Original repo (mlx93/ChainEquity) was deleted to reduce complexity. All code will use chainequity-mlx.

---

## 4. Database Infrastructure

### **Railway PostgreSQL**
- **Service Name**: lucid-strength (PostgreSQL database service)
- **Indexer Service Name**: superb-trust (indexer application)
- **Project**: Both services in same Railway project
- **Environment**: production
- **Database**: PostgreSQL 15.x
- **Connection**: DATABASE_URL configured (see wallet-addresses.txt and RAILWAY_DATABASE_URLS.txt)
- **Purpose**: Query cache for cap-table, transactions, historical data
- **Status**: ✅ Database provisioned and ready

**Important**: Database is reconstructible from blockchain events (not source of truth).

**Note**: See `RAILWAY_SERVICES.md` for detailed service mapping.

---

## 5. Frontend Hosting

### **Vercel Deployment**
- **Project URL**: https://chainequity-mlx.vercel.app/
- **Connected Repository**: chainequity-mlx
- **Auto-Deploy**: Enabled from `main` branch
- **Framework**: React + Vite (to be deployed in Phase 3)
- **Status**: ✅ Account connected, ready for deployment

---

## 6. Environment Variables

All sensitive configuration has been documented in `wallet-addresses.txt`:

```bash
# Blockchain
ADMIN_ADDRESS=0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6
ADMIN_PRIVATE_KEY=0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe
SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
BASE_SEPOLIA_RPC=https://sepolia.base.org

# Database
DATABASE_URL=postgresql://postgres:ITpPoRYgfwPwGkhtpysPwOBzczfKQDxQ@postgres.railway.internal:5432/railway

# Investor Addresses (for testing)
INVESTOR_A_ADDRESS=0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e
INVESTOR_B_ADDRESS=0xefd94a1534959e04630899abdd5d768601f4af5b
```

⚠️ **Security**: These are testnet-only values. Never commit to Git or use on mainnet.

---

## 7. Setup Verification Checklist

- [x] Foundry installed and verified (v1.4.4-stable)
- [x] Base Sepolia network added to MetaMask
- [x] 3 test wallets created with distinct addresses
- [x] All wallets funded with Base Sepolia ETH (0.0125 each)
- [x] Gnosis Safe deployed with 2-of-3 threshold
- [x] GitHub repository created and cleaned up
- [x] Railway PostgreSQL database provisioned
- [x] Vercel account connected to GitHub
- [x] All environment variables documented

---

## 8. Architecture Decisions Reference

Key architectural decisions made during setup:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Chain** | Base Sepolia | L2 for low gas, production-ready architecture |
| **Multi-Sig** | Gnosis Safe 2-of-3 | Industry standard, demonstrates decentralization |
| **Database** | PostgreSQL on Railway | Query cache (reconstructible from chain) |
| **Frontend Host** | Vercel | Auto-deployment, serverless, fast |
| **Backend Host** | Railway (Phase 2) | Docker support, easy Postgres integration |
| **Stock Split** | Virtual (multiplier) | Professional approach, gas-efficient |
| **Symbol Change** | Mutable override | Option C from technical decisions |

See `TECHNICAL_DECISIONS.md` for complete rationale.

---

## 9. Next Steps: Phase 1

**Ready for**: Contract Specialist sub-agent to implement:
1. GatedToken.sol smart contract
2. Foundry test suite (10 scenarios)
3. Deployment to Base Sepolia
4. Contract verification on Basescan
5. Gas report generation

**Estimated Duration**: 3-4 hours

---

## 10. Reference Documents

- `wallet-addresses.txt` - All addresses, keys, and connection strings
- `PRD_PRODUCT.md` - Product requirements and user stories
- `PRD_TECHNICAL.md` - Technical specifications and API endpoints
- `TECHNICAL_DECISIONS.md` - Architecture rationale
- `DEMO_VIDEO.md` - 6-minute demo script
- `MANUAL_SETUP.md` - Original setup guide (now completed)

---

## 11. Troubleshooting Resources

### **If You Need More Testnet ETH:**
- **Ponzifun Faucet**: 1 ETH every 48 hours (https://sepolia.ponzifun.com/)
- **Alchemy Faucet**: 0.1 ETH daily (https://www.alchemy.com/faucets/base-sepolia)
- **QuickNode Faucet**: Every 12 hours (https://faucet.quicknode.com/base/sepolia)

### **Base Sepolia Network Info:**
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org

### **Safe Dashboard:**
- https://app.safe.global
- Switch network to Base Sepolia to view your Safe

---

**Setup completed by**: Orchestrator Agent  
**Implementation to be executed by**: Phase 1-4 Sub-Agents  
**Timeline**: 2-day development sprint

---

*This document captures the state of the project at the completion of manual setup. All prerequisites are in place for sub-agent implementation.*

