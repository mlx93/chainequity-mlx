#!/bin/bash
# Railway Root Directory Configuration Fix Script
# This script helps configure Railway to use Dockerfile instead of Railpack

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Railway Dockerfile Configuration Fix${NC}"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI not found${NC}"
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
    echo -e "${GREEN}✅ Railway CLI installed${NC}"
fi

# Check if we're in the right directory
if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Error: Dockerfile not found${NC}"
    echo "Please run this script from the indexer/ directory"
    exit 1
fi

echo -e "${GREEN}Step 1: Checking Railway authentication...${NC}"
if railway whoami > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Already logged in${NC}"
else
    echo "Please login to Railway..."
    railway login
fi

echo ""
echo -e "${GREEN}Step 2: Linking Railway service...${NC}"
if railway status > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Service already linked${NC}"
    railway status
else
    echo -e "${YELLOW}⚠️  No service linked. Please link to your Railway service:${NC}"
    railway link
fi

echo ""
echo -e "${GREEN}Step 3: Setting environment variables...${NC}"
echo "Setting RAILWAY_DOCKERFILE_PATH to force Dockerfile usage..."

railway variables set RAILWAY_DOCKERFILE_PATH="Dockerfile" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Could not set via CLI. Please set manually in Railway dashboard:${NC}"
    echo "   Variable: RAILWAY_DOCKERFILE_PATH"
    echo "   Value: Dockerfile"
}

echo ""
echo -e "${YELLOW}⚠️  IMPORTANT MANUAL STEP REQUIRED:${NC}"
echo ""
echo "The root directory MUST be configured in Railway dashboard:"
echo ""
echo "1. Go to Railway dashboard: https://railway.app"
echo "2. Select your Indexer service"
echo "3. Go to Settings → Source (or General)"
echo "4. Find 'Root Directory' field"
echo "5. Set it to: ${GREEN}indexer${NC}"
echo "6. Save changes"
echo ""
echo "If Root Directory option is not visible:"
echo "- Railway may auto-detect based on where Dockerfile is found"
echo "- Try disconnecting and reconnecting GitHub with explicit path"
echo "- Or contact Railway support for root directory configuration"
echo ""

# Verify railway.json exists
if [ -f "railway.json" ]; then
    echo -e "${GREEN}✅ railway.json found${NC}"
    echo "Current configuration:"
    cat railway.json | grep -A 5 "build"
else
    echo -e "${YELLOW}⚠️  railway.json not found${NC}"
fi

echo ""
echo -e "${GREEN}Step 4: Verifying Dockerfile exists...${NC}"
if [ -f "Dockerfile" ]; then
    echo -e "${GREEN}✅ Dockerfile found${NC}"
    echo "Dockerfile path: $(pwd)/Dockerfile"
else
    echo -e "${RED}❌ Dockerfile not found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Step 5: Next Steps...${NC}"
echo ""
echo "After setting root directory in Railway dashboard:"
echo "1. Push a commit to trigger deployment:"
echo "   ${YELLOW}git commit --allow-empty -m 'Trigger Railway deployment'${NC}"
echo "   ${YELLOW}git push origin main${NC}"
echo ""
echo "2. Watch Railway logs:"
echo "   ${YELLOW}railway logs -f${NC}"
echo ""
echo "3. Verify build uses Dockerfile:"
echo "   Look for: 'Building Docker image...' or 'Step 1/X : FROM node:18-alpine'"
echo "   Should NOT see: 'Detected Node.js... Using Railpack...'"
echo ""

echo -e "${GREEN}✅ Configuration check complete!${NC}"
echo ""
echo "Remember: Root directory must be set in Railway dashboard!"
echo "See RAILWAY_DOCKERFILE_FIX.md for detailed troubleshooting."




