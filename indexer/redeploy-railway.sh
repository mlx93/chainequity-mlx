#!/bin/bash

# ChainEquity Indexer - Railway Redeployment Script
# This script helps redeploy the indexer with the correct Railway configuration

set -e  # Exit on error

echo "🚂 ChainEquity Railway Redeployment Helper"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo -e "${RED}❌ Error: Please run this script from the indexer directory${NC}"
    echo "cd /Users/mylessjs/Desktop/ChainEquity/indexer"
    exit 1
fi

echo -e "${YELLOW}⚠️  IMPORTANT NOTES:${NC}"
echo "1. This script assumes you'll create a NEW Railway project"
echo "2. You'll need to manually add PostgreSQL in the Railway dashboard"
echo "3. Have your DATABASE_URL ready from the Railway dashboard"
echo ""

read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Step 1: Build the project
echo "📦 Step 1: Building TypeScript..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 2: Check if already linked
echo "🔗 Step 2: Checking Railway connection..."
if railway status > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  You're currently linked to a Railway project${NC}"
    read -p "Do you want to unlink and start fresh? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway unlink
        echo -e "${GREEN}✅ Unlinked from previous project${NC}"
    fi
else
    echo -e "${GREEN}✅ Not currently linked to any project${NC}"
fi
echo ""

# Step 3: Login
echo "🔐 Step 3: Checking Railway authentication..."
if railway whoami > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Already logged in to Railway${NC}"
else
    echo "Please login to Railway (browser will open)..."
    railway login
fi
echo ""

# Step 4: Initialize project
echo "🚀 Step 4: Creating/Linking Railway Project..."
echo ""
echo -e "${YELLOW}Choose one:${NC}"
echo "1. Create a NEW project (recommended if fixing broken deployment)"
echo "2. Link to EXISTING project (if you know what you're doing)"
echo ""
read -p "Enter choice (1 or 2): " -n 1 -r
echo ""

if [[ $REPLY == "1" ]]; then
    echo "Creating new Railway project..."
    railway init
elif [[ $REPLY == "2" ]]; then
    echo "Linking to existing project..."
    railway link
else
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
fi
echo ""

# Step 5: Instructions for PostgreSQL
echo -e "${YELLOW}📊 Step 5: Add PostgreSQL Database${NC}"
echo "==========================================="
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo ""
echo "1. Open Railway dashboard: https://railway.app/dashboard"
echo "2. Click your project"
echo "3. Click '+ New' → 'Database' → 'Add PostgreSQL'"
echo "4. Wait for PostgreSQL to show 'Running' status"
echo "5. Click PostgreSQL service → 'Connect' tab"
echo "6. Copy the INTERNAL URL (postgres.railway.internal)"
echo ""
read -p "Press Enter once you've added PostgreSQL and copied the INTERNAL URL..."
echo ""

# Step 6: Set environment variables
echo "🔧 Step 6: Setting Environment Variables..."
echo ""
read -p "Paste the INTERNAL DATABASE_URL: " DATABASE_URL
echo ""

echo "Setting environment variables..."
railway variables --set "DATABASE_URL=$DATABASE_URL" \
  --set "BASE_SEPOLIA_RPC=https://sepolia.base.org" \
  --set "CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964" \
  --set "START_BLOCK=33313307" \
  --set "CHAIN_ID=84532" \
  --set "NODE_ENV=production"

echo -e "${GREEN}✅ Environment variables set${NC}"
echo ""

# Step 7: Deploy
echo "🚀 Step 7: Deploying to Railway..."
railway up

echo ""
echo -e "${GREEN}✅ Deployment initiated!${NC}"
echo ""
echo "Waiting 30 seconds for deployment to complete..."
sleep 30
echo ""

# Step 8: Check logs
echo "📋 Step 8: Checking deployment logs..."
echo ""
railway logs --tail 50

echo ""
echo -e "${YELLOW}=========================================="
echo "🎯 Deployment Steps Complete!"
echo "==========================================${NC}"
echo ""
echo "✅ Code built successfully"
echo "✅ Connected to Railway"
echo "✅ Environment variables set"
echo "✅ Deployed to Railway"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Check the logs above for '✅ Database schema ready'"
echo "2. If you see errors, run: railway logs"
echo "3. Verify tables exist in Railway dashboard → PostgreSQL → Data"
echo "4. Save the PUBLIC database URL for Phase 2A"
echo ""
echo "📚 For more help, see: RAILWAY_FIX_COMPLETE.md"
echo ""

