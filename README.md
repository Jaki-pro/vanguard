# 🚀 Vanguard — Enterprise IoT Vehicle Telemetry Platform

> **Production-ready, scalable IoT platform for real-time vehicle telemetry monitoring, time-series analytics, and intelligent device management with enterprise-grade authentication and data pipelines.**

[![Node.js](https://img.shields.io/badge/Node.js->=18-brightgreen?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Hono](https://img.shields.io/badge/Hono-4.11-orange?logo=hono)](https://hono.dev)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.45-c5f1f7?logo=drizzle)](https://orm.drizzle.team)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![InfluxDB](https://img.shields.io/badge/InfluxDB-2.x-309cef?logo=influxdb)](https://www.influxdata.com/)
[![MQTT](https://img.shields.io/badge/MQTT-5.x-660066?logo=mqtt)](https://mqtt.org)
[![License](https://img.shields.io/badge/License-ISC-purple)](LICENSE)
[![Turbo](https://img.shields.io/badge/Monorepo-Turbo-%23EF4444?logo=turborepo)](https://turbo.build/)

**[Overview](#overview) • [Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Tech Stack](#tech-stack) • [API Docs](#api-documentation) • [Deployment](#deployment) • [Contributing](#contributing)**

---

## Overview

**Vanguard** is an enterprise-grade IoT platform engineered for high-performance real-time vehicle telemetry processing. Built with modern cloud-native architecture, it delivers a scalable, type-safe, production-ready solution for IoT device management and time-series analytics.

**Key Characteristics:** Fully Type-Safe (end-to-end TypeScript strict mode) • Real-Time Processing (sub-second MQTT latency) • Scalable (millions of data points/hour) • Enterprise Authentication (multi-tenant session management) • OpenAPI-First (auto-generated docs) • Monorepo Design (Turbo-orchestrated) • Production-Ready (Docker, error handling, monitoring)

**Use Cases:** ✅ Fleet Management · ✅ IoT Device Monitoring · ✅ Predictive Maintenance · ✅ Real-Time Dashboards · ✅ Multi-Tenant SaaS · ✅ Edge Computing Integration

---

## Features

### Real-Time MQTT Data Ingestion
- Pattern-matched subscriptions: `devices/+/telemetry`; QoS levels 0–2 with automatic reconnection
- Intelligent message buffering with configurable flush intervals and batch sizing

```typescript
client.subscribe('devices/+/telemetry', { qos: 1 });
const flushInterval = 60000;  // 60 seconds
const maxBatchSize  = 5000;
```

### Time-Series Data Persistence
- InfluxDB with millisecond precision, automatic aggregation, configurable retention policies, Flux query language
- **Data flow:** `MQTT → Buffer → Batch Write → InfluxDB → Query API → Dashboard`

### Virtual Device Simulation
- 5 concurrent simulated devices with realistic GPS (Dhaka, Bangladesh), battery, temperature, and signal variations
- Eliminates hardware dependency during development; ideal for load testing and API validation

### Enterprise Authentication & Authorization
- Session management, bcrypt-hashed passwords, session token rotation, HTTPS/CORS protection
- RBAC-ready (Admin, User, Viewer), full audit trail via createdAt/updatedAt timestamps

### Device Management System
- Hierarchical user → device ownership, metadata (name, type), status tracking, constraint enforcement
- One-to-many device-to-user with unique constraint via `userDevices` junction table

### RESTful API with OpenAPI 3.1
- Zod schema validation on all requests/responses, auto-generated Swagger UI + Scalar docs
- Rate limiting: 1000 req/hour, 50 req/minute burst; standardized error codes

### Modern Web Dashboard
- Next.js 16 server components, Tailwind CSS, Framer Motion animations
- OpenStreetMap visualization (Web Mercator), real-time device pins, protected routes via middleware

---

## System Requirements

```
Node.js       18+ (v20 recommended)     PostgreSQL    12+ (15 recommended)
pnpm          9+                         InfluxDB      2.x
RAM           4GB min, 8GB recommended   MQTT Broker   Mosquitto 2.x or compatible
Storage       50GB free                  Docker        20.10+ (optional)
```

---

## Quick Start

### Step 1 — Install Prerequisites

**macOS:**
```bash
brew install node@20 postgresql influxdb mosquitto
brew services start postgresql influxdb mosquitto
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql influxdb2 mosquitto mosquitto-clients
sudo systemctl start postgresql influxdb2 mosquitto
```

**Windows (Chocolatey):**
```powershell
choco install nodejs-lts postgresql influxdb mosquitto -y
psql -U postgres -c "CREATE DATABASE vanguard_db;"
```

### Step 2 — Clone & Install

```bash
git clone https://github.com/yourusername/vanguard.git
cd vanguard
npm install -g pnpm@9.0.0
pnpm install
```

### Step 3 — Configure Environment

**`packages/db/.env`:**
```env
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/vanguard_db
BETTER_AUTH_SECRET=your-secret-key-change-this-min-32-chars-long!
BETTER_AUTH_URL=http://localhost:3000
```

**`apps/api/.env`:**
```env
BROKER_URL=mqtt://localhost:1883
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=your-influx-token
INFLUX_ORG=MyOrg
INFLUX_BUCKET=vanguard_db
```

### Step 4 — Initialize Databases

```bash
# PostgreSQL
createdb vanguard_db
psql vanguard_db -c "CREATE USER vanguard WITH PASSWORD 'password';"
psql vanguard_db -c "GRANT ALL PRIVILEGES ON DATABASE vanguard_db TO vanguard;"
cd packages/db && pnpm run db:push
psql vanguard_db -c "\dt"  # Should show: users, devices, userDevices, session, account

# InfluxDB (open http://localhost:8086 or via CLI)
influx setup \
  --bucket vanguard_db --org MyOrg \
  --username admin --password AdminPassword123 \
  --token MySecureToken123456789 --force
echo "INFLUX_TOKEN=MySecureToken123456789" >> apps/api/.env
```

### Step 5 — Start & Verify

```bash
pnpm dev
# ✓ @repo/api  →  http://localhost:3001
# ✓ web        →  http://localhost:3000
# ✓ MQTT broker connected
# ✓ Virtual devices publishing telemetry

curl http://localhost:3001/telemetry/1       # Test telemetry
curl http://localhost:3001/openapi.json      # Verify API spec
open http://localhost:3001/docs             # API docs
open http://localhost:3000                  # Web dashboard
```

### Troubleshooting Initial Setup

```bash
# Port conflicts
lsof -i :3000 && lsof -i :3001 && lsof -i :5432 && lsof -i :8086 && lsof -i :1883
kill -9 <PID>

# Test MQTT
mosquitto_pub -h localhost -t test/topic -m "test"
mosquitto_sub -h localhost -t test/topic

# Test InfluxDB auth
influx auth list
influx auth create --org MyOrg

# Test PostgreSQL
psql -U postgres -h localhost   # then: \du  \l
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  VANGUARD PLATFORM                      │
└─────────────────────────────────────────────────────────┘

   IoT Devices (GPS / Speed / Battery / Temperature)
        │  MQTT (QoS 1) — Topic: devices/+/telemetry
        ▼
   MQTT Broker (Mosquitto / AWS IoT Core)
        │
   ┌────┴──────────────────────────────────────┐
   │                                           │
   ▼                                           ▼
API Server (Hono :3001)              Web App (Next.js :3000)
  ✓ Zod Validation                    ✓ React 19 Components
  ✓ CORS / OpenAPI                    ✓ TailwindCSS + Framer Motion
  ✓ MQTT Client                       ✓ Protected Routes + Map
   │                                       │
   │  Message Buffer (60s / 5000 pts)      │
   ▼                                       │
Database Layer ◄───────────────────────────┘
  ├── PostgreSQL  (users, devices, sessions, accounts)
  └── InfluxDB    (device_telemetry — time-series)
```

**Data Flow:**
```
Device → MQTT Publish → Hono (validate + buffer) → 60s batch flush
       ├─→ PostgreSQL (metadata: users, devices)
       └─→ InfluxDB   (telemetry time-series)
       → GET /telemetry/:id → Web Dashboard
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.0 | React meta-framework, server components |
| React | 19.2.0 | UI library, concurrent rendering |
| TypeScript | 5.9.2 | Strict static typing |
| Tailwind CSS | 4.1.18 | Utility-first styling |
| Framer Motion | 12.34.0 | Animations & spring physics |
| Lucide React | 0.564.0 | Icon library (464+ icons) |
| Better-Auth | 1.4.18 | Multi-tenant authentication |
| MQTT.js | 5.14.1 | Browser MQTT client |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Hono | 4.11.5 | Web framework — type-safe, 500KB bundle |
| TypeScript | 5.9.3 | Strict mode reliability |
| Zod | 4.3.6 | Runtime validation, great error messages |
| @hono/zod-openapi | 1.2.1 | Auto-generated type-safe OpenAPI docs |
| @hono/node-server | 1.19.9 | Production Node.js HTTP server |
| MQTT.js | 5.14.1 | Async broker client, QoS support |
| @influxdata/influxdb-client | 1.35.0 | Flux queries, batch write API |
| Drizzle ORM | 0.45.1 | Type-safe queries, migrations |
| pg | 8.18.0 | PostgreSQL native driver + connection pooling |

### Infrastructure

| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | 15+ | Relational data, ACID transactions, pooling (20 max) |
| InfluxDB | 2.x | High-cardinality time-series, millisecond precision |
| Mosquitto | 2.x | MQTT broker, pattern matching, QoS, TLS |
| pnpm | 9+ | Package manager |
| Turbo | 2.7.5 | Monorepo build orchestration + caching |
| tsx | 4.21.0 | TypeScript executor |

---

## Project Structure

```
vanguard/
├── apps/
│   ├── api/                          # Hono API Server (port 3001)
│   │   └── src/
│   │       ├── index.ts              # App init, middleware (CORS, logging), MQTT + virtual device start
│   │       ├── mqtt/
│   │       │   └── mqtt-client.ts    # Subscribe devices/+/telemetry, buffer msgs, batch write InfluxDB
│   │       ├── virtual-simulations/
│   │       │   └── telemetry.ts      # 5 mock devices, realistic GPS/sensor, dynamic battery/speed
│   │       └── features/
│   │           ├── telemetry/
│   │           │   ├── telemetry.route.ts    # GET /telemetry/:id · POST /batch · GET /history/:id
│   │           │   ├── telemetry.handler.ts  # Query InfluxDB, format responses, error handling
│   │           │   └── telemetry.schema.ts   # Zod request/response/error schemas
│   │           └── device/
│   │               ├── device.route.ts       # GET · POST · PATCH · DELETE /devices
│   │               ├── device.handler.ts     # CRUD + user relationship + constraint validation
│   │               └── device.schema.ts      # Zod device schemas
│   │
│   └── web/                          # Next.js Frontend (port 3000)
│       ├── app/
│       │   ├── layout.tsx            # Root layout, Geist fonts, metadata
│       │   ├── page.tsx              # Landing page
│       │   ├── dashboard/page.tsx    # Device sidebar + charts + map + detail panel
│       │   ├── login/page.tsx
│       │   ├── signup/page.tsx
│       │   └── api/auth/[...all]/route.ts   # Better-Auth sign-up/sign-in/session
│       ├── components/
│       │   ├── DetailView.tsx        # Real-time battery/speed/temperature charts
│       │   ├── CustomOSMap.tsx       # Web Mercator OSM map, device pins, pan/zoom
│       │   ├── AddDeviceModal.tsx    # Add device form with validation
│       │   └── DeviceSettingsModal.tsx  # Update name/type, delete device
│       ├── hooks/
│       │   ├── use-auth.ts           # useAuth() — session/user/loading/error
│       │   └── useDeviceTelemetry.ts # MQTT subscription, message parsing, state
│       ├── lib/
│       │   ├── auth-client.ts        # Better-Auth client, sign-in/sign-up functions
│       │   └── client.ts             # Typed Hono API client, request/response handling
│       └── middleware.ts             # Auth verification, protected route guards
│
└── packages/
    ├── db/
    │   └── src/
    │       ├── schema.ts             # Drizzle table definitions + relationships + type inference
    │       ├── db.ts                 # PostgreSQL connection + pool (20 max connections)
    │       ├── auth.ts               # Better-Auth config, session/account mapping, type exports
    │       └── index.ts              # Loads dotenv FIRST, re-exports auth/db/schema
    ├── ui/                           # Shared button, card, code components (WCAG 2.1 AA)
    ├── eslint-config/                # Base, Next.js, React-internal ESLint rules
    └── typescript-config/            # base.json, nextjs.json, react-library.json
```

---

## API Documentation

- **Swagger UI:** `http://localhost:3001/docs`
- **Scalar Docs:** `http://localhost:3001/scalar`
- **OpenAPI JSON:** `http://localhost:3001/openapi.json`

Authentication: `Cookie: better-auth.session_token=<token>` (endpoints marked 🔐)

### `GET /telemetry/{device_id}`

```bash
curl "http://localhost:3001/telemetry/device-001?limit=10"
```

```json
{
  "success": true, "device_id": "device-001", "count": 10,
  "data": [{
    "device_id": "device-001", "timestamp": "2024-02-21T15:30:45.123Z",
    "latitude": 23.8103, "longitude": 90.4125, "altitude": 12.5,
    "speed": 45.67, "heading": 180, "accuracy": 4.2, "satellites": 12,
    "battery_level": 85, "charging": true,
    "signal_strength": -65, "temperature": 32.5, "status": "active"
  }]
}
```

### `POST /devices/assign` 🔐

```json
// Request
{ "deviceId": 1, "userId": "user-123-456", "type": "vehicle" }
// Response
{ "success": true, "message": "Device assigned successfully",
  "userDevice": { "id": 5, "deviceId": 1, "userId": "user-123-456", "type": "vehicle" } }
```

### Telemetry Field Reference

| Field | Type | Range / Unit |
|---|---|---|
| latitude / longitude | float | ±90° / ±180° |
| altitude | float | meters |
| speed | float | km/h |
| heading | int | 0–360° |
| accuracy | float | meters (GPS error) |
| satellites | int | count |
| battery_level | int | 0–100% |
| charging | bool | — |
| signal_strength | int | dBm (negative) |
| temperature | float | °C |
| status | string | active / offline / low_battery / maintenance |

### Error Format & Status Codes

```json
{ "success": false, "code": "ERROR_CODE", "message": "Human readable",
  "details": { "field": "field_name", "issue": "Specific error" } }
```

| Code | Meaning | Code | Meaning |
|---|---|---|---|
| 200/201 | OK / Created | 404 | Not Found |
| 400 | Bad Request | 409 | Conflict |
| 401 | Unauthorized | 429 | Rate Limit Exceeded |
| 403 | Forbidden | 500/503 | Server Error / Unavailable |

---

## Database Schema

### PostgreSQL (via Drizzle ORM)

```sql
-- Users
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE, emailVerified BOOLEAN DEFAULT false,
  image VARCHAR(500), createdAt TIMESTAMP DEFAULT NOW(), updatedAt TIMESTAMP DEFAULT NOW()
);

-- Devices
CREATE TABLE devices (
  id SERIAL PRIMARY KEY, deviceName VARCHAR(255) NOT NULL
);

-- Many-to-many junction
CREATE TABLE userDevices (
  id SERIAL PRIMARY KEY,
  deviceId INTEGER NOT NULL REFERENCES devices(id),
  userId VARCHAR(255) NOT NULL REFERENCES users(id),
  UNIQUE(userId, deviceId)
);

-- Sessions
CREATE TABLE session (
  id VARCHAR(255) PRIMARY KEY, expiresAt TIMESTAMP NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE, ipAddress VARCHAR(45), userAgent VARCHAR(500),
  userId VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  createdAt TIMESTAMP DEFAULT NOW(), updatedAt TIMESTAMP DEFAULT NOW()
);

-- Auth providers
CREATE TABLE account (
  id VARCHAR(255) PRIMARY KEY, accountId VARCHAR(255) NOT NULL,
  providerId VARCHAR(255) NOT NULL,
  userId VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accessToken VARCHAR(1000), refreshToken VARCHAR(1000), password VARCHAR(255),
  accessTokenExpiresAt TIMESTAMP, refreshTokenExpiresAt TIMESTAMP, scope VARCHAR(500),
  createdAt TIMESTAMP DEFAULT NOW(), updatedAt TIMESTAMP DEFAULT NOW()
);
```

### InfluxDB Schema

**Measurement:** `device_telemetry`  
**Tags (indexed):** `device_id`, `status`  
**Fields:** `latitude`, `longitude`, `altitude`, `speed`, `heading`, `accuracy`, `temperature`, `satellites`, `battery_level`, `signal_strength`, `charging`  
**Retention:** Configurable policies with automatic downsampling support

---

## Environment Configuration

### API Server (`apps/api/.env`)

```env
BROKER_URL=mqtt://localhost:1883          # Use mqtts:// in production
INFLUX_URL=http://localhost:8086          # Must include protocol
INFLUX_TOKEN=your-token-with-write-perms  # Generate in InfluxDB UI
INFLUX_ORG=MyOrg
INFLUX_BUCKET=vanguard_db
```

### Database (`packages/db/.env`)

```env
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/vanguard_db
BETTER_AUTH_SECRET=your-super-secret-key-min-32-characters-long
BETTER_AUTH_URL=http://localhost:3000
```

| Variable | Notes |
|---|---|
| `BROKER_URL` | Broker must be running before API starts |
| `INFLUX_TOKEN` | Needs bucket:create + bucket:read permissions |
| `BETTER_AUTH_SECRET` | Min 32 chars — rotate if compromised |
| `DATABASE_URL` | Use cloud DB URL (RDS, Supabase) in production |

---

## Development Workflows

```bash
# Start all services with live reload
pnpm dev

# Single service
pnpm dev --filter=web
pnpm dev --filter=@repo/api

# Database management
cd packages/db
pnpm run db:generate --name add_new_table  # Create migration SQL
pnpm run db:push                           # Apply to DB
pnpm run db:check                          # Migration status
pnpm run db:studio                         # GUI browser
pnpm run db:reset                          # ⚠️ Destructive

# Type checking
pnpm check-types
pnpm check-types --filter=@repo/api

# Lint & format
pnpm lint && pnpm lint --fix
pnpm format
prettier --check "**/*.{ts,tsx,md}"

# Test endpoints
curl http://localhost:3001/devices | jq .
curl -X POST "http://localhost:3001/devices" \
  -H "Content-Type: application/json" -d '{"deviceName":"test"}'
curl -X GET "http://localhost:3001/devices" \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN"

# MQTT debugging
mosquitto_sub -h localhost -t 'devices/#' -v
mosquitto_pub -h localhost -t 'devices/1/telemetry' -m '{"device_id":"1","speed":50}'

# Add packages
pnpm add axios --filter=@repo/api
pnpm add tailwindcss --filter=web --save-dev
pnpm audit && pnpm outdated
```

---

## Deployment

### Pre-Deployment Checklist

```bash
pnpm lint && pnpm check-types && pnpm build   # Code quality
pnpm audit                                    # No critical vulnerabilities
cd packages/db && pnpm run db:push            # All migrations applied
# Verify all production env vars are set
# Backup production database before deploying
```

### Production Environment Variables

**`apps/api/.env.production`:**
```env
NODE_ENV=production
BROKER_URL=mqtts://your-mqtt-host.cloud:8883
BROKER_USERNAME=mqtt_user
BROKER_PASSWORD=secure_password
INFLUX_URL=https://influxdb.cloud.example.com
INFLUX_TOKEN=your-production-token
INFLUX_ORG=YourOrganization
INFLUX_BUCKET=telemetry_prod
LOG_LEVEL=info
```

**`packages/db/.env.production`:**
```env
DATABASE_URL=postgresql://user:password@prod-db.aws.com:5432/vanguard_prod
BETTER_AUTH_SECRET=your-production-secret-key-min-32-chars
BETTER_AUTH_URL=https://vanguard.example.com
SESSION_EXPIRY=7d
```

### Docker Compose

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: vanguard_prod
      POSTGRES_USER: vanguard_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes: [postgres_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vanguard_user"]
      interval: 10s; timeout: 5s; retries: 5

  influxdb:
    image: influxdb:2-alpine
    volumes: [influxdb_data:/var/lib/influxdb2]
    ports: ["8086:8086"]
    healthcheck:
      test: ["CMD", "influx", "health"]
      interval: 10s; timeout: 5s; retries: 5

  mosquitto:
    image: eclipse-mosquitto:2-alpine
    ports: ["1883:1883", "9001:9001"]    # 9001 = WebSocket
    volumes: [./mosquitto.conf:/mosquitto/config/mosquitto.conf]

  app:
    build: .
    depends_on:
      postgres: { condition: service_healthy }
      influxdb: { condition: service_healthy }
      mosquitto: { condition: service_healthy }
    environment:
      DATABASE_URL: postgresql://vanguard_user:${DB_PASSWORD}@postgres:5432/vanguard_prod
      BROKER_URL: mqtt://mosquitto:1883
      INFLUX_URL: http://influxdb:8086
      INFLUX_TOKEN: ${INFLUX_TOKEN}
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: https://${DOMAIN}
    ports: ["3000:3000", "3001:3001"]
    restart: unless-stopped

volumes:
  postgres_data:
  influxdb_data:
```

```bash
docker-compose pull && docker-compose up -d
docker-compose ps && docker-compose logs -f app
docker-compose down
```

### Cloud Deployment

**AWS ECS/Fargate:**
```bash
aws ecr create-repository --repository-name vanguard-app
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
docker build -t vanguard-app . && docker push <ECR_URI>
aws ecs update-service --cluster vanguard --service app --force-new-deployment
```

**Vercel (Frontend only):**
```bash
cd apps/web && vercel --prod
# Set in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://api.vanguard.example.com
# NEXT_PUBLIC_BETTER_AUTH_URL=https://vanguard.example.com
```

### Database Backup & Recovery

```bash
# PostgreSQL
pg_dump vanguard_prod > backup.sql
pg_dump -Fc vanguard_prod > backup.dump        # Binary format
psql -d vanguard_prod -f backup.sql
pg_restore -d vanguard_prod backup.dump

# InfluxDB
influx backup /path/to/backup
influx restore /path/to/backup
```

---

## Monitoring & Debugging

### Health Checks

```bash
curl http://localhost:3001/health       # API
curl http://localhost:8086/health       # InfluxDB
psql vanguard_db -c "SELECT 1;"        # PostgreSQL
mosquitto_pub -h localhost -t test/ping -m "pong"  # MQTT
```

### MQTT Monitoring

```bash
mosquitto_sub -h localhost -t '$SYS/#' -v                  # Broker stats
mosquitto_sub -h localhost -t 'devices/#' -v               # All device messages
mosquitto_sub -h localhost -t '$SYS/broker/clients/connected'  # Client count
```

### PostgreSQL Monitoring

```sql
-- Active connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
-- Slowest queries
SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
-- Cache hit ratio (target > 99%)
SELECT sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS ratio
FROM pg_statio_user_tables;
-- Performance indexes
CREATE INDEX idx_device_name ON devices(deviceName);
CREATE INDEX idx_user_id ON "userDevices"("userId");
```

### InfluxDB Monitoring

```bash
influx health --token $INFLUX_TOKEN
influx bucket list --token $INFLUX_TOKEN
influx query --token $INFLUX_TOKEN --database vanguard_db \
  'from(bucket:"vanguard_db") |> range(start: -1h) |> count()'
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `dotenv variables undefined` | `import 'dotenv/config'` must be the **very first** import in `index.ts` |
| InfluxDB write failures | `influx auth list` → create token with `bucket:create` + `bucket:read` |
| MQTT messages not received | `mosquitto_sub -t 'devices/+/telemetry' -v` to verify topic/broker |
| PostgreSQL connection refused | `pg_isready`, check firewall, verify `DATABASE_URL` credentials |
| Port already in use | `lsof -i :<port>` then `kill -9 <PID>` |
| API returning 401 | Include `Cookie: better-auth.session_token=<token>` in requests |
| InfluxDB bucket not found | Run `influx setup` or create bucket via UI at `http://localhost:8086` |
| Build fails after schema change | `cd packages/db && pnpm run db:push` to apply new migrations |

### Recovery Commands

```bash
cd packages/db && pnpm run db:reset                              # Reset PostgreSQL ⚠️
influx delete --bucket vanguard_db --start 1970-01-01T00:00:00Z --stop now  # Clear InfluxDB
rm -rf apps/api/.turbo apps/api/dist apps/web/.next && pnpm build           # Clear build cache
```

---

## Security Best Practices

```typescript
// ✅ Always validate session before any operation
const session = await getSession(request);
if (!session) return new Response('Unauthorized', { status: 401 });

// ✅ Verify resource ownership before mutations
if (device.userId !== session.user.id)
  return new Response('Forbidden', { status: 403 });

// ✅ CORS allowlist — never use wildcard in production
app.use(cors({ origin: ['https://vanguard.example.com'], credentials: true }));
```

- **Always use TLS in production:** `mqtts://` for MQTT, `https://` for InfluxDB/API
- **Never commit `.env` files** — use secrets managers (AWS Secrets Manager, HashiCorp Vault)
- **Rotate `BETTER_AUTH_SECRET`** if suspected compromise (invalidates all sessions)
- **Audit dependencies:** `pnpm audit && pnpm audit --fix`; use `--frozen-lockfile` in CI
- **Rate limit headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Contributing

1. Fork → `git clone` → `git checkout -b feature/your-feature`
2. Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
3. TypeScript strict mode — no `any`; infer types from Drizzle schemas
4. `pnpm lint && pnpm check-types` must pass
5. Open a pull request with a clear description of changes

```typescript
// ✅ Type inference from schema
export type User   = typeof usersTable.$inferSelect;
export type Device = typeof devicesTable.$inferSelect;

// ✅ Zod for runtime validation
const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
const validated = schema.parse(data);  // Throws ZodError if invalid
```



## License

ISC License — Copyright (c) 2024 Md Jakaria Hossain

> Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

---

---

<div align="center"> 
**⭐ If you find this project useful, consider giving it a star!**

[⬆ Back to top](#-vanguard--enterprise-iot-vehicle-telemetry-platform)

</div>