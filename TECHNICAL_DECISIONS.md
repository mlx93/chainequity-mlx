# ChainEquity - Technical Decisions

## Project Context
**Timeline**: 2 days  
**Purpose**: Job interview prototype demonstrating tokenized securities with compliance gating  
**Demo Format**: 5-7 minute video showing core functionality

---

## Infrastructure & Chain Selection

### **Base Sepolia Testnet → Production-ready for Base/Arbitrum Mainnet**
**Decision**: Deploy to Base Sepolia for development and demo, with architecture ready for mainnet deployment.

**Rationale**: OP-Stack maturity provides EVM equivalence with no code changes needed to retarget Arbitrum. EIP-4844 blob pricing reduces L2 transaction fees to pennies, making gas costs negligible for demo workload. Coinbase provides excellent documentation, easy faucet access, and strong third-party infrastructure support.

---

## Smart Contract Stack

### **Foundry + Solidity + OpenZeppelin ERC-20**
**Decision**: Use Foundry as the development framework with OpenZeppelin's battle-tested ERC-20 base implementation.

**Rationale**: Foundry offers faster compilation and testing than Hardhat, with built-in gas reporting critical for the success criteria. OpenZeppelin contracts are industry-standard, audited, and provide the necessary ERC-20 foundation with proven security.

### **Allowlist Storage: Mapping-Based (Option A)**
**Decision**: Store approved wallets in a simple `mapping(address => bool)` within the token contract.

**Rationale**: Self-contained, gas-efficient (single SLOAD per check), standard pattern for gated tokens, easy to query, meets all PDF requirements without additional complexity. No need for batch approval with ~5-10 test wallets in demo.

### **Stock Split: Virtual Implementation (Option C)**
**Decision**: Use internal split multiplier applied at read time rather than iterating through all holders on-chain.

**Rationale**: Professional approach used in production systems. Extremely gas-efficient (~50k gas vs millions for iteration), clean implementation, easy to test, maintains mathematical accuracy. This is how real tokenized securities would implement splits at scale.

### **Symbol Change: Mutable Metadata (Option A)**
**Decision**: Update contract metadata directly if the ERC-20 implementation allows mutable name/symbol fields.

**Rationale**: Simplest approach requiring one transaction, preserves all balances and ownership, standard capability in modern ERC-20 implementations. No migration or wrapper complexity needed.

### **Admin Access Control: Multi-Sig via Gnosis Safe (2-of-3)**
**Decision**: Deploy Gnosis Safe as contract owner requiring 2-of-3 signatures for admin actions.

**Rationale**: Industry standard for real tokenized securities, demonstrates decentralization principles, production-realistic, visually impressive for demo. Safe UI provides easy manual interaction without custom multi-sig code. Aligns with crypto ethos while being practical.

---

## Backend & Services

### **Node.js + TypeScript + Express + viem**
**Decision**: Build issuer service as a TypeScript Express API using viem for blockchain interactions.

**Rationale**: viem provides type-safe, modern blockchain interactions with 10x smaller bundles than ethers.js. TypeScript catches errors at compile time, Express is simple and proven for REST APIs. Fast development without unnecessary complexity.

### **Event Indexer: TypeScript + viem + SQLite**
**Decision**: Separate indexer service listening to contract events, storing in SQLite database.

**Rationale**: Lightweight data storage perfect for prototype scale, supports historical queries via SQL, no complex database setup, easy to seed test data. Event-driven architecture separates concerns cleanly from issuer service.

### **Indexer Architecture: Naive Approach (Option A)**
**Decision**: Treat blocks as immediately final without waiting for confirmations or handling reorgs.

**Rationale**: Base Sepolia uses centralized sequencer with virtually zero reorg risk in practice. Meets "<10s after finality" requirement when interpreting finality as sequencer confirmation. Avoids unnecessary complexity for L2 demo environment.

---

## Frontend

### **React + Vite + wagmi + shadcn/ui + Tailwind**
**Decision**: Modern React stack with pre-built beautiful UI components and Web3 wallet integration hooks.

**Rationale**: Job interview context demands polished, professional appearance. shadcn/ui provides production-quality components with animations and dark mode. wagmi (built on viem) makes wallet connection trivial. Vite ensures fast development and builds.

### **Demo Format: Single URL, Two Browser Windows (Chrome + Safari)**
**Decision**: Deploy one UI to Vercel, open in two different browsers with separate wallet connections.

**Rationale**: Most authentic demonstration of real user interactions. Shows actual MetaMask/wallet behavior rather than simulated role-switching. Realistic user experience for interviewers to understand.

### **UI Polish Level: Polished with Animations**
**Decision**: Use shadcn/ui components, implement animations/transitions, include dark mode support.

**Rationale**: Job interview requires impressing potential employer. Professional appearance demonstrates attention to detail and production-quality standards. Pre-built components save time while maintaining high polish.

---

## Testing Strategy

### **Tier 1 (Foundry) + Tier 2 (TypeScript Integration), Skip E2E**
**Decision**: Comprehensive Solidity contract tests via Foundry, TypeScript integration tests for backend/indexer, manual demo video covers end-to-end flows.

