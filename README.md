# Vanguard — Real-Time IoT Vehicle Telemetry Platform

A full-stack IoT platform for real-time vehicle tracking, telemetry monitoring, and device management. Built with Next.js, Hono API, PostgreSQL, InfluxDB, and MQTT.

---

## What Does This Project Do?

Vanguard tracks vehicles and IoT devices in real time. It collects telemetry data (GPS, speed, battery, temperature) from devices via MQTT, stores it in time-series and relational databases, and displays everything on a live web dashboard with maps and charts.

**You get:**
- A **web dashboard** at `http://localhost:3000` — sign up, add devices, see them on a live map
- An **API server** at `http://localhost:3001` — REST API with auto-generated docs at `/docs`
- **5 simulated devices** generating realistic telemetry data out of the box (no hardware needed)
- **Real-time updates** via MQTT WebSocket — watch devices move on the map

---

## Quick Start (Docker — Recommended)

> **Prerequisites:** [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) must be installed on your machine.

### Step 1: Clone the repository

```bash
git clone https://github.com/yourusername/vanguard.git
cd vanguard
```

### Step 2: Start everything

```bash
docker compose up --build
```

That's it. Wait for the build to complete (first time takes a few minutes), then:

| Service | URL | Description |
|---------|-----|-------------|
| **Web App** | http://localhost:3000 | Dashboard, login, signup |
| **API Server** | http://localhost:3001 | REST API |
| **API Docs** | http://localhost:3001/docs | Interactive Swagger/Scalar UI |
| **InfluxDB UI** | http://localhost:8086 | Time-series database admin |

### Step 3: Use the app

