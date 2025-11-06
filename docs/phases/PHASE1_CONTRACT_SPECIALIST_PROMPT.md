# Phase 1: Smart Contract Development - ChainEquity

**Role**: Contract Specialist Sub-Agent  
**Model Recommendation**: Claude Sonnet 4.5 (best for Solidity)  
**Estimated Duration**: 3-4 hours  
**Workspace**: `/Users/mylessjs/Desktop/ChainEquity`

---

## Your Mission

Implement, test, and deploy the **GatedToken** smart contract for the ChainEquity tokenized equity prototype. This contract enforces compliance-gated transfers via an on-chain allowlist, supports corporate actions (stock splits, symbol changes), and is owned by a Gnosis Safe multi-signature wallet.

**You are the implementation specialist** - write production-quality Solidity code with comprehensive tests.

---

## Project Context

ChainEquity is a tokenized equity prototype demonstrating compliance-gated securities on Base Sepolia. The system enforces that **both sender and recipient must be on an allowlist** before any token transfer succeeds. This Phase 1 focuses solely on the smart contract layer.

**Key Principle**: The blockchain is the source of truth. All state lives on-chain.

---

## Technical Specifications

### **Contract: GatedToken.sol**

**Purpose**: ERC-20 token with allowlist-based transfer restrictions and corporate action support.

**Inheritance**:
```solidity
contract GatedToken is ERC20, Ownable
```

**OpenZeppelin Version**: `v5.0.0`

**State Variables**:
```solidity
// Allowlist mapping: address => approved status
mapping(address => bool) public allowlist;

// Virtual split multiplier (starts at 1, multiply for splits)
uint256 public splitMultiplier;

// Mutable token metadata
string private _tokenSymbol;
string private _tokenName;

// Corporate action tracking
uint256 public totalSplits;
uint256 public lastSplitBlock;
```

**Events**:
```solidity
event WalletApproved(address indexed wallet, uint256 timestamp);
event WalletRevoked(address indexed wallet, uint256 timestamp);
event TokensMinted(address indexed to, uint256 amount, address indexed minter);
event TokensBurned(address indexed from, uint256 amount, address indexed burner);
event StockSplit(uint256 multiplier, uint256 newTotalSupply, uint256 timestamp);
event SymbolChanged(string oldSymbol, string newSymbol, uint256 timestamp);
```

**Constructor**:
```solidity
constructor(
    string memory name,
    string memory symbol,
    address safeAddress
) ERC20(name, symbol) Ownable(safeAddress) {
    splitMultiplier = 1;
    _tokenName = name;
    _tokenSymbol = symbol;
}
```

**Core Functions**:

```solidity
// Allowlist Management (onlyOwner)
function approveWallet(address wallet) external onlyOwner;
function revokeWallet(address wallet) external onlyOwner;
function isApproved(address wallet) external view returns (bool);

// Minting (onlyOwner, only to approved wallets)
function mint(address to, uint256 amount) external onlyOwner;
// Logic: require(allowlist[to], "Recipient not approved");
//        _mint(to, amount);
//        emit TokensMinted(to, amount, msg.sender);

// Burning (onlyOwner, from approved wallets)
function burn(address from, uint256 amount) external onlyOwner;
// Logic: require(allowlist[from], "Cannot burn from unapproved wallet");
//        _burn(from, amount);
//        emit TokensBurned(from, amount, msg.sender);

// Transfer Override (ERC-20 with allowlist check)
function _update(address from, address to, uint256 amount) internal virtual override;
// Logic: if (from != address(0)) require(allowlist[from], "Sender not approved");
//        require(allowlist[to], "Recipient not approved");
//        super._update(from, to, amount);

// Corporate Actions (onlyOwner)
function executeSplit(uint256 multiplier) external onlyOwner;
// Logic: require(multiplier >= 2, "Multiplier must be >= 2");
//        splitMultiplier *= multiplier;
//        totalSplits++;
//        lastSplitBlock = block.number;
//        emit StockSplit(multiplier, totalSupply(), block.timestamp);

function changeSymbol(string memory newSymbol) external onlyOwner;
// Logic: string memory oldSymbol = _tokenSymbol;
//        _tokenSymbol = newSymbol;
//        emit SymbolChanged(oldSymbol, newSymbol, block.timestamp);

// Symbol Override (return mutable state variable)
function symbol() public view override returns (string memory);
// Logic: return _tokenSymbol;

// Virtual Split Support
function balanceOf(address account) public view override returns (uint256);
// Logic: return super.balanceOf(account) * splitMultiplier;

function totalSupply() public view override returns (uint256);
// Logic: return super.totalSupply() * splitMultiplier;
```

