# Manual Testing Guide - ChainEquity UI

**Quick Start**: Yes, you need to mint tokens first! Follow this step-by-step guide.

---

## Prerequisites

1. **MetaMask Setup**:
   - Install MetaMask browser extension
   - Add Base Sepolia network (Chain ID: 84532, RPC: `https://sepolia.base.org`)
   - Import 3 test wallets (see `wallet-addresses.txt` for addresses)
   - Fund each wallet with testnet ETH (get from Base Sepolia faucet)

2. **Access Frontend**:
   - URL: `https://chainequity-mlx.vercel.app/`
   - Open in browser (Chrome recommended for Admin, Safari/Incognito for investors)

3. **Test Wallets**:
   - **Admin**: `0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6`
   - **Investor A**: `0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e`
   - **Investor B**: `0xefd94a1534959e04630899abdd5d768601f4af5b`

## ⚠️ Important: MetaMask Connection

**Connect ONE account at a time** - MetaMask only connects one account per connection.

- When you click "Connect Wallet", MetaMask will show a list of your accounts
- **Select only the account you want to use** for that test (e.g., Admin wallet)
- The frontend will use whichever account is currently active in MetaMask
- To switch accounts: Change the active account in MetaMask, and the frontend will detect it automatically
- **Don't try to select all 3 accounts** - that's not how MetaMask works

---

## Testing Workflow

### Step 1: Connect Admin Wallet & Approve Investors

1. Open frontend in **Chrome** (or primary browser)
2. Click "Connect Wallet" → Select MetaMask
3. **In MetaMask popup**: Select **ONLY the Admin wallet** (the first account)
   - MetaMask will show a list of your accounts
   - Click on the Admin wallet address: `0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6`
   - Click "Next" → "Connect"
4. Verify you're on **Base Sepolia** network (MetaMask should prompt if not)
5. Navigate to **Admin Dashboard**
6. **Approve Investor A**:
   - Find "Approve Wallet" section
   - Enter Investor A address: `0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e`
   - Click "Approve Wallet" → Confirm in MetaMask
   - Wait for transaction confirmation
7. **Approve Investor B**:
   - Enter Investor B address: `0xefd94a1534959e04630899abdd5d768601f4af5b`
   - Click "Approve Wallet" → Confirm in MetaMask
   - Wait for transaction confirmation

**✅ Checkpoint**: Both investors should show as "Approved" in the UI

---

### Step 2: Mint Tokens to Approved Wallets

**Yes, you need to mint tokens first!** The contract starts with 0 supply.

1. Still in **Admin Dashboard** (Admin wallet connected)
2. Navigate to **"Mint Tokens"** section
3. **Mint to Investor A**:
   - Recipient: `0x0d9cf1dc3e134a736aafb1296d2b316742b5c13e`
   - Amount: `10000` (tokens)
   - Click "Mint Tokens" → Confirm in MetaMask
   - Wait for confirmation (~5-10 seconds on Base Sepolia)
4. **Verify**:
   - Check "Cap Table" page - Investor A should show 10,000 tokens
   - Check transaction appears in history

**✅ Checkpoint**: Investor A has 10,000 tokens, total supply = 10,000

---

### Step 3: Test Transfer Between Approved Wallets

1. **Switch to Investor A wallet**:
   - **Option A (Same Browser)**: In MetaMask, click the account icon → Switch to **Investor A** account → Frontend will auto-detect the change
   - **Option B (Different Browser)**: Open frontend in **Safari** (or incognito window) → Click "Connect Wallet" → Select **ONLY Investor A** wallet
   - Navigate to **Investor View**
2. **Verify Balance**:
   - Should see: "Balance: 10,000 ACME (100%)"
3. **Transfer to Investor B**:
   - Click "Transfer Tokens"
   - Recipient: `0xefd94a1534959e04630899abdd5d768601f4af5b`
   - Amount: `3000` (tokens)
   - Click "Transfer" → Confirm in MetaMask
   - Wait for confirmation
4. **Verify**:
   - Investor A balance: 7,000 tokens (70%)
   - Investor B balance: 3,000 tokens (30%)
   - Check Cap Table page - both balances updated
   - Transaction appears in history

**✅ Checkpoint**: Transfer succeeded, balances updated correctly

---

### Step 4: Test Transfer to Non-Approved Wallet (Should Fail)

1. Still in **Investor A** view
2. **Attempt Transfer to Unapproved Wallet**:
   - Recipient: Any address NOT approved (e.g., `0x1234567890123456789012345678901234567890`)
   - Amount: `1000`
   - Click "Transfer"
3. **Expected Result**:
   - ❌ Transaction should **revert** with error: "RecipientNotApproved"
   - Frontend should show error message before transaction (client-side validation)
   - Balances unchanged

**✅ Checkpoint**: Transfer correctly blocked, error message displayed

---

### Step 5: Approve New Wallet & Retry Transfer

