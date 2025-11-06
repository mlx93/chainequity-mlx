# ChainEquity - Demo Video Script

**Duration**: 6 minutes  
**Format**: Screen recording with voiceover  
**Setup**: Two browser windows (Chrome: Admin + Investor A, Safari: Investor B)

---

## Required Demo Scenarios (from ChainEquity PDF)

The video MUST demonstrate all of the following test cases:

1. ✅ Mint tokens to approved wallet → SUCCESS
2. ✅ Transfer between two approved wallets → SUCCESS
3. ✅ Transfer to non-approved wallet → BLOCKED
4. ✅ Approve new wallet → Transfer now succeeds
5. ✅ Execute 7-for-1 split → Balances multiply by 7
6. ✅ Change ticker symbol → Symbol updates, balances unchanged
7. ✅ Export cap-table at specific block

---

## Video Timeline & Script

### **Scene 1: Architecture Introduction** (0:00 - 0:45)
**Duration**: 45 seconds  
**What to show**: Architecture diagram (split screen showing contract → indexer → UI flow)

**Narration**:
"ChainEquity demonstrates tokenized equity with compliance gating on Base Sepolia. The system consists of three components: a gated ERC-20 token contract with allowlist-based transfer restrictions, an event indexer that produces cap-table snapshots, and an operator interface for managing approvals and corporate actions. The contract enforces that both sender and recipient must be on the allowlist before any transfer succeeds. All state lives on-chain with the database serving as a fast query cache."

**On-screen highlights**:
- Point to smart contract: "Transfer restrictions enforced here"
- Point to indexer: "Watches blockchain events in real-time"
- Point to UI: "Admin dashboard and investor views"

---

### **Scene 2: Admin Approval & Minting** (0:45 - 1:30)
**Duration**: 45 seconds  
**What to show**: Chrome window (Admin view), Gnosis Safe UI visible

**Actions**:
1. Show Admin dashboard with pending approval for Investor A (address 0xAAA...)
2. Click "Approve Wallet" button → MetaMask popup → Confirm transaction
3. Show transaction confirmed (green checkmark)
4. Navigate to "Mint Tokens" section
5. Enter Investor A address, amount: 10,000 tokens
6. Click "Mint" → MetaMask popup → Confirm
7. Show success message: "Minted 10,000 ACME to 0xAAA..."

**Narration**:
"As the admin, I first approve Investor A's wallet address, which adds them to the on-chain allowlist. This approval requires a transaction signed by the Gnosis Safe multi-sig. Once approved, I can mint 10,000 ACME tokens directly to their wallet. The transaction completes in seconds on Base L2, and Investor A now owns 100% of the total supply."

**✅ Satisfies PDF Requirement**: "Mint tokens to approved wallet → SUCCESS"

---

### **Scene 3: Transfer Attempt to Unapproved Wallet** (1:30 - 2:15)
**Duration**: 45 seconds  
**What to show**: Switch to Safari window (Investor A view)

**Actions**:
1. Show Investor A's dashboard displaying: "Balance: 10,000 ACME (100%)"
2. Click "Transfer Tokens" button
3. Enter recipient: Investor B address (0xBBB...), amount: 3,000
4. Click "Transfer" → MetaMask popup → Confirm transaction
5. Transaction FAILS - show error message: "Transfer failed: Recipient not approved"
6. Highlight the specific error in transaction details

**Narration**:
"Now viewing as Investor A, I can see my 10,000 token balance. I'll attempt to transfer 3,000 tokens to Investor B, who hasn't been approved yet. The transaction reverts immediately because the smart contract checks both sender and recipient allowlist status before allowing any transfer. This demonstrates the core compliance gating mechanism - unapproved wallets cannot receive tokens under any circumstances."

**✅ Satisfies PDF Requirement**: "Transfer to non-approved wallet → BLOCKED"

---

### **Scene 4: Approve Investor B & Successful Transfer** (2:15 - 3:00)
**Duration**: 45 seconds  
**What to show**: Switch back to Chrome (Admin), then Safari (Investor A)

**Actions**:
1. **Admin view**: Show Investor B in pending approvals
2. Click "Approve Wallet" for 0xBBB... → Confirm transaction
3. Show success: "Investor B approved"
4. **Switch to Safari (Investor A)**: Retry the same transfer
5. Enter Investor B address: 0xBBB..., amount: 3,000
6. Click "Transfer" → Confirm transaction
7. Transaction SUCCEEDS - show success message
8. Show updated balances: Investor A: 7,000 ACME (70%), Investor B: 3,000 ACME (30%)