**Gas Optimization Requirements**:
- Use `mapping` instead of arrays for allowlist (O(1) lookup)
- Virtual split avoids iterating through all holders
- Custom errors instead of string reverts
- Pack state variables where possible

**Security Requirements**:
- `onlyOwner` modifier on all admin functions
- Zero address checks on minting/approvals
- Integer overflow protection (Solidity 0.8.x default)

---

## Your Deployment Values

**Use these EXACT values in deployment scripts:**

```solidity
// Constructor Arguments
string memory name = "ACME Corp Equity";
string memory symbol = "ACME";
address safeAddress = 0x6264F29968e8fd2810cB79fb806aC65dAf9db73d;
```

**Environment Variables** (create `contracts/.env`):
```bash
ADMIN_PRIVATE_KEY=0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe
BASE_SEPOLIA_RPC=https://sepolia.base.org
SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
CHAIN_ID=84532
```

**Test Wallet Addresses** (for testing):
```solidity
address admin = 0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6;
address investorA = 0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e;
address investorB = 0xefd94a1534959e04630899abdd5d768601f4af5b;
address unapprovedWallet = address(0x9999); // For negative tests
```

---

## Test Requirements

Implement comprehensive Foundry tests covering all 10 required scenarios:

### **Test File: `test/GatedToken.t.sol`**

**Required Test Cases**:

1. ✅ **Approve wallet → Mint tokens → Verify balance**
   ```solidity
   function testApproveMintVerifyBalance() public
   ```

2. ✅ **Transfer between two approved wallets → SUCCESS**
   ```solidity
   function testTransferBetweenApprovedWallets() public
   ```

3. ✅ **Transfer from approved to non-approved → REVERT**
   ```solidity
   function testTransferToUnapprovedReverts() public
   ```

4. ✅ **Transfer from non-approved to approved → REVERT**
   ```solidity
   function testTransferFromUnapprovedReverts() public
   ```

5. ✅ **Revoke approval → Previously approved wallet can no longer receive**
   ```solidity
   function testRevokeApprovalPreventsReceiving() public
   ```

6. ✅ **Execute 7-for-1 split → All balances multiply by 7, total supply updates**
   ```solidity
   function testStockSplit7For1() public
   ```

7. ✅ **Change symbol → Metadata updates, balances unchanged**
   ```solidity
   function testChangeSymbol() public
   ```

8. ✅ **Unauthorized wallet attempts admin action → REVERT**
   ```solidity
   function testUnauthorizedAdminActionReverts() public
   ```

9. ✅ **Burn tokens from approved wallet → SUCCESS**
   ```solidity
   function testBurnFromApprovedWallet() public
   ```

10. ✅ **Edge cases** (zero amounts, self-transfer, etc.)
    ```solidity
    function testEdgeCases() public
    ```

**Test Coverage Target**: 100% of public functions

---

## Gas Benchmarks (Target)

Expected gas costs on Base Sepolia:

| Operation | Target Gas | Notes |
|-----------|-----------|-------|
| Approve Wallet | <50k | Simple mapping update |
| Revoke Wallet | <50k | Mapping deletion |
| Mint Tokens | <100k | Mint + approval check |
| Transfer (gated) | <100k | Transfer + 2x allowlist checks |
| Stock Split | <100k | Update multiplier only (virtual) |
| Symbol Change | <50k | String storage update |
| Burn Tokens | <100k | Burn + approval check |

Generate gas report with: `forge test --gas-report`

---

## Project Structure

Create the following structure:

```
ChainEquity/
├── contracts/
│   ├── src/
│   │   └── GatedToken.sol
│   ├── test/
│   │   └── GatedToken.t.sol
│   ├── script/
│   │   ├── Deploy.s.sol
│   │   └── SeedData.s.sol (optional, simple version)
│   ├── lib/
│   │   └── (Foundry dependencies)
│   ├── .env
│   ├── .env.example
│   ├── foundry.toml
│   └── README.md
```

---

## Step-by-Step Implementation Guide

### **Step 1: Initialize Foundry Project** (5 minutes)

```bash
cd /Users/mylessjs/Desktop/ChainEquity
mkdir contracts && cd contracts
forge init --no-commit
```

