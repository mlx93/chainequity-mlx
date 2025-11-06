#!/bin/bash
# Backend Railway Deployment Script
# Run this after manually linking: railway link

set -e

echo "🚀 ChainEquity Backend - Railway Deployment"
echo ""

# Check if Railway is linked
if [ ! -f ".railway" ]; then
    echo "❌ Railway project not linked"
    echo "📝 First run: railway link"
    echo "   Select workspace: mlx93's Projects"
    echo "   Select project: superb-trust"
    echo "   Create new service or select existing backend service"
    echo ""
    exit 1
fi

echo "✅ Railway project linked"
echo ""

echo "📦 Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set BASE_SEPOLIA_RPC=https://sepolia.base.org
railway variables set CONTRACT_ADDRESS=0xFCc9E74019a2be5808d63A941a84dEbE0fC39964
railway variables set CHAIN_ID=84532
railway variables set ADMIN_PRIVATE_KEY=0x948123033193e7bdf6bc2a2dc4cfc911a99977beebacaed5e545cac418eb5fbe
railway variables set ADMIN_ADDRESS=0x4f10f93e2b0f5faf6b6e5a03e8e48f96921d24c6
railway variables set SAFE_ADDRESS=0x6264F29968e8fd2810cB79fb806aC65dAf9db73d
railway variables set DATABASE_URL=postgresql://postgres:opjpippLFhoVcIuuMllwtrKcSGTBJgar@yamanote.proxy.rlwy.net:23802/railway

echo ""
echo "✅ Environment variables set"
echo ""

echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment initiated"
echo ""
echo "📋 Next steps:"
echo "1. Check deployment logs: railway logs"
echo "2. Get service URL: railway domain"
echo "3. Test health endpoint: curl https://[service-url]/api/health"
echo ""

