# ChainEquity - GatedToken Smart Contract

## Overview

GatedToken is an ERC-20 compliant token with compliance-gated transfers for tokenized equity on Base Sepolia. The contract enforces that both sender and recipient must be on an allowlist before any token transfer succeeds.

## Deployment Information

### Base Sepolia Testnet
- **Contract Address**: `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964`
- **Transaction Hash**: `0x0acbd49e0e492c532c494e5fd50d18d1b06bf26a8b23767d0052e8182f20178f`
- **Deployment Block**: `33313307`
- **Chain ID**: `84532`
- **Owner (Safe)**: `0x6264F29968e8fd2810cB79fb806aC65dAf9db73d`
- **Basescan**: https://sepolia.basescan.org/address/0xFCc9E74019a2be5808d63A941a84dEbE0fC39964

### Token Details
- **Name**: ACME Corp Equity
- **Symbol**: ACME
- **Decimals**: 18 (ERC-20 standard)

## Features

### Compliance Gating
- **Allowlist-based transfers**: Both sender and recipient must be approved
- **Revocable approvals**: Admin can revoke wallet approvals at any time
- **Minting restrictions**: Can only mint to approved wallets
- **Burning support**: Can burn tokens from approved wallets

### Corporate Actions
- **Stock Splits**: Virtual split multiplier (gas-efficient, no storage iteration)
- **Symbol Changes**: Mutable token symbol for corporate rebranding
- **Event Tracking**: All corporate actions emit detailed events

### Ownership
- Owned by Gnosis Safe multi-signature wallet (2-of-3)
- All admin functions require owner authorization

## Architecture

### Virtual Split Pattern

The contract uses a gas-efficient virtual split pattern that multiplies balances on read rather than updating storage for all holders:

```solidity
function balanceOf(address account) public view override returns (uint256) {
    return super.balanceOf(account) * splitMultiplier;
}
```

**Example**: After a 7-for-1 split:
- Internal storage: 1000 tokens
- User sees: 7000 tokens (1000 × 7)
- Gas cost: O(1) instead of O(n) where n = number of holders

## Testing

### Test Coverage
- ✅ 10/10 required test scenarios passing
- ✅ 100% coverage of public functions
- ✅ Zero compiler warnings

### Run Tests
```bash
forge test
```

### Generate Gas Report
```bash
forge test --gas-report
```

### Test Results
```
[PASS] testApproveMintVerifyBalance
[PASS] testTransferBetweenApprovedWallets  
[PASS] testTransferToUnapprovedReverts
[PASS] testTransferFromUnapprovedReverts
[PASS] testRevokeApprovalPreventsReceiving
[PASS] testStockSplit7For1
[PASS] testChangeSymbol
[PASS] testUnauthorizedAdminActionReverts
[PASS] testBurnFromApprovedWallet
[PASS] testEdgeCases
```

## Gas Costs

| Operation | Average Gas | Target | Status |
|-----------|-------------|--------|--------|
| Approve Wallet | 44,270 | <50k | ✅ |
| Revoke Wallet | 25,699 | <50k | ✅ |
| Mint Tokens | 66,163 | <100k | ✅ |
| Transfer (gated) | 37,303 | <100k | ✅ |
| Stock Split | 48,314 | <100k | ✅ |
| Symbol Change | 29,056 | <50k | ✅ |
| Burn Tokens | 34,675 | <100k | ✅ |

## Deployment

### Prerequisites
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install
```

### Configure Environment
```bash
cp .env.example .env
# Edit .env with your values
```

### Deploy to Base Sepolia
```bash
source .env
forge script script/Deploy.s.sol \
    --rpc-url $BASE_SEPOLIA_RPC \
    --broadcast \
    --verify \
    -vvvv
```

## Contract Interface

### Admin Functions (onlyOwner)

```solidity
// Allowlist Management
function approveWallet(address wallet) external onlyOwner;
function revokeWallet(address wallet) external onlyOwner;
function isApproved(address wallet) external view returns (bool);

// Token Operations
function mint(address to, uint256 amount) external onlyOwner;
function burn(address from, uint256 amount) external onlyOwner;

// Corporate Actions
function executeSplit(uint256 multiplier) external onlyOwner;
function changeSymbol(string memory newSymbol) external onlyOwner;
```

### Public Functions

```solidity
// ERC-20 Standard (with allowlist enforcement)
function transfer(address to, uint256 amount) external returns (bool);
function balanceOf(address account) external view returns (uint256);
function totalSupply() external view returns (uint256);
function symbol() external view returns (string memory);
function name() external view returns (string memory);
```

## Events

```solidity
event WalletApproved(address indexed wallet, uint256 timestamp);
event WalletRevoked(address indexed wallet, uint256 timestamp);
event TokensMinted(address indexed to, uint256 amount, address indexed minter);
event TokensBurned(address indexed from, uint256 amount, address indexed burner);
event StockSplit(uint256 multiplier, uint256 newTotalSupply, uint256 timestamp);
event SymbolChanged(string oldSymbol, string newSymbol, uint256 timestamp);
```

## Security

### Implemented Protections
- ✅ Solidity 0.8.20 (built-in overflow protection)
- ✅ OpenZeppelin v5.0.0 (audited contracts)
- ✅ Custom errors (gas-efficient reverts)
- ✅ Zero address checks
- ✅ OnlyOwner modifier on admin functions
- ✅ Safe ownership (multi-signature)

### Known Limitations
- **Rounding**: Virtual splits may introduce minor rounding errors (≤ multiplier wei)
- **Block Explorer Caching**: Symbol changes require manual explorer metadata refresh
- **No Pause**: Contract does not implement emergency pause (by design)

## Integration Guide

### For Phase 2 Backend
```typescript
// Contract ABI available at:
// contracts/out/GatedToken.sol/GatedToken.json

const CONTRACT_ADDRESS = "0xFCc9E74019a2be5808d63A941a84dEbE0fC39964";
const START_BLOCK = 33313307;
```

### For Phase 2 Indexer
Monitor these events:
- `WalletApproved` / `WalletRevoked` → Update allowlist cache
- `Transfer` → Track token movements
- `StockSplit` → Update balance multiplier
- `SymbolChanged` → Update token metadata

## Development

### Project Structure
```
contracts/
├── src/
│   └── GatedToken.sol          # Main contract
├── test/
│   └── GatedToken.t.sol        # Test suite
├── script/
│   └── Deploy.s.sol            # Deployment script
├── foundry.toml                # Foundry config
└── README.md                   # This file
```

### Compile
```bash
forge build
```

### Test
```bash
forge test -vvv
```

### Format
```bash
forge fmt
```

## Resources

- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/5.x/
- **Foundry Book**: https://book.getfoundry.sh/
- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Base Docs**: https://docs.base.org

## License

MIT
