#!/bin/bash
# Soddo Hospital VPS Deployment Script
# Run this on your VPS after it comes back online

set -e

echo "🏥 Soddo Hospital Deployment Script"
echo "===================================="

# Navigate to project directory
cd /root/sodo-hospital

echo "📥 Pulling latest code from GitHub..."
git pull origin master

echo "🛑 Stopping existing containers..."
docker compose down

echo "🧹 Cleaning up old images..."
docker system prune -f

echo "🏗️ Building new Docker images..."
docker compose build --no-cache

echo "🚀 Starting services..."
docker compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "🔍 Checking container status..."
docker ps

echo "🌐 Testing local connection..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "App not ready yet"

echo "🔄 Restarting nginx..."
systemctl restart nginx

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Check your website at: https://sch-addis.org"
echo ""
echo "If issues persist, check logs with:"
echo "  docker compose logs app"
echo "  docker compose logs db"
