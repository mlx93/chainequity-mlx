#!/bin/bash

# ChainEquity Indexer - Railway Deployment Script
# Run this script to deploy the indexer to Railway

set -e  # Exit on error

echo "🚂 ChainEquity Indexer - Railway Deployment"
echo "============================================"
echo ""

# Change to indexer directory
cd "$(dirname "$0")"

echo "📁 Current directory: $(pwd)"
echo ""

# Step 1: Check if Railway CLI is installed
echo "Step 1: Checking Railway CLI..."
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
else
    echo "✅ Railway CLI found"
fi
echo ""

# Step 2: Build the project
echo "Step 2: Building TypeScript..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi
echo ""

# Step 3: Login to Railway
echo "Step 3: Railway Authentication"
echo "This will open your browser to authenticate..."
echo ""
railway login

echo ""
echo "✅ Railway authentication complete"
echo ""

# Step 4: Initialize Railway project
echo "Step 4: Initialize Railway Project"
echo "Choose option:"
echo "  1) Create a new Railway project"
echo "  2) Link to an existing project"
echo ""

railway init

echo ""
echo "✅ Railway project initialized"
echo ""

# Step 5: Instructions for environment variables
echo "Step 5: Set Environment Variables"
echo ""
echo "⚠️  IMPORTANT: You need to set these environment variables in Railway:"
echo ""
echo "1. Go to Railway dashboard: https://railway.app/dashboard"
echo "2. Click on your project"
echo "3. Add a PostgreSQL database:"
echo "   - Click 'New' → 'Database' → 'Add PostgreSQL'"
echo "   - Wait for it to provision"
echo "4. Go back to your service and click 'Variables'"
echo "5. Add these variables:"
echo ""
echo "   DATABASE_URL=<get from PostgreSQL service - use INTERNAL url>"
echo "   BASE_SEPOLIA_RPC=https://sepolia.base.org"
echo "   CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964"
echo "   START_BLOCK=33313307"
echo "   CHAIN_ID=84532"
echo "   NODE_ENV=production"
echo ""
echo "Press Enter when you've added all variables..."
read

echo ""
echo "Step 6: Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment initiated"
echo ""

# Step 7: Initialize database
echo "Step 7: Initialize Database Schema"
echo "Waiting 10 seconds for deployment to complete..."
sleep 10
echo ""
railway run npm run init-db

echo ""
echo "✅ Database schema initialized"
echo ""

# Step 8: Check logs
echo "Step 8: Checking Deployment Status"
echo ""
echo "Fetching logs..."
railway logs --tail 50

echo ""
echo "============================================"
echo "🎉 Deployment Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Check logs: railway logs"
echo "2. Open dashboard: railway open"
echo "3. Verify database: railway connect postgres"
echo ""
echo "The indexer should now be processing blockchain events!"
echo ""




