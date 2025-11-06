# ChainEquity - Documentation Index

This directory contains all planning and specification documents for the ChainEquity tokenized security prototype.

---

## 📋 Project Documents

### **Core Requirements**
- **[ChainEquity PDF](../Platinum_Project_Peak6_ChainEquity.pdf)** - Original project specification from Peak6

### **Planning & Decisions**
1. **[TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md)** - All technology and architecture choices with 1-2 sentence rationale for each decision
2. **[DEMO_VIDEO.md](./DEMO_VIDEO.md)** - Complete 6-minute demo video script with timing breakdown and shot-by-shot instructions
3. **[MANUAL_SETUP.md](./MANUAL_SETUP.md)** - Step-by-step setup guide for external services (Gnosis Safe, Base Sepolia, Railway, Vercel)

### **Product Requirements**
4. **[PRD_PRODUCT.md](./PRD_PRODUCT.md)** (~500 lines)
   - Executive summary
   - User personas & stories
   - Functional requirements
   - Implementation phases (4 phases, 2 days)
   - Testing requirements (10 required scenarios)
   - Success criteria from PDF
   - Demo requirements
   - Risks & mitigations

### **Technical Specifications**
5. **[PRD_TECHNICAL.md](./PRD_TECHNICAL.md)** (~500 lines)
   - System architecture diagram (textual)
   - Complete tech stack with versions
   - Smart contract interface specification
   - Backend REST API endpoints & schemas
   - Database schema (PostgreSQL)
   - Frontend architecture & routing
   - Deployment plan (step-by-step)
   - Environment variables
   - Development workflow commands

---

## 🎯 Quick Start for Implementation

### **For Cursor AI:**
1. Read PRD_PRODUCT.md for feature requirements and user stories
2. Read PRD_TECHNICAL.md for implementation specifications
3. Reference TECHNICAL_DECISIONS.md for architectural rationale
4. Follow deployment steps in PRD_TECHNICAL.md
5. Use MANUAL_SETUP.md for external service configuration

### **For Human Developers:**
1. Complete MANUAL_SETUP.md first (Gnosis Safe, wallets, hosting accounts)
2. Follow Implementation Phases in PRD_PRODUCT.md (Day 1 & Day 2 breakdown)
3. Reference TECHNICAL_DECISIONS.md when making trade-offs
4. Use DEMO_VIDEO.md to practice final presentation

---

## ✅ Requirements Coverage

### **All PDF Requirements Addressed:**
- ✅ Gated token contract with allowlist mechanism
- ✅ Issuer service for wallet approval and token minting
- ✅ Event indexer producing cap-table snapshots
- ✅ Corporate actions (7-for-1 split + symbol change)
- ✅ Operator UI for demonstrations
- ✅ Test suite (Tier 1: Foundry, Tier 2: TypeScript integration)
- ✅ Gas benchmarks (Foundry built-in)
- ✅ Technical writeup with decision rationale (TECHNICAL_DECISIONS.md)
- ✅ Demo showing all 7 required scenarios (DEMO_VIDEO.md)

### **Success Criteria Met:**
- Zero false-positive transfers: Foundry tests enforce
- Zero false-negative blocks: Foundry tests verify
- Cap-table export: Backend API + UI implementation
- Corporate actions demonstrated: Split + symbol in demo video
- Performance targets: Base L2 + PostgreSQL meet timing requirements
- Documentation: All decisions documented with clear rationale

---

## 🏗️ Architecture Summary

```
Blockchain (Base Sepolia)
    ↓ Events
Indexer → PostgreSQL ← Backend API
                ↓ Reads
            React UI
```

**Key Design Decisions:**
- **PostgreSQL on Railway** - Reconstructible query cache, not source of truth
- **Virtual Stock Split** - Gas-efficient multiplier instead of per-holder iteration
- **Multi-Sig Admin** - Gnosis Safe (2/3) for decentralization
- **Base Sepolia** - EVM-compatible L2 with EIP-4844 blob pricing
- **shadcn/ui** - Polished components for professional demo
- **viem** - Modern TypeScript web3 library (10x smaller than ethers.js)

