# Vanguard — Docker Containerization Plan

## Current State Analysis

After analyzing all 49 project files, here are the issues preventing a clean `docker-compose up` experience:

### Critical Issues

| # | Issue | File | Impact |
|---|-------|------|--------|
| 1 | **Hardcoded DB URL** | `packages/db/src/db.ts` | Database connects to `localhost` instead of Docker's `postgres` service. Fatal in Docker. |
| 2 | **Wrong InfluxDB env vars** | `docker-compose.yml` | Uses `INFLUXDB_*` but InfluxDB 2.x requires `DOCKER_INFLUXDB_INIT_*`. Bucket/org/token never created. |
| 3 | **No DB schema migration** | — | PostgreSQL starts empty. App crashes because tables (users, devices, session, account) don't exist. |
| 4 | **Dev mode in Dockerfile** | `Dockerfile` | Runs `pnpm dev` (watch mode) inside a build-then-run container. Wasteful and fragile. |
| 5 | **Volume mounts override builds** | `docker-compose.yml` | `./apps:/app/apps` shadows the built artifacts inside the container. |
| 6 | **No .dockerignore** | — | `node_modules` + `.git` get copied into Docker context (slow builds, huge images). |
| 7 | **Hardcoded API URL in frontend** | `apps/web/lib/client.ts` | `http://localhost:3001/` works locally but breaks inside container-to-container networking. |
| 8 | **Hardcoded date in Flux query** | `apps/api/src/features/telemetry/telemetry.handler.ts` | `range(start: 2026-02-07T00:00:00Z)` — breaks for other time periods. |

### Minor Issues

| # | Issue | File |
|---|-------|------|
| 9 | No `.env.example` files | — |
| 10 | `microsoft.gpg` file in root (unnecessary) | root |
| 11 | `DOCKER_QUICK_START.md` references `DOCKER.md` which doesn't exist | root |

---

## Implementation Plan

### Phase 1: Fix Source Code Issues

1. **Fix `packages/db/src/db.ts`** — Use `process.env.DATABASE_URL` instead of hardcoded string
2. **Fix `apps/web/lib/client.ts`** — Use environment variable for API URL
3. **Fix `telemetry.handler.ts`** — Make Flux query date range dynamic (last 24 hours)

### Phase 2: Docker Infrastructure

4. **Create `.dockerignore`** — Exclude node_modules, .git, .env, etc.
5. **Rewrite `Dockerfile`** — Multi-stage build: install → build → production runtime
6. **Rewrite `docker-compose.yml`** — Fix InfluxDB env vars, remove dev volume mounts, add proper depends_on
7. **Create `docker-entrypoint.sh`** — Startup script that waits for services and pushes DB schema

### Phase 3: Developer Experience

8. **Create `.env.example`** — Root-level template for all required environment variables
9. **Write `README.md`** — Complete from-scratch guide for technical and non-technical users
10. **Clean up** — Remove redundant `DOCKER_QUICK_START.md`, `microsoft.gpg`

---

## Architecture After Fix

```
User clones repo
    ↓
cp .env.example .env  (optional — defaults work out of box)
    ↓
docker compose up
    ↓
┌─────────────────────────────────────────────────────┐
│  Docker Compose Network                             │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐    │
│  │ Postgres │  │ InfluxDB │  │   Mosquitto    │    │
│  │  :5432   │  │  :8086   │  │  :1883/:9001   │    │
│  └────┬─────┘  └────┬─────┘  └───────┬────────┘    │
│       │              │                │             │
│  ┌────┴──────────────┴────────────────┴──────┐      │
│  │              App Container                │      │
│  │  ┌─────────────┐   ┌──────────────────┐   │      │
│  │  │  Next.js    │   │   Hono API       │   │      │
│  │  │  :3000      │   │   :3001          │   │      │
│  │  └─────────────┘   └──────────────────┘   │      │
│  └───────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
    ↓
localhost:3000  →  Web Dashboard
localhost:3001  →  API + Swagger Docs
```

## Expected Result

After implementation, any user should be able to:

```bash
git clone <repo-url>
cd vanguard
docker compose up
# Open http://localhost:3000 — Working app with simulated devices
```
