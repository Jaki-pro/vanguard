# Docker Quick Start Guide

**TL;DR** - Run this:

```bash
docker-compose up
```

That's it! Your entire app is running.

## What You Get

When you run `docker-compose up`, it automatically starts:

1. **PostgreSQL** → `localhost:5432` (database)
2. **InfluxDB** → `localhost:8086` (time-series data)
3. **Mosquitto** → `localhost:1883` (MQTT broker)
4. **Your App** → `localhost:3000` (web) + `localhost:3001` (API)

## Files Explained

| File | What It Does |
|------|---|
| `Dockerfile` | How to build your app image |
| `docker-compose.yml` | Starts all 4 services at once |
| `mosquitto.conf` | MQTT broker settings |
| `init-db.sql` | Database setup script |
| `DOCKER.md` | Full documentation |

## Common Tasks

### Start Everything
```bash
docker-compose up
```

### View Logs
```bash
docker-compose logs -f
```

### Stop Everything
```bash
docker-compose down
```

### Access Database
```bash
docker-compose exec postgres psql -U postgres -d vanguard_db
```

### See All Services Status
```bash
docker-compose ps
```

## Before Deploying (Important!)

Edit `docker-compose.yml` and change these hardcoded values:

```yaml
# Database section
POSTGRES_PASSWORD: password  👈 Change this!

# InfluxDB section  
INFLUXDB_ADMIN_PASSWORD: password  👈 Change this!

# App section - update these too:
DATABASE_URL: postgresql://postgres:password@...  👈 Password here!
BETTER_AUTH_SECRET: my-secret-key...  👈 Generate with: openssl rand -base64 32
INFLUX_TOKEN: my-super-secret...  👈 Change this!
```

## Troubleshooting

**Port already in use?**
Edit `docker-compose.yml`:
```yaml
ports:
  - "3000:3000"  👈 Change first 3000 to something else
```

**Container won't start?**
```bash
docker-compose logs
```

**Want to delete everything and start fresh?**
```bash
docker-compose down -v
```

## Next Steps

1. Start: `docker-compose up`
2. Open: http://localhost:3000
3. Read: [DOCKER.md](DOCKER.md) for more details
4. Test: Try accessing API at http://localhost:3001/docs

## Need Help?

Check logs: `docker-compose logs service_name`

Services available: `app`, `postgres`, `influxdb`, `mosquitto`