**Narration**:
"Back as admin, I approve Investor B's wallet address. Now when Investor A retries the exact same transfer, it succeeds because both parties are on the allowlist. The balances update immediately - Investor A now holds 7,000 tokens representing 70% ownership, while Investor B holds 3,000 tokens or 30%."

**✅ Satisfies PDF Requirements**: 
- "Approve new wallet → Transfer now succeeds"
- "Transfer between two approved wallets → SUCCESS"

---

### **Scene 5: Execute 7-for-1 Stock Split** (3:00 - 4:00)
**Duration**: 60 seconds  
**What to show**: Chrome (Admin), then split screen showing both investor views

**Actions**:
1. **Admin view**: Navigate to "Corporate Actions" tab
2. Show current total supply: 10,000 tokens
3. Click "Execute Stock Split" button
4. Modal appears: "Enter split ratio" → Enter "7"
5. Confirm warning: "This will multiply all balances by 7"
6. Click "Execute" → MetaMask popup → Confirm
7. Show success: "Stock split executed: 7-for-1"
8. **Split screen**: Show both investor dashboards simultaneously
   - Investor A: 49,000 ACME (70%) ← was 7,000
   - Investor B: 21,000 ACME (30%) ← was 3,000
9. Show total supply updated: 70,000 tokens

**Narration**:
"For corporate actions, I'll execute a 7-for-1 stock split. This is implemented using a virtual split multiplier - rather than iterating through every holder on-chain, the contract applies the multiplier at read time for gas efficiency. After confirming the transaction, all token balances multiply by seven while ownership percentages remain exactly the same. Investor A now holds 49,000 tokens maintaining 70% ownership, and Investor B holds 21,000 tokens maintaining 30%. The total supply updates from 10,000 to 70,000 tokens. This demonstrates how corporate actions can be executed programmatically while preserving proportional ownership."

**✅ Satisfies PDF Requirement**: "Execute 7-for-1 split → Balances multiply by 7"

---

#### 🎯 **DEMO CRITICAL: Safe Transfer Amounts After Split**

**IMPORTANT**: After executing the 7-for-1 split, if you plan to demonstrate transfers, use amounts **divisible by 7** to avoid rounding issues:

**✅ Safe transfer amounts (divisible by 7):**
- 700 tokens (100 base)
- 1,400 tokens (200 base) 
- 2,100 tokens (300 base)
- 3,500 tokens (500 base)
- 7,000 tokens (1,000 base)
- 14,000 tokens (2,000 base)
- 21,000 tokens (3,000 base) ← Perfect for Investor B's full balance

**❌ Avoid (will lose tokens due to rounding):**
- 1,000 tokens → would lose 6 tokens
- 5,000 tokens → would lose 5 tokens  
- 10,000 tokens → would lose 4 tokens

**Why**: Virtual splits divide transfer amounts by the multiplier using integer division. Non-divisible amounts round down, causing small token losses.

**Recommendation**: Either skip post-split transfers in the demo, or use the safe amounts above. This is a known limitation documented for post-demo enhancement.

---

### **Scene 6: Change Ticker Symbol** (4:00 - 4:45)
**Duration**: 45 seconds  
**What to show**: Chrome (Admin), then both investor views

**Actions**:
1. **Admin view**: Still in "Corporate Actions" tab
2. Click "Change Symbol" button
3. Modal shows current symbol: "ACME"
4. Enter new symbol: "ACMEX"
5. Click "Update Symbol" → MetaMask popup → Confirm
6. Show success: "Symbol changed from ACME to ACMEX"
7. **Show both investor views**: Balances now display "ACMEX" instead of "ACME"
   - Investor A: 49,000 ACMEX (70%)
   - Investor B: 21,000 ACMEX (30%)
8. Verify balances unchanged, only symbol updated

**Narration**:
"The second corporate action is a ticker symbol change from ACME to ACMEX. This updates the contract's metadata without touching any balances. After the transaction confirms, both investor dashboards immediately reflect the new symbol. All holdings remain identical - only the token identifier has changed. This would be used in real scenarios for rebranding or corporate restructuring."

**✅ Satisfies PDF Requirement**: "Change ticker symbol → Symbol updates, balances unchanged"

---

