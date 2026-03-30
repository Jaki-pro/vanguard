# Docker Quick Start Guide

**TL;DR** — Run this:

```bash
docker compose up --build
```

That's it. Wait for the build, then open http://localhost:3000.

## What You Get

| Service | URL | Description |
|---------|-----|-------------|
| **Web App** | http://localhost:3000 | Dashboard, login, signup |
| **API** | http://localhost:3001 | REST API |
| **API Docs** | http://localhost:3001/docs | Interactive Swagger docs |
| **InfluxDB** | http://localhost:8086 | Time-series DB admin |

## Common Commands

```bash
docker compose up --build    # Start everything (first time)
docker compose up            # Start everything (subsequent)
docker compose up -d         # Run in background
docker compose down          # Stop everything
docker compose down -v       # Stop and delete all data
docker compose logs -f       # View all logs
docker compose logs -f app   # View app logs only
docker compose ps            # Check service status
```

## Full Documentation

See [README.md](README.md) for complete setup guide, architecture, and troubleshooting.