---

## 📊 Timeline & Milestones

**Day 1 Morning (4h)**: Foundation
- Deploy contracts
- Set up Safe
- Write & pass core tests

**Day 1 Afternoon (4h)**: Backend Services
- Build API
- Deploy indexer
- Set up PostgreSQL

**Day 2 Morning (4h)**: Frontend
- Build UI with shadcn/ui
- Implement all user flows
- Deploy to Vercel

**Day 2 Afternoon (4h)**: Integration & Demo
- Comprehensive testing
- Seed historical data
- Record 6-minute demo video
- Final documentation

---

## 🧪 Testing Checklist

**Contract Tests (Foundry)**:
- [ ] Approve wallet → mint → verify balance
- [ ] Transfer approved → approved (SUCCESS)
- [ ] Transfer approved → unapproved (FAIL)
- [ ] Transfer unapproved → approved (FAIL)
- [ ] Revoke → can't receive anymore
- [ ] Execute split → balances multiply by 7
- [ ] Change symbol → metadata updates
- [ ] Unauthorized admin action (FAIL)
- [ ] Gas benchmarks for all operations

**Integration Tests (Vitest)**:
- [ ] Backend API endpoints respond correctly
- [ ] Indexer captures all events
- [ ] Cap-table calculations accurate
- [ ] Historical queries work
- [ ] CSV/JSON exports valid

**Demo Video**:
- [ ] All 7 PDF scenarios demonstrated
- [ ] 5-7 minute duration
- [ ] Professional voiceover
- [ ] Two browser windows (Chrome + Safari)
- [ ] Clear error messages shown

---

## 🔗 Related Resources

**Blockchain**:
- Base Sepolia Testnet: https://sepolia.base.org
- Base Sepolia Explorer: https://sepolia.basescan.org
- Base Docs: https://docs.base.org

**Development Tools**:
- Foundry Book: https://book.getfoundry.sh
- viem Docs: https://viem.sh
- wagmi Docs: https://wagmi.sh
- shadcn/ui: https://ui.shadcn.com

**Services**:
- Gnosis Safe: https://app.safe.global
- Railway: https://railway.app
- Vercel: https://vercel.com
- Coinbase Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

**Monitoring**:
- Railway Logs: Check backend/indexer health
- Basescan: Verify transactions
- Vercel Deployment Logs: Check frontend builds

---

## 🚨 Important Notes

**Disclaimer**: This is a technical prototype for demonstration purposes only. It is NOT regulatory-compliant and should not be used for real securities without legal review and proper compliance infrastructure.

**Security**: 
- Never commit private keys to Git
- Use environment variables for all secrets
- Testnet only - never use real funds
- Multi-sig admin for production (2/3 threshold demonstrated)

**Gas Costs**:
- Base Sepolia is cheap (~pennies per transaction with EIP-4844)
- Virtual split avoids expensive per-holder iteration
- Gas reports included in Foundry test output

---

## 📝 Documentation Standards

All code should follow these principles:
- **Clarity over cleverness** - Simple, readable implementations
- **Comments on "why" not "what"** - Explain decisions, not obvious syntax
- **Consistent naming** - camelCase for variables, PascalCase for types
- **Error handling** - Clear error messages for users
- **Testing first** - Write tests before or alongside implementation

---

## 🎬 Final Deliverables

1. ✅ Working smart contract deployed to Base Sepolia
2. ✅ Backend API deployed to Railway
3. ✅ Event indexer deployed to Railway
4. ✅ Frontend UI deployed to Vercel
5. ✅ PostgreSQL database on Railway
6. ✅ 6-minute demo video
7. ✅ Comprehensive test suite (all passing)
8. ✅ Gas report
9. ✅ Technical documentation (this collection)
10. ✅ Reproducible setup (one-command: `make dev`)

---

*Ready for implementation! Feed these documents to Cursor and begin Phase 1.*