### **Step 2: Install Dependencies** (2 minutes)

```bash
forge install OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-commit
```

Update `foundry.toml`:
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.20"
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
base_sepolia = "${BASE_SEPOLIA_RPC}"
```

### **Step 3: Create .env File** (2 minutes)

```bash
# Create .env with values from above
echo "ADMIN_PRIVATE_KEY=0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe" > .env
echo "BASE_SEPOLIA_RPC=https://sepolia.base.org" >> .env
echo "SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d" >> .env
echo "CHAIN_ID=84532" >> .env

# Create .env.example (without sensitive values)
echo "ADMIN_PRIVATE_KEY=0xYourPrivateKeyHere" > .env.example
echo "BASE_SEPOLIA_RPC=https://sepolia.base.org" >> .env.example
echo "SAFE_ADDRESS=0xYourSafeAddress" >> .env.example
echo "CHAIN_ID=84532" >> .env.example
```

### **Step 4: Implement GatedToken.sol** (60-90 minutes)

Write the contract following the specifications above. Key implementation notes:

**Symbol Override**:
```solidity
function symbol() public view override returns (string memory) {
    return _tokenSymbol;
}
```

**Virtual Split Pattern**:
```solidity
function balanceOf(address account) public view override returns (uint256) {
    return super.balanceOf(account) * splitMultiplier;
}
```

**Transfer Restriction** (OpenZeppelin v5 uses `_update` instead of `_beforeTokenTransfer`):
```solidity
function _update(address from, address to, uint256 amount) internal virtual override {
    // Allow minting (from == address(0))
    if (from != address(0)) {
        require(allowlist[from], "Sender not approved");
    }
    // Always check recipient
    require(allowlist[to], "Recipient not approved");
    
    super._update(from, to, amount);
}
```

### **Step 5: Write Comprehensive Tests** (60-90 minutes)

Implement all 10 test scenarios in `test/GatedToken.t.sol`. Use Foundry's testing features:
- `vm.prank(address)` to simulate different callers
- `vm.expectRevert()` for negative tests
- `assertEq()` for value assertions

### **Step 6: Run Tests** (5 minutes)

```bash
forge test -vvv
forge test --gas-report
```

Verify:
- ✅ All tests passing
- ✅ Gas costs within targets
- ✅ No warnings

### **Step 7: Create Deployment Script** (20 minutes)

`script/Deploy.s.sol`:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {GatedToken} from "../src/GatedToken.sol";

contract DeployGatedToken is Script {
    function run() external returns (GatedToken) {
        uint256 deployerPrivateKey = vm.envUint("ADMIN_PRIVATE_KEY");
        address safeAddress = vm.envAddress("SAFE_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        GatedToken token = new GatedToken(
            "ACME Corp Equity",
            "ACME",
            safeAddress
        );
        
        vm.stopBroadcast();
        
        return token;
    }
}
```

### **Step 8: Deploy to Base Sepolia** (10 minutes)

```bash
# Load environment variables
source .env

# Deploy
forge script script/Deploy.s.sol \
    --rpc-url $BASE_SEPOLIA_RPC \
    --broadcast \
    --verify \
    -vvvv

# Verify contract (if auto-verify fails)
# forge verify-contract <CONTRACT_ADDRESS> \
#     src/GatedToken.sol:GatedToken \
#     --chain-id 84532 \
#     --constructor-args $(cast abi-encode "constructor(string,string,address)" "ACME Corp Equity" "ACME" "0x6264F29968e8fd2810cB79fb806aC65dAf9db73d")
```

**Save these outputs**:
- Contract address: `0x...`
- Transaction hash: `0x...`
- Deployment block number: `XXXXXX`
- Basescan verification link

### **Step 9: Verify Deployment** (5 minutes)

```bash
# Check contract owner
cast call <CONTRACT_ADDRESS> "owner()" --rpc-url $BASE_SEPOLIA_RPC

# Should return: 0x6264F29968e8fd2810cB79fb806aC65dAf9db73d (Safe address)

# Check initial state
cast call <CONTRACT_ADDRESS> "symbol()" --rpc-url $BASE_SEPOLIA_RPC
cast call <CONTRACT_ADDRESS> "splitMultiplier()" --rpc-url $BASE_SEPOLIA_RPC
```

---

## Success Criteria

Your Phase 1 is complete when ALL of the following are true:

- [ ] GatedToken.sol implemented with all required functions
- [ ] All 10 test scenarios passing (`forge test`)
- [ ] Gas report generated showing costs within targets
- [ ] Contract deployed to Base Sepolia
- [ ] Contract verified on Basescan (https://sepolia.basescan.org)
- [ ] Safe (0x6264...b73d) is confirmed as contract owner
- [ ] Deployment block number documented
- [ ] No compiler warnings or errors

---

## Report Template

When you complete Phase 1, generate this report for the Orchestrator:

```markdown
# Phase 1: Smart Contract Development - COMPLETE

## Status
✅ Complete

## Deliverables

### 1. Contract Deployment
- **Contract Address**: 0x...
- **Transaction Hash**: 0x...
- **Deployment Block**: XXXXXX
- **Basescan Link**: https://sepolia.basescan.org/address/0x...
- **Owner Verified**: ✅ Safe (0x6264F29968e8fd2810cB79fb806aC65dAf9db73d)

### 2. Test Results
- **Total Tests**: 10
- **Passing**: 10
- **Failing**: 0
- **Coverage**: 100% of public functions

### 3. Gas Report
| Operation | Actual Gas | Target | Status |
|-----------|-----------|--------|--------|
| Approve Wallet | XXXXXk | <50k | ✅ |
| Mint Tokens | XXXXXk | <100k | ✅ |
| Transfer | XXXXXk | <100k | ✅ |
| Stock Split | XXXXXk | <100k | ✅ |
| Symbol Change | XXXXXk | <50k | ✅ |
| Burn Tokens | XXXXXk | <100k | ✅ |

### 4. Files Created
- `contracts/src/GatedToken.sol` (XXX lines)
- `contracts/test/GatedToken.t.sol` (XXX lines)
- `contracts/script/Deploy.s.sol` (XX lines)
- `contracts/foundry.toml`
- `contracts/.env.example`
- `contracts/README.md`

### 5. Next Phase Requirements

**For Phase 2 Backend:**
- CONTRACT_ADDRESS=0x...
- CONTRACT_ABI=[...] (see contracts/out/GatedToken.sol/GatedToken.json)

**For Phase 2 Indexer:**
- START_BLOCK=XXXXXX (deployment block number)
- CONTRACT_ADDRESS=0x...

## Blockers
None

## Notes
- Virtual split implementation verified working
- Symbol override pattern confirmed (block explorers may cache old symbol)
- All transfer restrictions enforced correctly
- Ready for Phase 2 parallel execution (Backend + Indexer)
```

---

## Important Notes

### **OpenZeppelin v5 Changes**
- Use `_update()` instead of `_beforeTokenTransfer()`
- `Ownable` constructor requires initial owner address
- Import paths: `@openzeppelin/contracts/...`

### **Virtual Split Pattern**
The split multiplier is applied in `balanceOf()` and `totalSupply()` view functions, not by actually updating storage for all holders. This is gas-efficient and production-grade.

### **Symbol Change Limitation**
Block explorers (Basescan) cache metadata at deployment. After changing the symbol on-chain, the explorer will still show "ACME" unless you manually request an update. Wallets and the frontend will correctly read the new symbol via the contract's `symbol()` function.

### **Safe Ownership**
The contract is owned by the Safe, not the admin wallet. All admin functions will require 2-of-3 signatures. For testing during development, you can temporarily use the admin address as owner, then transfer ownership to the Safe after deployment.

---

## Troubleshooting

**Issue**: Deployment fails with "insufficient funds"
- **Solution**: Check admin wallet balance: `cast balance 0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6 --rpc-url $BASE_SEPOLIA_RPC`

**Issue**: Verification fails on Basescan
- **Solution**: Manually verify using the Basescan UI with constructor args

**Issue**: Tests fail with "EvmError: Revert"
- **Solution**: Run with `-vvvv` for full trace: `forge test -vvvv`

**Issue**: RPC rate limiting
- **Solution**: Base Sepolia public RPC should be sufficient; if issues persist, use Alchemy

---

## Resources

- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/5.x/
- **Foundry Book**: https://book.getfoundry.sh/
- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Base Docs**: https://docs.base.org

---

**BEGIN IMPLEMENTATION NOW!**

Start with Step 1 (Initialize Foundry Project) and work through each step methodically. Focus on code quality and thorough testing. When complete, provide the report template filled out with your actual results.

Good luck! 🚀

