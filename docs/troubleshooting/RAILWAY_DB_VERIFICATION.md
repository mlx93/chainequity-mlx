# Railway Database Verification & Schema Setup

## Current Status
✅ **Indexer Deployed**: Running on Railway and listening for events
✅ **Database Created**: PostgreSQL service is provisioned
❌ **Schema Not Verified**: Tables may not exist yet

## Problem
The `railway connect postgres` command is failing because:
1. The Railway database UI shows "Attempting to connect..." (still initializing)
2. External connections may take a few minutes to become available after initial provisioning

## Solution: Verify Schema via Railway Web UI

### Option 1: Railway Data Tab (Recommended)
1. Go to your Railway project: https://railway.app/project/[your-project-id]
2. Click on the **Postgres** service (not the indexer)
3. Click the **Data** tab in the top menu
4. You should see a table browser interface
5. Check if these tables exist:
   - `transfers`
   - `balances`
   - `approvals`
   - `corporate_actions`

### Option 2: Run Init Script via Railway CLI
If the tables don't exist, we need to run the init script ON Railway:

```bash
# Switch to the indexer service
cd /Users/mylessjs/Desktop/ChainEquity/indexer
railway link

# You'll be prompted to select:
# - Project: ChainEquity-Indexer
# - Environment: production
# - Service: Select the NODE/APP service (not Postgres)

# Then run the init script
railway run npm run init-db
```

### Option 3: Manual SQL via Railway Dashboard
If Railway CLI isn't cooperating, you can create the tables manually:

1. Go to Railway Postgres service → **Data** tab
2. Click **Query** (SQL editor)
3. Run this SQL:

```sql
-- Create transfers table
CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    transaction_hash TEXT NOT NULL UNIQUE,
    block_number BIGINT NOT NULL,
    block_timestamp TIMESTAMP NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    amount TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transfers_from ON transfers(from_address);
CREATE INDEX idx_transfers_to ON transfers(to_address);
CREATE INDEX idx_transfers_block ON transfers(block_number);

-- Create balances table
CREATE TABLE IF NOT EXISTS balances (
    address TEXT PRIMARY KEY,
    balance TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create approvals table
CREATE TABLE IF NOT EXISTS approvals (
    address TEXT PRIMARY KEY,
    is_approved BOOLEAN NOT NULL,
    approved_at TIMESTAMP,
    revoked_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create corporate_actions table
CREATE TABLE IF NOT EXISTS corporate_actions (
    id SERIAL PRIMARY KEY,
    action_type TEXT NOT NULL,
    transaction_hash TEXT NOT NULL UNIQUE,
    block_number BIGINT NOT NULL,
    block_timestamp TIMESTAMP NOT NULL,
    details JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_corporate_actions_type ON corporate_actions(action_type);
CREATE INDEX idx_corporate_actions_block ON corporate_actions(block_number);
```

## What to Do Now

**Step 1**: Check the Railway UI screenshot you sent - wait 1-2 minutes and refresh. The "Database Connection" status should change from "Attempting..." to "Connected" ✓

**Step 2**: Once connected, navigate to the **Data** tab and verify if tables exist

**Step 3**: If tables don't exist, use Option 3 above to create them manually via the Railway SQL editor

**Step 4**: Once tables exist, verify the indexer is working by checking its logs:
```bash
railway logs --service [indexer-service-name]
```

You should see output like:
```
✅ Historical events processed
✅ Backfill complete
👀 Watching for new events...
```

## Expected Outcome
Once the schema is initialized:
- The indexer will be able to write events to the database
- The Database Connection status in Railway UI will show as connected
- You can proceed to Phase 2A (Backend Specialist) which will use the PUBLIC database URL

## Next Steps After Verification
Once you confirm the tables exist and the indexer is running:
1. Document the final PUBLIC database URL in `wallet-addresses.txt`
2. I'll generate the Phase 2A Backend Specialist prompt
3. The backend will connect to the database using the public URL and query the indexed data