**Rationale**: 2-day timeline requires focus on highest-impact testing. Foundry contract tests catch 90% of issues and provide gas benchmarks. TypeScript tests verify backend correctness. Manual demo in video effectively covers E2E scenarios without Playwright overhead.

---

## Deployment & Hosting

### **Vercel (UI) + Railway (Backend/Indexer)**
**Decision**: Host React frontend on Vercel, deploy backend services to Railway.

**Rationale**: Vercel provides seamless GitHub integration with instant deploys for frontend. Railway offers minimal setup friction with Docker Compose support and free tier sufficient for demo. Both platforms are reliable and developer-friendly.

### **Base Sepolia Faucet for Test ETH**
**Decision**: Use Coinbase's official Base Sepolia faucet to fund three test wallets (Admin, Investor A, Investor B).

**Rationale**: Official faucet ensures reliability, free testnet ETH available on demand, well-documented process. Three wallets sufficient for demonstrating all required flows in demo.

---

## Event Schema

### **Events: Transfer, WalletApproved, WalletRevoked, StockSplit, SymbolChanged, TokensMinted**
**Decision**: Implement comprehensive event logging covering all state changes and admin actions.

**Rationale**: Complete audit trail enables accurate cap-table reconstruction at any block height. Events support indexer functionality and provide transparency required for compliance-gated securities. TokensMinted distinguishes mints from transfers for cleaner indexing logic.

---

## Development Workflow

### **One-Command Setup: Makefile + Docker Compose**
**Decision**: Provide `make dev` command that orchestrates all services via Docker Compose.

**Rationale**: PDF explicitly requires one-command setup and reproducible scripts. Makefile provides clear entry points, Docker Compose handles service orchestration, anyone can clone repo and run demo immediately.

### **Reproducible Deployment Scripts**
**Decision**: Include scripts that deploy contracts to testnet, seed demo data, and export all addresses/hashes.

**Rationale**: PDF requires documented deployment addresses and reproducibility. Scripts ensure consistent demo environment and allow others to deploy their own instances for testing.

---

## Documentation

### **Concise README (1-2 pages) + Separate Architecture Doc**
**Decision**: Brief README covering setup/usage, detailed ARCHITECTURE.md with system design diagrams, DECISIONS.md documenting choices (this file).

**Rationale**: Balances accessibility for quick start with depth for technical evaluation. Separate concerns: README for "how to run," ARCHITECTURE for "how it works," DECISIONS for "why we built it this way."

### **Gas Report via Foundry**
**Decision**: Generate and commit gas benchmarks for all contract operations using Foundry's built-in gas reporter.

**Rationale**: PDF requires gas report as success criteria. Foundry provides this automatically with `forge test --gas-report`, meeting requirement with zero additional tooling.

---

## Security & Best Practices

### **Environment Variables + .env.example**
**Decision**: All secrets (private keys, RPC URLs, API keys) via environment variables with documented .env.example template.

**Rationale**: PDF explicitly requires secrets management. Never commit credentials to Git, provide clear template for users to configure their own deployment.

### **Disclaimer: Not Regulatory-Compliant**
**Decision**: Include prominent disclaimer that this is a technical prototype, not production-ready for real securities.

**Rationale**: PDF constraint requires avoiding compliance claims. This prototype demonstrates technical feasibility but would require legal review and regulatory compliance work for production use.

---

## Key Architectural Principles

1. **Simplicity**: Favor straightforward implementations over complex abstractions given 2-day timeline
2. **Production-Representative**: Choose patterns that would actually be used in real systems (multi-sig, virtual splits)
3. **Gas-Conscious**: Optimize for reasonable gas costs even though L2 makes this less critical
4. **Decentralization-Minded**: Admin controls via multi-sig rather than single owner
5. **Testability**: Design for comprehensive testing to meet correctness requirements
6. **Demonstrability**: Architecture supports clear, impressive video demonstration

---

## Trade-offs Accepted

1. **Virtual Split over On-Chain Iteration**: Sacrificed visual "all balances update" for professional implementation
2. **Naive Indexer over Reorg Handling**: Accepted theoretical reorg risk for simplicity on L2
3. **Manual Safe Setup over Programmatic**: Chose visual demo appeal over full automation
4. **Polished UI over Time Savings**: Invested in shadcn/ui despite 2-day timeline for interview impact
5. **Testnet over Local Dev**: Required public deployment adds complexity but enables sharing

---

## Success Metrics Alignment

Every decision maps to PDF success criteria:

- **Correctness (0 false positives/negatives)**: Comprehensive Foundry test suite
- **Operability (cap-table export)**: SQLite indexer with CSV/JSON export endpoints
- **Corporate Actions (split + symbol)**: Virtual split + mutable metadata implementations
- **Performance (testnet norms, <10s finality)**: Base L2 provides fast confirmation, naive indexer meets timing
- **Documentation (clear rationale)**: This document + ARCHITECTURE.md + inline code comments

---

*Last Updated: [Date will be auto-generated]*