1. **Switch back to Admin wallet** (Chrome)
2. **Approve the new wallet**:
   - Admin Dashboard → Approve Wallet
   - Enter the wallet address from Step 4
   - Click "Approve Wallet" → Confirm
3. **Retry Transfer** (Investor A):
   - Same transfer from Step 4
   - Should now **succeed** ✅
   - Verify balances updated

**✅ Checkpoint**: Approval → Transfer flow works correctly

---

### Step 6: Execute 7-for-1 Stock Split

1. **Admin Dashboard** (Admin wallet connected)
2. Navigate to **"Corporate Actions"** section
3. **Note Current Balances** (for verification):
   - Investor A: 7,000 tokens
   - Investor B: 3,000 tokens
   - Total: 10,000 tokens
4. **Execute Split**:
   - Click "Execute Stock Split"
   - Enter multiplier: `7`
   - Confirm warning message
   - Click "Execute" → Confirm in MetaMask
   - Wait for confirmation
5. **Verify**:
   - Investor A: 49,000 tokens (70% - unchanged)
   - Investor B: 21,000 tokens (30% - unchanged)
   - Total supply: 70,000 tokens
   - Corporate actions shows split entry

**✅ Checkpoint**: All balances multiplied by 7, percentages unchanged

**⚠️ Important**: After split, transfer amounts must be divisible by 7 (e.g., 700, 1400, 2100, 3500, 7000)

---

### Step 7: Change Ticker Symbol

1. Still in **Admin Dashboard** → Corporate Actions
2. **Change Symbol**:
   - Click "Change Symbol"
   - Current: "ACME"
   - Enter new: "ACMEX"
   - Click "Update Symbol" → Confirm in MetaMask
   - Wait for confirmation
3. **Verify**:
   - Frontend displays "ACMEX" instead of "ACME"
   - Balances unchanged
   - Corporate actions shows symbol change entry

**✅ Checkpoint**: Symbol updated, balances unchanged

---

### Step 8: Export Cap-Table & Historical Query

1. Navigate to **"Cap Table"** page
2. **Current Cap-Table**:
   - Should show both investors with current balances
   - Click "Download CSV" → Verify file downloads
   - Click "Download JSON" → Verify file downloads
3. **Historical Query**:
   - Find "View cap-table at block" section
   - Enter block number from **before the stock split** (check transaction history)
   - Click "Query Historical"
   - Verify table shows pre-split balances (7,000 and 3,000)
   - Test historical export (CSV/JSON)

**✅ Checkpoint**: Current and historical cap-table exports work

---

## Quick Testing Checklist

- [ ] Connect Admin wallet
- [ ] Approve Investor A wallet
- [ ] Approve Investor B wallet
- [ ] Mint 10,000 tokens to Investor A
- [ ] Verify Cap Table shows Investor A with 10,000 tokens
- [ ] Connect Investor A wallet
- [ ] Transfer 3,000 tokens to Investor B
- [ ] Verify both balances updated (7,000 and 3,000)
- [ ] Attempt transfer to non-approved wallet (should fail)
- [ ] Approve new wallet as Admin
- [ ] Retry transfer (should succeed)
- [ ] Execute 7-for-1 stock split
- [ ] Verify balances multiplied by 7
- [ ] Change symbol from "ACME" to "ACMEX"
- [ ] Verify symbol updated, balances unchanged
- [ ] Export cap-table (CSV and JSON)
- [ ] Query historical cap-table at block before split
- [ ] Verify historical balances correct

---

## Troubleshooting

### MetaMask Not Connecting
- Check you're on Base Sepolia network
- Refresh page and try again
- Check browser console for errors

### Transactions Failing
- Verify wallet has testnet ETH (for gas)
- Check recipient is approved (for transfers)
- Verify contract address is correct: `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964`

### Balances Not Updating
- Wait 10-15 seconds for indexer to process events
- Refresh page
- Check transaction succeeded on Basescan

### Cap Table Empty
- Verify tokens were minted successfully
- Check indexer is running (backend health check)
- Wait a few seconds for indexer to process events

---

## Expected Transaction Flow

```
1. Admin approves wallets → WalletApproved events
2. Admin mints tokens → Transfer event (from 0x0) + TokensMinted event
3. Investor transfers → Transfer event
4. Admin executes split → StockSplit event
5. Admin changes symbol → SymbolChanged event
```

All events should be captured by the indexer and appear in the database within 10-15 seconds.

---

## Testing Tips

1. **MetaMask Account Switching**:
   - **Same Browser**: Switch accounts in MetaMask → Frontend auto-detects change
   - **Different Browsers**: Use Chrome for Admin, Safari/Incognito for investors (cleaner separation)
   - **Always select ONE account** when connecting - MetaMask doesn't support multi-account connections
2. **Keep Basescan Open**: Monitor transactions in real-time
3. **Check Transaction History**: Verify all transactions appear in UI
4. **Test Error Cases**: Try invalid addresses, insufficient balances, etc.
5. **Verify Indexer**: Check that events appear in database after transactions

---

**Ready to test?** Start with Step 1 and work through each scenario systematically!

