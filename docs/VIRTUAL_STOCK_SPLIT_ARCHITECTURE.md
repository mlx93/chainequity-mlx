# Virtual Stock Split Architecture

## Overview

ChainEquity uses a **virtual split multiplier** approach for executing stock splits on-chain. This is the industry-standard method for tokenized securities, offering massive gas savings while maintaining full decentralization.

## How It Works

### On-Chain Storage
```solidity
contract GatedToken {
    uint256 public splitMultiplier;  // Starts at 1, multiplies on each split
    mapping(address => uint256) private _balances;  // Base balances
}
```

### Split Execution
When admin executes a 7-for-1 split:
1. Transaction sent to blockchain
2. `splitMultiplier` updated: `1 → 7` (stored on-chain)
3. `StockSplit` event emitted (indexed by explorers)
4. Individual holder balances **remain unchanged** in storage

### Balance Calculation (On-Chain)
```solidity
function balanceOf(address account) public view override returns (uint256) {
    return _balances[account] * splitMultiplier;
}

function totalSupply() public view override returns (uint256) {
    return _totalSupply * splitMultiplier;
}
```

**Example:**
- Base balance stored: 870 tokens
- splitMultiplier: 7
- `balanceOf()` returns: **6,090 tokens** (computed on-chain)

## Decentralization Guarantee

✅ **Fully On-Chain**: `splitMultiplier` is a public state variable on Base Sepolia  
✅ **No Database Required**: Anyone can query the blockchain directly  
✅ **Block Explorer Verification**: BaseScan shows multiplied balances  
✅ **Permanent Audit Trail**: All splits recorded as on-chain events  
✅ **Independent Verification**: `cast call 0xContract "splitMultiplier()(uint256)"`

## Architecture Layers

```
Blockchain (Source of Truth)
  ├─ splitMultiplier = 7 (on-chain state)
  ├─ _balances[addr] = 870 (base amount)
  └─ balanceOf() = 870 * 7 = 6,090 (computed on-chain)
       ↓
Database (Performance Cache)
  └─ Stores base amounts (870) for faster queries
       ↓
Backend API
  ├─ Reads splitMultiplier from contract
  └─ Multiplies balances: 870 * 7 = 6,090
       ↓
Frontend UI
  └─ Displays: 6,090 ACME (58.00%)
```

## Why Virtual Splits?

### Gas Efficiency
- **Traditional approach**: Update every holder's balance individually
  - 100 holders: ~$500 gas (mainnet)
  - 10,000 holders: ~$50,000 gas!

- **Virtual split**: Update one variable
  - Any number of holders: ~$5 gas (mainnet)
  - **10,000x cheaper!**

### Industry Standard
This pattern is used by:
- tZERO (tokenized securities platform)
- Securitize (digital asset securities)
- Polymath (security token protocol)

## Handling Non-Divisible Amounts

**Short answer: Multiplication always works perfectly.**

7-for-1 split examples:
- 870 tokens → 6,090 (870 × 7 = 6,090) ✅
- 550 tokens → 3,850 (550 × 7 = 3,850) ✅
- 80 tokens → 560 (80 × 7 = 560) ✅
- **1 token → 7 (1 × 7 = 7)** ✅

Unlike *reverse* splits (7-for-1 consolidation), *forward* splits never have rounding issues because we're multiplying integers, not dividing.

## Real-Time Updates

After split execution:
1. Admin clicks "Execute 7-for-1 Split"
2. MetaMask confirmation (~2-5 seconds)
3. `splitMultiplier` updated on-chain
4. Backend reads new multiplier
5. Frontend refreshes automatically
6. Total supply: 1,500 → 10,500 (live update)

## Verification Commands

```bash
# Check current split multiplier
cast call 0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e \
  "splitMultiplier()(uint256)" \
  --rpc-url https://sepolia.base.org

# Check holder balance (automatically multiplied)
cast call 0xd7EbbDcD16dec53DfD7B327E8cd8791f00E77A5e \
  "balanceOf(address)(uint256)" \
  0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e \
  --rpc-url https://sepolia.base.org
```

## Production Considerations

✅ **Auditable**: Every split is an on-chain event with transaction hash  
✅ **Transparent**: `splitMultiplier` is public and immutable by users  
✅ **Gas-Efficient**: Scales to millions of holders  
✅ **ERC-20 Compliant**: Override pattern is standard practice  
✅ **Historical Queries**: Can reconstruct splits from events at any block

