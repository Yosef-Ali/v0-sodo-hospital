#!/bin/bash

# Robust SSH Tunnel to VPS Docker PostgreSQL
# Auto-reconnects if connection drops

VPS_IP="72.62.170.70"
VPS_USER="root"
LOCAL_PORT="5433"
REMOTE_PORT="5432"

echo "🔗 Starting persistent SSH tunnel to VPS PostgreSQL..."
echo "   Local: localhost:${LOCAL_PORT} → Remote: ${VPS_IP}:${REMOTE_PORT}"
echo "   Press Ctrl+C to stop"
echo ""

# Kill any existing tunnel on this port
lsof -ti:${LOCAL_PORT} 2>/dev/null | xargs kill -9 2>/dev/null

# Function to start tunnel
start_tunnel() {
    ssh -N \
        -o ServerAliveInterval=30 \
        -o ServerAliveCountMax=3 \
        -o ExitOnForwardFailure=yes \
        -o TCPKeepAlive=yes \
        -o ConnectTimeout=10 \
        -L ${LOCAL_PORT}:localhost:${REMOTE_PORT} \
        -L 9000:localhost:9000 \
        -L 9001:localhost:9001 \
        ${VPS_USER}@${VPS_IP}
}

# Auto-restart loop
while true; do
    echo "$(date '+%H:%M:%S') - Connecting to VPS..."
    start_tunnel
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo "$(date '+%H:%M:%S') - Tunnel closed normally"
    else
        echo "$(date '+%H:%M:%S') - Tunnel disconnected (exit code: $EXIT_CODE)"
    fi
    
    echo "$(date '+%H:%M:%S') - Reconnecting in 3 seconds..."
    sleep 3
done
