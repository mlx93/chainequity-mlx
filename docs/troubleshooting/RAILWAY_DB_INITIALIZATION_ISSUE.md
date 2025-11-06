# Railway Database Initialization Problem

## Issue Summary
The ChainEquity Event Indexer database schema initialization is failing in both local and Railway environments, preventing the creation of required tables (`transfers`, `balances`, `approvals`, `corporate_actions`). While the indexer service successfully deploys and runs on Railway, we cannot verify whether the database tables exist, and attempts to initialize the schema through multiple approaches have been unsuccessful.

## Root Cause Analysis

**Local Execution Failure**: When attempting to run `railway run npm run init-db` from the local development machine, the command fails with error `getaddrinfo ENOTFOUND postgres.railway.internal`. This occurs because the `railway run` command executes scripts locally while injecting Railway's environment variables, including `DATABASE_URL=postgresql://postgres:dYjiuLvfSvaOjsNHXhtAbWHtbwWPFpUW@postgres.railway.internal:5432/railway`. The hostname `postgres.railway.internal` is Railway's internal DNS name that only resolves within Railway's private network infrastructure. This hostname is unreachable from external networks, making local execution of database initialization scripts impossible when using Railway's internal connection string. The Railway CLI does not provide a way to execute commands *on* Railway's servers directly (like SSH) - `railway run` only injects environment variables into local execution.

**Railway Deployment Uncertainty**: After modifying the indexer's `src/index.ts` to automatically call `initializeSchema()` on startup (commit 2e5e965) and redeploying via `railway up`, the deployment logs still do not show the expected "✅ Database schema ready" message. The logs continue to display the same output from the previous deployment, suggesting either: (a) the new build hasn't completed yet and the old container is still running, (b) the schema initialization is failing silently without proper error logging, or (c) Railway is caching the deployment and not picking up the new code. Additionally, Railway's database UI shows "Database Connection: We are unable to connect to the database via SSH - bash: line 1: psql: command not found", indicating Railway's web-based database console doesn't have PostgreSQL client tools installed. We have two DATABASE_URL values: an internal one (`postgres.railway.internal:5432`) for services running on Railway, and a public one (`nozomi.proxy.rlwy.net:25369`) for external connections, but we cannot directly test database connectivity or manually create tables from the local CLI using the public URL without additional setup.

## Required Resolution

**What another agent needs to do**: Verify whether the database tables (`transfers`, `balances`, `approvals`, `corporate_actions`) exist in the Railway PostgreSQL database, and if they don't exist, create them. This can be accomplished through: (1) Using Railway's web UI database query editor (if available under the Database tab) to manually execute the SQL schema creation commands, (2) Connecting to the Railway PostgreSQL database using the PUBLIC connection string (`postgresql://postgres:dYjiuLvfSvaOjsNHXhtAbWHtbwWPFpUW@nozomi.proxy.rlwy.net:25369/railway`) via a local PostgreSQL client like `psql` or a GUI tool like TablePlus/pgAdmin, then running the initialization SQL, or (3) Confirming the new indexer deployment has completed and checking the latest logs for "✅ Database schema ready" to verify auto-initialization worked. The SQL schema definition is located in `/Users/mylessjs/Desktop/ChainEquity/indexer/src/db/initSchema.ts` and can also be found in the verification document at `/Users/mylessjs/Desktop/ChainEquity/RAILWAY_DB_VERIFICATION.md` under "Option 3: Manual SQL via Railway Dashboard". Once tables are confirmed to exist, the indexer will be able to store blockchain events and we can proceed to Phase 2A (Backend API development).

## Key Files & Context
- **Indexer Source**: `/Users/mylessjs/Desktop/ChainEquity/indexer/src/index.ts` (modified to auto-init schema on line 24-26)
- **Schema Definition**: `/Users/mylessjs/Desktop/ChainEquity/indexer/src/db/initSchema.ts`
- **Database URLs**: Documented in `/Users/mylessjs/Desktop/ChainEquity/wallet-addresses.txt` and `/Users/mylessjs/Desktop/ChainEquity/RAILWAY_DATABASE_URLS.txt`
- **Railway Project**: ChainEquity-Indexer (production environment)
- **Contract Address**: `0xFCc9E74019a2be5808d63A941a84dEbE0fC39964` (Base Sepolia)
- **Deployment Status**: Indexer is running and listening for events, but database schema status is unverified

