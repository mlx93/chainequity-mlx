# ChainEquity - Demo Setup Fix

## Problem

The contract owner is the Gnosis Safe (`0x6264...73d`), but the backend is configured to sign transactions with the Admin wallet (`0x4F10...24C6`). This causes "OwnableUnauthorizedAccount" errors when trying to approve wallets or execute admin actions.

## Solution: Transfer Ownership to Admin Wallet (For Demo)

**⚠️ For demo/testing purposes only. In production, keep Gnosis Safe as owner.**

### Step 1: Access Gnosis Safe

1. Go to https://app.safe.global
2. Connect with one of the Safe owner wallets
3. Navigate to your Safe: `0x6264F29968e8fd2810cB79fb806aC65dAf9db73d` on Base Sepolia

### Step 2: Transfer Ownership

1. In Safe, go to "New Transaction" → "Contract Interaction"
2. **Contract Address**: `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964` (GatedToken)
3. **Method**: `transferOwnership`
4. **New Owner**: `0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6` (Admin wallet)
5. Submit transaction
6. Get required signatures (2 of 3)
7. Execute transaction

### Step 3: Verify Ownership Transfer

Check the contract owner:
```bash
curl -s "https://sepolia.base.org" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_call",
    "params":[{
      "to":"0xFCc9E74019a2be5808d63A941a84dEbE0fC39964",
      "data":"0x8da5cb5b"
    },"latest"],
    "id":1
  }' | jq -r '.result'
```

Should return: `0x0000000000000000000000004f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6`

### Step 4: Retry Approval

Now the backend should be able to approve wallets successfully.

---

## Alternative: Use Foundry Script (Faster)

If you have the Safe owner private keys:

```bash
cd contracts

# Transfer ownership using foundry
cast send 0xFCc9E74019a2be5808d63A941a84dEbE0fC39964 \
  "transferOwnership(address)" \
  0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6 \
  --private-key $SAFE_OWNER_PRIVATE_KEY \
  --rpc-url https://sepolia.base.org
```

---

## After Testing: Transfer Back to Safe (Optional)

After demo, you can transfer ownership back to the Safe:

```bash
cast send 0xFCc9E74019a2be5808d63A941a84dEbE0fC39964 \
  "transferOwnership(address)" \
  0x6264F29968e8fd2810cB79fb806aC65dAf9db73d \
  --private-key $ADMIN_PRIVATE_KEY \
  --rpc-url https://sepolia.base.org
```

---

## Why This Happened

The contract was deployed with the Gnosis Safe as owner (for production security), but the backend is configured to sign transactions directly with the Admin wallet (for demo speed). For the demo to work, ownership needs to match the wallet the backend is using.

