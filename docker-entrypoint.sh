#!/bin/sh
set -e

echo "============================================"
echo "  Vanguard — Starting up..."
echo "============================================"

# --- Wait for PostgreSQL ---
echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -q 2>/dev/null; do
  sleep 2
done
echo "✅ PostgreSQL is ready"

# --- Push database schema (creates tables if they don't exist) ---
echo "📦 Pushing database schema..."
cd /app/packages/db
pnpm run db:push 2>&1 || echo "⚠️  Schema push had warnings (may already exist)"
cd /app

# --- Wait for InfluxDB ---
echo "⏳ Waiting for InfluxDB..."
until wget --quiet --tries=1 --spider http://${INFLUX_HOST:-influxdb}:8086/health 2>/dev/null; do
  sleep 2
done
echo "✅ InfluxDB is ready"

# --- Wait for Mosquitto ---
echo "⏳ Waiting for MQTT broker..."
sleep 3
echo "✅ MQTT broker should be ready"

echo "============================================"
echo "  🚀 Starting Vanguard services..."
echo "  📱 Web:  http://localhost:3000"
echo "  🔌 API:  http://localhost:3001"
echo "  📖 Docs: http://localhost:3001/docs"
echo "============================================"

# --- Start API server in background ---
cd /app
pnpm --filter @repo/api dev &

# --- Start Next.js web app in foreground ---
pnpm --filter web start
