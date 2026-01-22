#!/bin/bash

# Start Sodo Hospital Development Environment
# - Starts SSH tunnel to VPS PostgreSQL in background
# - Starts Next.js dev server with correct NODE_ENV

PROJECT_DIR="/Users/mekdesyared/sodo-hospital"
LOCAL_PORT="5433"
DEV_PORT="${1:-3002}"

echo "🏥 Sodo Hospital - Development Environment"
echo "==========================================="

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    # Kill SSH tunnel
    lsof -ti:${LOCAL_PORT} 2>/dev/null | xargs kill -9 2>/dev/null
    # Kill dev server
    lsof -ti:${DEV_PORT} 2>/dev/null | xargs kill -9 2>/dev/null
    echo "✅ Cleanup complete"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
lsof -ti:${LOCAL_PORT} 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:${DEV_PORT} 2>/dev/null | xargs kill -9 2>/dev/null
sleep 1

# Start SSH tunnel in background with auto-reconnect
echo "🔗 Starting SSH tunnel (localhost:${LOCAL_PORT} → VPS PostgreSQL)..."
(
    while true; do
        ssh -N \
            -o ServerAliveInterval=30 \
            -o ServerAliveCountMax=3 \
            -o ExitOnForwardFailure=yes \
            -o TCPKeepAlive=yes \
            -o ConnectTimeout=10 \
            -o BatchMode=yes \
            -L ${LOCAL_PORT}:localhost:5432 \
            root@72.62.170.70 2>/dev/null
        
        # If we get here, tunnel died - wait and retry
        sleep 3
    done
) &
TUNNEL_PID=$!

# Wait for tunnel to establish
sleep 3

# Verify tunnel is working
if lsof -i:${LOCAL_PORT} > /dev/null 2>&1; then
    echo "✅ SSH tunnel established"
else
    echo "❌ Failed to establish SSH tunnel"
    kill $TUNNEL_PID 2>/dev/null
    exit 1
fi

# Test database connection
echo "🔍 Testing database connection..."
cd "$PROJECT_DIR"
if node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:sodo2024secure@localhost:${LOCAL_PORT}/sodo_hospital' });
pool.query('SELECT 1').then(() => { console.log('✅ Database connected'); pool.end(); process.exit(0); }).catch(e => { console.log('❌ Database error:', e.message); pool.end(); process.exit(1); });
" 2>/dev/null; then
    echo ""
else
    echo "⚠️  Database connection test failed, but continuing..."
fi

# Start Next.js dev server
echo ""
echo "🚀 Starting Next.js dev server on port ${DEV_PORT}..."
echo "   URL: http://localhost:${DEV_PORT}"
echo ""
echo "==========================================="
echo "Press Ctrl+C to stop all services"
echo "==========================================="
echo ""

NODE_ENV=development pnpm dev -p ${DEV_PORT}