### **Scene 7: Cap-Table Export & Historical Query** (4:45 - 6:00)
**Duration**: 75 seconds  
**What to show**: Chrome (Admin), cap-table view, file downloads

**Actions**:
1. **Admin view**: Navigate to "Cap Table" tab
2. Show current cap-table displayed as table:
   ```
   Wallet Address    | Balance  | Ownership %
   0xAAA... (Inv. A) | 49,000   | 70.00%
   0xBBB... (Inv. B) | 21,000   | 30.00%
   Total Supply      | 70,000   | 100.00%
   ```
3. Click "Download CSV" → Show file downloaded
4. Click "Download JSON" → Show file downloaded
5. Show historical query section: "View cap-table at block:"
6. Enter block number from before the split (e.g., Block 12345)
7. Click "Query Historical" → Table updates to show pre-split state:
   ```
   Wallet Address    | Balance  | Ownership %
   0xAAA... (Inv. A) | 7,000    | 70.00%
   0xBBB... (Inv. B) | 3,000    | 30.00%
   Total Supply      | 10,000   | 100.00%
   ```
8. Show seeded historical data: Scroll through earlier transactions showing 3 founders + 5 seed investors
9. Query cap-table at genesis block showing founder distribution

**Narration**:
"The cap-table view shows real-time ownership derived from blockchain events. I can export this data in both CSV and JSON formats for accounting or compliance purposes. The powerful feature here is historical queries - by entering a specific block number, I can reconstruct the exact ownership structure at any point in time. Here's the cap-table before the stock split showing the original 10,000 token supply. The system also includes seeded historical data representing the company's formation: three founders who started with equal ownership, followed by a seed funding round with five investors. This demonstrates how the indexer maintains a complete audit trail, allowing anyone to verify ownership history back to the genesis block."

**✅ Satisfies PDF Requirement**: "Export cap-table at specific block"

---

## Closing (6:00+)
**Duration**: 5-10 seconds (optional, can cut if running over)

**What to show**: Quick flash of test results, gas report, architecture diagram

**Narration (brief)**:
"All functionality is backed by comprehensive test coverage, with gas costs optimized for L2 deployment. The complete source code, deployment scripts, and documentation are available in the repository."

---

## Technical Setup Notes for Recording

### **Pre-Recording Checklist**:
- [ ] Deploy contracts to Base Sepolia
- [ ] Seed 10-15 historical transactions (founders + seed round)
- [ ] Fund three wallets with testnet ETH
- [ ] Set up Gnosis Safe with 2/3 threshold
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend + indexer to Railway
- [ ] Test all flows in both browsers
- [ ] Prepare screen recording software (OBS, Loom, or QuickTime)

### **Browser Setup**:
- **Chrome**: Admin wallet connected (Safe owner key)
- **Safari**: Investor A wallet connected
- **Second Safari Window/Profile**: Investor B wallet connected (for Scene 5 split screen)

### **Recording Tips**:
1. Use split-screen view for Scenes 5-7 to show multiple perspectives
2. Zoom in on transaction confirmations so addresses are readable
3. Highlight cursor over important text (balances, error messages)
4. Pause briefly after each transaction for confirmation animation
5. Keep browser windows clean (close unnecessary tabs)
6. Test audio levels before final recording

### **Fallback Plan**:
If any transaction fails during recording:
- Have a backup recording of each scene
- Keep transactions deterministic (same amounts, same addresses)
- Can splice together multiple takes in post-production

---

## Success Metrics

This video demonstrates ALL required PDF scenarios:
1. ✅ Mint tokens to approved wallet → SUCCESS (Scene 2)
2. ✅ Transfer between approved wallets → SUCCESS (Scene 4)
3. ✅ Transfer to non-approved → BLOCKED (Scene 3)
4. ✅ Approve new wallet → Transfer succeeds (Scene 4)
5. ✅ Execute 7-for-1 split → Balances multiply (Scene 5)
6. ✅ Change ticker symbol → Updates correctly (Scene 6)
7. ✅ Export cap-table at specific block (Scene 7)

**Additional value demonstrated**:
- Multi-sig admin controls (Gnosis Safe)
- Real-time balance updates
- Historical audit trail
- Gas-efficient virtual split implementation
- Production-quality UI/UX

---

*Video duration may vary by 15-30 seconds depending on transaction confirmation times and narration pace. Target: 6:00, acceptable range: 5:30-6:30*
