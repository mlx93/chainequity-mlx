# ChainEquity - Project Brief

## Project Overview
ChainEquity is a tokenized security prototype demonstrating compliant digital equity management on blockchain infrastructure. This is a 2-day technical demonstration project showcasing how traditional securities can be represented as blockchain tokens with regulatory compliance gating.

## Core Objective
Build a working prototype that demonstrates:
1. **Compliant Token Transfers**: ERC-20 token with allowlist gating (only approved wallets can hold/transfer)
2. **Corporate Actions**: Virtual stock splits and mutable token symbols
3. **Cap Table Management**: Real-time and historical shareholder data via blockchain event indexing
4. **Multi-Signature Control**: Gnosis Safe ownership for admin operations

## Key Constraints
- **Timeline**: 2-day implementation (focus on core functionality, not production hardening)
- **Network**: Base Sepolia testnet (OP-Stack, low fees, mature tooling)
- **Scope**: Demonstration prototype, not production-ready system
- **Multi-Agent Approach**: Implementation divided into 4 phases with specialized sub-agents

## Success Criteria
- ✅ Smart contracts deployed and tested on Base Sepolia
- ✅ Event indexer running 24/7 on Railway, syncing blockchain events to PostgreSQL
- ✅ Backend API providing cap-table data and transaction endpoints
- ✅ Frontend UI for viewing cap tables and executing token operations
- ✅ Gnosis Safe controlling all admin functions
- ✅ Demo video walkthrough showing all features

## Technical Approach
**Architecture**: Blockchain-first with centralized query cache
- Smart contracts are source of truth (Base Sepolia)
- Event indexer syncs blockchain → database for efficient queries
- Backend API serves cached data and submits transactions
- Frontend provides user interface

**Phased Implementation**:
1. Phase 1: Smart Contracts (Foundry, OpenZeppelin, Gnosis Safe ownership)
2. Phase 2A: Backend API (Express, TypeScript, viem, PostgreSQL)
3. Phase 2B: Event Indexer (Node.js service monitoring blockchain events)
4. Phase 3: Frontend (React, Vite, wagmi, shadcn/ui, Tailwind)
5. Phase 4: Integration & Testing

## Repository Structure
- `/contracts/` - Foundry smart contract project
- `/backend/` - Express API server
- `/indexer/` - Event monitoring and database sync service
- `/frontend/` - React application
- `/memory-bank/` - Project knowledge base
- `wallet-addresses.txt` - Critical addresses and credentials
- `PHASE[X]_*` - Sub-agent prompts and completion reports

## Key External Dependencies
- **Base Sepolia RPC**: Public endpoint at `https://sepolia.base.org`
- **Railway**: Hosting for backend and indexer services
- **Vercel**: Hosting for React frontend
- **Gnosis Safe**: Multi-sig wallet at `0x6264F29968e8fd2810cB79fb806aC65dAf9db73d`
- **GitHub**: Code repository at `https://github.com/mlx93/chainequity-mlx`

## Non-Goals (Out of Scope)
- Production security audits
- Mainnet deployment
- KYC/AML integration
- Advanced compliance features (accredited investor verification, transfer restrictions beyond allowlist)
- Mobile app
- High-frequency trading optimizations
- Extensive error handling for edge cases