1. Open http://localhost:3000
2. Click **"Get Started"** or go to http://localhost:3000/signup
3. Create an account (any email/password — it's local)
4. Go to the **Dashboard**
5. Add a device using device IDs `1` through `5` (these are the simulated devices)
6. Watch real-time telemetry appear on the map and charts

---

## How It Works

```
IoT Devices (simulated)
    │
    │ MQTT (devices/+/telemetry)
    ▼
┌──────────────────────────────────────────────┐
│           Docker Compose Network             │
│                                              │
│  Mosquitto ──► Hono API ──► InfluxDB         │
│  (MQTT)        (port 3001)   (time-series)   │
│                    │                         │
│                    ├──► PostgreSQL            │
│                    │    (users, devices)      │
│                    │                         │
│               Next.js Web                    │
│               (port 3000)                    │
└──────────────────────────────────────────────┘
```

**Data flow:**
1. Simulated devices publish GPS/speed/battery data to MQTT broker every 5 seconds
2. API server subscribes to MQTT, buffers messages, batch-writes to InfluxDB every 60 seconds
3. Web dashboard connects to MQTT over WebSocket to show live positions
4. Historical data is queried from InfluxDB via the REST API

---

## Project Structure

```
vanguard/
├── apps/
│   ├── api/                    # Hono API server (port 3001)
│   │   └── src/
│   │       ├── index.ts        # App entry — CORS, routes, MQTT, simulations
│   │       ├── mqtt/           # MQTT subscriber → InfluxDB writer
│   │       ├── virtual-simulations/  # 5 simulated IoT devices
│   │       └── features/
│   │           ├── device/     # Device CRUD (PostgreSQL)
│   │           └── telemetry/  # Telemetry queries (InfluxDB)
│   │
│   └── web/                    # Next.js frontend (port 3000)
│       ├── app/                # Pages: landing, login, signup, dashboard
│       ├── components/         # Map, modals, detail view
│       ├── hooks/              # Auth hook, MQTT telemetry hook
│       └── lib/                # API client, auth client
│
├── packages/
│   ├── db/                     # Database schema (Drizzle ORM) + auth (Better Auth)
│   ├── ui/                     # Shared React components
│   ├── eslint-config/          # Shared ESLint config
│   └── typescript-config/      # Shared TypeScript config
│
├── docker-compose.yml          # All services: Postgres, InfluxDB, Mosquitto, App
├── Dockerfile                  # Multi-stage build for the app
├── docker-entrypoint.sh        # Startup script (waits for DBs, pushes schema)
├── mosquitto.conf              # MQTT broker configuration
├── init-db.sql                 # PostgreSQL initialization
└── docs/PLAN.md                # Containerization plan & architecture
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 | Web dashboard with real-time maps |
| **Backend** | Hono, Zod, OpenAPI | Type-safe REST API with auto-generated docs |
| **Auth** | Better Auth | Email/password authentication with sessions |
| **Databases** | PostgreSQL (Drizzle ORM) | Users, devices, sessions |
| **Time-Series** | InfluxDB 2.x | Telemetry data (GPS, speed, battery, etc.) |
| **Messaging** | Mosquitto (MQTT) | Real-time device-to-server communication |
| **Monorepo** | Turborepo + pnpm | Build orchestration and package management |
| **Container** | Docker Compose | One-command deployment of all services |

---

## Docker Services

When you run `docker compose up`, these 4 services start:

| Service | Container Name | Port(s) | Purpose |
|---------|---------------|---------|---------|
| **PostgreSQL** | vanguard_postgres | 5432 | Relational data (users, devices, auth) |
| **InfluxDB** | vanguard_influxdb | 8086 | Time-series telemetry storage |
| **Mosquitto** | vanguard_mosquitto | 1883, 9001 | MQTT broker (TCP + WebSocket) |
| **App** | vanguard_app | 3000, 3001 | Next.js web + Hono API |

---

## Common Commands

### Start
```bash
docker compose up --build       # First time (builds the image)
docker compose up               # Subsequent runs
docker compose up -d            # Run in background (detached)
```

### Stop
```bash
docker compose down             # Stop all services
docker compose down -v          # Stop and delete all data (fresh start)
```

### View Logs
```bash
docker compose logs -f          # All services
docker compose logs -f app      # Just the app
docker compose logs -f postgres # Just the database
```

### Access Database
```bash
docker compose exec postgres psql -U postgres -d vanguard_db
```

### Check Service Status
```bash
docker compose ps
```

---

## Local Development (Without Docker)

If you prefer running services locally:

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL 15+
- InfluxDB 2.x
- Mosquitto MQTT broker

### Setup

```bash
# 1. Install dependencies
npm install -g pnpm@9.0.0
pnpm install

# 2. Set up environment files
cp packages/db/.env.example packages/db/.env
cp apps/api/.env.example apps/api/.env

# Edit the .env files with your local database URLs and tokens

# 3. Create PostgreSQL database
createdb vanguard_db

# 4. Push database schema
cd packages/db && pnpm run db:push && cd ../..

# 5. Set up InfluxDB
# Open http://localhost:8086, create org "vanguard-org", bucket "vanguard_telemetry"
# Copy the API token to apps/api/.env

# 6. Start development servers
pnpm dev
```

This starts:
- Web app at http://localhost:3000
- API server at http://localhost:3001

---

## Environment Variables

All environment variables are pre-configured in `docker-compose.yml` with working defaults. No `.env` file is needed for Docker.

For reference, see `.env.docker.example` for all available variables.

### Key Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:password@postgres:5432/vanguard_db` | PostgreSQL connection |
| `BETTER_AUTH_SECRET` | (preset) | Auth encryption key — **change in production** |
| `BROKER_URL` | `mqtt://mosquitto:1883` | MQTT broker for API server |
| `NEXT_PUBLIC_MQTT_BROKER_URL` | `ws://localhost:9001/mqtt` | MQTT WebSocket for browser |
| `INFLUX_URL` | `http://influxdb:8086` | InfluxDB connection |
| `INFLUX_TOKEN` | (preset) | InfluxDB auth token |
| `INFLUX_ORG` | `vanguard-org` | InfluxDB organization |
| `INFLUX_BUCKET` | `vanguard_telemetry` | InfluxDB bucket name |

---

## API Documentation

The API auto-generates OpenAPI 3.1 documentation. Once running:

- **Interactive Docs:** http://localhost:3001/docs (Scalar UI)
- **OpenAPI JSON:** http://localhost:3001/openapi.json

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/telemetry/{device_id}` | Get last 100 telemetry points for a device |
| `GET` | `/devices` | List all registered devices |
| `GET` | `/devices/{id}` | Get a device by ID |
| `POST` | `/devices` | Create a new device |
| `POST` | `/devices/assign` | Assign a device to a user |
| `POST` | `/devices/unassign` | Unassign a device from a user |
| `GET` | `/devices/user/{user_id}` | Get all devices for a user |

---

## Troubleshooting

### "Port already in use"
Something else is using port 3000, 3001, 5432, 8086, or 1883:
```bash
# Find what's using a port
lsof -i :3000

# Or change ports in docker-compose.yml:
# "3000:3000" → "3002:3000"  (access via localhost:3002 instead)
```

### "Container keeps restarting"
```bash
docker compose logs app    # Check app logs for errors
docker compose down -v     # Reset all data and try again
docker compose up --build  # Rebuild from scratch
```

### "Database tables don't exist"
The entrypoint script automatically pushes the schema. If it fails:
```bash
docker compose exec app sh -c "cd /app/packages/db && pnpm run db:push"
```

### "InfluxDB not receiving data"
Data is written in batches every 60 seconds. Wait at least 1 minute after startup, then check:
```bash
docker compose logs app | grep "InfluxDB"
```

### "MQTT not connecting in browser"
Ensure port `9001` (WebSocket) is accessible. Check browser console for connection errors.

---

## Production Deployment

Before deploying to production, change these values in `docker-compose.yml`:

```yaml
# 1. Database password
POSTGRES_PASSWORD: <strong-random-password>
DATABASE_URL: postgresql://postgres:<strong-random-password>@postgres:5432/vanguard_db

# 2. Auth secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET: <random-32-char-string>

# 3. InfluxDB credentials
DOCKER_INFLUXDB_INIT_PASSWORD: <strong-password>
DOCKER_INFLUXDB_INIT_ADMIN_TOKEN: <random-token>
INFLUX_TOKEN: <same-random-token>

# 4. Update URLs to your domain
BETTER_AUTH_URL: https://yourdomain.com
NEXT_PUBLIC_BETTER_AUTH_URL: https://yourdomain.com
NEXT_PUBLIC_MQTT_BROKER_URL: wss://yourdomain.com/mqtt
```

---

## License

ISC

</div>