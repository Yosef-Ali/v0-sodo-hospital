#!/bin/bash

# Database Switch Script for Sodo Hospital
# Usage: ./scripts/switch-db.sh [vps|neon]

PROJECT_DIR="/Users/mekdesyared/sodo-hospital"

show_current() {
    if grep -q "localhost:5433" "$PROJECT_DIR/.env.local" 2>/dev/null; then
        echo "📊 Current: VPS Docker PostgreSQL (via SSH tunnel)"
    elif grep -q "neon.tech" "$PROJECT_DIR/.env.local" 2>/dev/null; then
        echo "📊 Current: Neon Cloud PostgreSQL"
    else
        echo "📊 Current: Unknown database configuration"
    fi
}

case "$1" in
    vps)
        cp "$PROJECT_DIR/.env.local.vps" "$PROJECT_DIR/.env.local"
        echo "✅ Switched to VPS Docker PostgreSQL"
        echo ""
        echo "⚠️  IMPORTANT: Start the SSH tunnel first!"
        echo "   Run: ./scripts/start-db-tunnel.sh"
        echo ""
        echo "   Then in another terminal: pnpm dev"
        ;;
    neon)
        cp "$PROJECT_DIR/.env.local.neon" "$PROJECT_DIR/.env.local"
        echo "✅ Switched to Neon Cloud PostgreSQL"
        echo ""
        echo "   Run: pnpm dev"
        ;;
    *)
        echo "🏥 Sodo Hospital - Database Switcher"
        echo ""
        show_current
        echo ""
        echo "Usage: ./scripts/switch-db.sh [vps|neon]"
        echo ""
        echo "Options:"
        echo "  vps   - Use VPS Docker PostgreSQL (requires SSH tunnel)"
        echo "  neon  - Use Neon Cloud PostgreSQL"
        echo ""
        echo "VPS Database Info:"
        echo "  Host: 72.62.170.70"
        echo "  Database: sodo_hospital"
        echo "  User: postgres"
        ;;
esac
