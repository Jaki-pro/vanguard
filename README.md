# 🚀 Vanguard - IoT Vehicle Telemetry Platform

> **A modern, full-stack IoT platform for real-time vehicle telemetry monitoring, data collection, and intelligent device management.**

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js->=18-brightgreen?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-purple)](LICENSE)
[![Turbo](https://img.shields.io/badge/Monorepo-Turbo-blueviolet?logo=turborepo)](https://turbo.build/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?logo=postgresql)](https://www.postgresql.org/)

**[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure) • [API Documentation](#-api-documentation)**

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#-features)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Environment Configuration](#-environment-configuration)
- [Development Workflows](#-development-workflows)
- [Deployment Guide](#-deployment-guide)
- [Contributing](#-contributing)

---

## Overview

**Vanguard** is a production-ready IoT platform designed to collect, process, and visualize real-time vehicle telemetry data. Built with modern technologies and best practices, it provides:

- 🌐 **Real-time Data Streaming** via MQTT protocol
- 📊 **Time-Series Data Storage** in InfluxDB
- 🔐 **Enterprise-Grade Authentication** with Better-Auth
- 📱 **Modern Web Dashboard** for device monitoring
- 🔌 **Scalable API** with OpenAPI documentation
- 🏗️ **Monorepo Architecture** with shared components
- 🧪 **Virtual Device Simulation** for testing

### Problem It Solves

Traditional GPS/IoT tracking systems lack:

- Real-time data processing capabilities
- Scalable cloud-native architecture
- User-friendly dashboards
- Multi-device management
- Strong authentication mechanisms

**Vanguard** addresses all of these challenges with a modern, extensible platform.

---

## 🎯 Features

### 🔴 Live Telemetry Collection

- **MQTT Integration**: Subscribes to device telemetry topics (`devices/+/telemetry`)
- Real-time message buffering and batch processing
- 60-second flush intervals for optimal performance
- Support for unlimited concurrent devices

### 📈 Time-Series Data Storage

- **InfluxDB Backend**: Storing millions of data points efficiently
- Automatic data point creation with tags and fields
- Timestamp precision in milliseconds
- Query optimization for historical analysis

### 🎪 Virtual Device Simulation

- Simulate multiple devices publishing telemetry
- Realistic GPS coordinates (Dhaka, Bangladesh base)
- Dynamic sensor variations (temperature, battery, signal)
- Perfect for development and testing without hardware

### 🔐 Multi-Tenant Authentication

- Email & password authentication
- Session-based user management
- Role-based access control ready
- Secure password hashing with better-auth

### 📊 Device Management System

- Create and manage multiple devices per user
- Track device-user relationships
- Device metadata storage
- Unique constraint enforcement for user-device pairs

### 🌐 RESTful API with OpenAPI

- Auto-generated API documentation via Swagger UI
- Scalar API reference interface
- Type-safe request/response validation with Zod
- CORS enabled for cross-origin requests
- Get last 100 telemetry points for any device

### 💻 Modern Web Dashboard

- Next.js 16 with React 19
- Beautiful UI with Tailwind CSS & Framer Motion
- Responsive design for all devices
- Real-time authentication state management
- Protected routes and user sessions

### 🎨 Shared Component Library

- Reusable React components
- Centralized styling with Tailwind
- Button, Card, Code snippet components
- Ready for component consumption across apps

---

## ⚡ Quick Start

### Prerequisites

```bash
# Required versions
- Node.js >= 18.x
- PostgreSQL >= 12.x
- MQTT Broker (Mosquitto or similar)
- InfluxDB 2.x (optional for production)
```

### 1️⃣ Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/yourusername/vanguard.git
cd vanguard

# Install dependencies with pnpm
pnpm install
```

### 2️⃣ Setup Databases

```bash
# PostgreSQL setup
createdb vanguard_db

# Run migrations
cd packages/db
pnpm run migrate

# Generate Prisma client
pnpm generate
```

### 3️⃣ Configure Environment Variables

#### API `.env` (`apps/api/.env`)

```env
# MQTT Broker Configuration
BROKER_URL=mqtt://localhost:1883

# InfluxDB Configuration
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=your-influx-token
INFLUX_ORG=GT-Originals
INFLUX_BUCKET=vanguard_db
```

#### Database `.env` (`packages/db/.env`)

```env
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/vanguard_db
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

### 4️⃣ Start Development Servers

```bash
# Start all services in parallel (Turbo orchestration)
pnpm dev

# This will start:
# - Web app (Next.js)     → http://localhost:3000
# - API server (Hono)     → http://localhost:3001
# - Virtual devices       → Publishing telemetry
# - MQTT subscriber       → Processing messages
```

### 5️⃣ Access the Application

| Service                | URL                                 | Purpose                           |
| ---------------------- | ----------------------------------- | --------------------------------- |
| **Web Dashboard**      | http://localhost:3000               | Main UI, login, device management |
| **API Docs (Swagger)** | http://localhost:3001/swagger       | Interactive API documentation     |
| **API Docs (Scalar)**  | http://localhost:3001/api/reference | Beautiful API reference           |
| **OpenAPI JSON**       | http://localhost:3001/openapi.json  | Machine-readable schema           |

---

## 🏗️ Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      VANGUARD PLATFORM                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────┐      ┌──────────┐
│   DEVICES       │         │   VIRTUAL    │      │ WEB APP  │
│ (In-field IoT)  │         │   DEVICES    │      │(React)  │
└────────┬────────┘         └──────┬───────┘      └────┬─────┘
         │                         │                    │
         └─────────────────┬───────┴────────────────────┘
                           │
                    ┌──────▼─────────┐
                    │  MQTT BROKER   │ ◄─── Pub/Sub
                    │  (Mosquitto)   │
                    └──────┬─────────┘
                           │
                    ┌──────▼─────────┐
                    │   API SERVER   │
                    │  (Hono + TS)   │
                    └──────┬─────────┘
                    ┌──────┴──────────────┬─────────────┐
                    │                     │             │
            ┌───────▼────────┐   ┌────────▼─────┐  ┌────▼────────┐
            │  PostgreSQL    │   │   InfluxDB   │  │ OpenAPI/    │
            │  (User Data)   │   │(Time-Series) │  │  Swagger    │
            └────────────────┘   └──────────────┘  └─────────────┘
```

### Data Flow

```
Device Hardware
    ↓
MQTT Broker (devices/+/telemetry)
    ↓
API Server (Message Buffer)
    ↓
InfluxDB (Time-Series Storage)
    ↓
Web Dashboard (Real-time Charts)
```

### Request/Response Cycle

```
Client -> Next.js App -> Hono API -> InfluxDB Query
                             ↓
                         OpenAPI Validation
                             ↓
                         Response JSON
```

---

## 🛠️ Tech Stack

### Frontend

| Technology        | Purpose                  | Version |
| ----------------- | ------------------------ | ------- |
| **Next.js**       | React framework with SSR | 16.1.0  |
| **React**         | UI library               | 19.2.0  |
| **TypeScript**    | Type safety              | 5.9.2   |
| **Tailwind CSS**  | Styling framework        | 4.1.18  |
| **Framer Motion** | Animations               | 12.34.0 |
| **Lucide React**  | Icon library             | 0.564.0 |
| **Better-Auth**   | Authentication           | 1.4.18  |

### Backend

| Technology                      | Purpose              | Version |
| ------------------------------- | -------------------- | ------- |
| **Hono**                        | Web framework        | 4.11.5  |
| **TypeScript**                  | Type safety          | 5.9.3   |
| **Zod**                         | Schema validation    | 4.3.6   |
| **@hono/zod-openapi**           | OpenAPI integration  | 1.2.1   |
| **MQTT.js**                     | MQTT client          | 5.14.1  |
| **@influxdata/influxdb-client** | InfluxDB integration | 1.35.0  |

### Infrastructure

| Technology      | Purpose                   |
| --------------- | ------------------------- |
| **PostgreSQL**  | Relational database       |
| **Drizzle ORM** | Type-safe database access |
| **InfluxDB**    | Time-series database      |
| **MQTT**        | Message broker            |
| **Turbo**       | Monorepo orchestration    |

### Developer Tools

| Technology   | Purpose              |
| ------------ | -------------------- |
| **pnpm**     | Package manager      |
| **Turbo**    | Build orchestration  |
| **ESLint**   | Code linting         |
| **Prettier** | Code formatting      |
| **tsx**      | TypeScript execution |

---

## 📁 Project Structure

```
vanguard/
├── 📄 package.json              # Root workspace config
├── 📄 pnpm-workspace.yaml       # Monorepo config
├── 📄 turbo.json                # Build orchestration
├── 📄 tsconfig.json             # TypeScript base config
│
├── apps/
│   ├── api/                     # 🔌 Hono REST API
│   │   ├── src/
│   │   │   ├── index.ts         # App entry point
│   │   │   ├── mqtt/
│   │   │   │   └── mqtt-client.ts          # MQTT broker subscription
│   │   │   ├── virtual-simulations/
│   │   │   │   └── telemetry.ts            # Device simulator
│   │   │   └── features/
│   │   │       └── telemetry/
│   │   │           ├── telemetry.route.ts  # Route handlers
│   │   │           ├── telemetry.handler.ts # Business logic
│   │   │           └── telemetry.schema.ts  # Zod schemas
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                     # 🌐 Next.js Web App
│       ├── app/
│       │   ├── api/
│       │   │   └── auth/[...all]/route.ts  # Auth API routes
│       │   ├── dashboard/page.tsx          # Dashboard
│       │   ├── login/page.tsx              # Login page
│       │   ├── signup/page.tsx             # Signup page
│       │   ├── page.tsx                    # Home page
│       │   ├── layout.tsx                  # Root layout
│       │   └── globals.css                 # Global styles
│       ├── hooks/
│       │   └── use-auth.ts                 # Auth hook
│       ├── lib/
│       │   ├── auth-client.ts              # Auth client
│       │   └── client.ts                   # API client
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── db/                      # 🗄️ Database & Schema
│   │   ├── src/
│   │   │   ├── schema.ts        # Drizzle ORM schema
│   │   │   ├── db.ts            # Database client
│   │   │   ├── auth.ts          # Better-auth setup
│   │   │   └── index.ts         # Exports
│   │   ├── drizzle/
│   │   │   ├── migrations/      # SQL migrations
│   │   │   └── meta/            # Migration metadata
│   │   ├── .env                 # Database config
│   │   ├── drizzle.config.ts    # Drizzle config
│   │   └── package.json
│   │
│   ├── ui/                      # 🎨 Shared Components
│   │   ├── src/
│   │   │   ├── button.tsx       # Button component
│   │   │   ├── card.tsx         # Card component
│   │   │   └── code.tsx         # Code component
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── eslint-config/           # 📋 ESLint Configs
│   │   ├── base.js              # Base config
│   │   ├── next.js              # Next.js config
│   │   └── react-internal.js    # React config
│   │
│   └── typescript-config/       # 📘 TypeScript Configs
│       ├── base.json            # Base tsconfig
│       ├── nextjs.json          # Next.js tsconfig
│       └── react-library.json   # React lib tsconfig
│
└── README.md                    # This file
```

### Key File Descriptions

| File                                            | Purpose                                                      | Type    |
| ----------------------------------------------- | ------------------------------------------------------------ | ------- |
| `apps/api/src/index.ts`                         | API initialization, middleware setup, route mounting         | Core    |
| `apps/api/src/mqtt/mqtt-client.ts`              | MQTT broker subscription, message buffering, InfluxDB writes | Core    |
| `apps/api/src/virtual-simulations/telemetry.ts` | Simulates devices publishing telemetry                       | Testing |
| `apps/web/app/page.tsx`                         | Landing page with features showcase                          | UI      |
| `packages/db/src/schema.ts`                     | Database tables: users, devices, sessions                    | Core    |
| `packages/db/src/auth.ts`                       | Authentication configuration                                 | Core    |

---

## 🔗 API Documentation

### Base URL

```
http://localhost:3001
```

### Available Endpoints

#### 1. Get Device Telemetry

```http
GET /telemetry/{device_id}
```

**Parameters:**

- `device_id` (path, required): The device identifier (e.g., "device-001")

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "device_id": "device-001",
      "timestamp": "2024-02-18T10:30:45.123Z",
      "latitude": 23.8103,
      "longitude": 90.4125,
      "altitude": 12.5,
      "speed": 45.67,
      "heading": 180,
      "accuracy": 4.2,
      "satellites": 12,
      "battery_level": 85,
      "charging": true,
      "signal_strength": -65,
      "temperature": 32.5,
      "status": "active"
    }
  ],
  "count": 1
}
```

**Error (500):**

```json
{
  "success": false,
  "message": "Failed to retrieve telemetry data"
}
```

### Telemetry Data Fields Reference

| Field             | Type     | Description                  | Unit                       |
| ----------------- | -------- | ---------------------------- | -------------------------- |
| `device_id`       | string   | Unique device identifier     | -                          |
| `timestamp`       | ISO 8601 | Data collection timestamp    | -                          |
| `latitude`        | number   | Geographic latitude          | Degrees                    |
| `longitude`       | number   | Geographic longitude         | Degrees                    |
| `altitude`        | number   | Height above sea level       | Meters                     |
| `speed`           | number   | Vehicle speed                | km/h                       |
| `heading`         | integer  | Direction of travel          | Degrees (0-360)            |
| `accuracy`        | number   | GPS accuracy                 | Meters                     |
| `satellites`      | integer  | Connected satellites count   | Count                      |
| `battery_level`   | integer  | Device battery percentage    | % (0-100)                  |
| `charging`        | boolean  | Charging status              | true/false                 |
| `signal_strength` | integer  | Network signal strength      | dBm                        |
| `temperature`     | number   | Device operating temperature | °C                         |
| `status`          | string   | Device status                | "active", "inactive", etc. |

### Interactive API Documentation

Visit these URLs in your browser:

- **Swagger UI**: `http://localhost:3001/swagger`
- **Scalar Reference**: `http://localhost:3001/api/reference`

---

## 🗄️ Database Schema

### Entity-Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ email (UNIQUE)  │
│ emailVerified   │
│ image           │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │ 1
         │ (has many)
         │
         │
    ┌────┴─────────────────┐
    │                      │
    │ 1 (has many)        │ 1 (has many)
    │                      │
┌──▼──────────────┐   ┌───▼───────────┐
│   devices       │   │    session    │
├─────────────────┤   ├───────────────┤
│ id (PK)         │   │ id (PK)       │
│ deviceName      │   │ expiresAt     │
└─────────────────┘   │ token (UNIQUE)│
    ▲                 │ ipAddress     │
    │                 │ userAgent     │
    │ M               │ userId (FK)   │
    │ (references)    │ createdAt     │
    │                 │ updatedAt     │
┌───┴──────────────┐  └───────────────┘
│ userDevices      │
├──────────────────┤
│ id (PK)          │
│ deviceId (FK)    │  ┌─────────────┐
│ userId (FK)      │  │   account   │
├──────────────────┤  ├─────────────┤
│ UNIQUE(userId,   │  │ id (PK)     │
│        deviceId) │  │ accountId   │
└──────────────────┘  │ providerId  │
                      │ userId (FK) │
                      └─────────────┘
```

### Tables Overview

#### `users`

Stores user account information with authentication details.

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  emailVerified BOOLEAN NOT NULL DEFAULT false,
  image VARCHAR(500),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### `devices`

Represents IoT devices that publish telemetry data.

```sql
CREATE TABLE devices (
  id SERIAL PRIMARY KEY,
  deviceName VARCHAR(255) NOT NULL
);
```

#### `userDevices`

Maps users to their devices (many-to-many relationship).

```sql
CREATE TABLE userDevices (
  id SERIAL PRIMARY KEY,
  deviceId INTEGER NOT NULL REFERENCES devices(id),
  userId VARCHAR(255) NOT NULL REFERENCES users(id),
  UNIQUE(userId, deviceId)
);
```

#### `session`

Manages user sessions and authentication tokens.

```sql
CREATE TABLE session (
  id VARCHAR(255) PRIMARY KEY,
  expiresAt TIMESTAMP NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  ipAddress VARCHAR(45),
  userAgent VARCHAR(500),
  userId VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### `account`

Stores authentication provider information.

```sql
CREATE TABLE account (
  id VARCHAR(255) PRIMARY KEY,
  accountId VARCHAR(255) NOT NULL,
  providerId VARCHAR(255) NOT NULL,
  userId VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accessToken VARCHAR(1000),
  refreshToken VARCHAR(1000),
  idToken VARCHAR(1000),
  accessTokenExpiresAt TIMESTAMP,
  refreshTokenExpiresAt TIMESTAMP,
  scope VARCHAR(500),
  password VARCHAR(255),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### InfluxDB Schema

**Measurement**: `device_telemetry`

**Tags:**

- `device_id` - Device identifier
- `status` - Device status

**Fields:**

- `latitude` (float)
- `longitude` (float)
- `altitude` (float)
- `speed` (float)
- `accuracy` (float)
- `temperature` (float)
- `heading` (int)
- `satellites` (int)
- `battery_level` (int)
- `signal_strength` (int)
- `charging` (boolean)

---

## ⚙️ Environment Configuration

### Required Environment Variables

#### API Server (`apps/api/.env`)

```env
# MQTT Broker - Protocol: mqtt:// or mqtts://
BROKER_URL=mqtt://localhost:1883

# InfluxDB Configuration
# URL must include protocol (http:// or https://)
INFLUX_URL=http://localhost:8086

# InfluxDB authentication token with write permissions
INFLUX_TOKEN=KZ0hKXFHkBpQO6QzgDpR2zug61FAD2Og3EDaiRmqTKWCN52rS11rVwaq1vZlb71qEoXJF_xUu_zKVhoGdZRIvQ==

# InfluxDB organization name (created in InfluxDB admin)
INFLUX_ORG=GT-Originals

# InfluxDB bucket name (data repository)
INFLUX_BUCKET=vanguard_db
```

#### Database (`packages/db/.env`)

```env
# PostgreSQL connection string
# Format: postgresql://[user]:[password]@[host]:[port]/[database]
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/vanguard_db

# Authentication secret for token signing
BETTER_AUTH_SECRET=your-super-secret-key-min-32-characters-long

# Base URL for auth callbacks
BETTER_AUTH_URL=http://localhost:3000
```

### Configuration Tips

| Variable             | Notes                                                               |
| -------------------- | ------------------------------------------------------------------- |
| `BROKER_URL`         | Ensure MQTT broker is running before starting API                   |
| `INFLUX_URL`         | Must include protocol; InfluxDB must be accessible                  |
| `INFLUX_TOKEN`       | Generate in InfluxDB UI with bucket:create, bucket:read permissions |
| `DATABASE_URL`       | Use local PostgreSQL for development                                |
| `BETTER_AUTH_SECRET` | Use strong random string, min 32 chars                              |

---

## 🚀 Development Workflows

### Building the Project

```bash
# Build all packages and apps
pnpm build

# Build specific workspace
pnpm build --filter=@repo/api

# Build with turbo
turbo build
```

### Running Development Mode

```bash
# Start all services with Turbo orchestration
pnpm dev

# Start specific app
pnpm dev --filter=web
pnpm dev --filter=@repo/api

# Start in watch mode (auto-rebuild)
cd apps/api && pnpm run dev
```

### Linting & Type Checking

```bash
# Lint all code
pnpm lint

# Format code
pnpm format

# Type checking
pnpm check-types

# Check all
pnpm lint && pnpm format && pnpm check-types
```

### Database Migrations

```bash
# Create migration after schema changes
cd packages/db
pnpm run migrate:dev --name migration_name

# Check migration status
pnpm run migrate:status

# Reset database (⚠️ destructive!)
pnpm run migrate:reset

# Generate Drizzle client
pnpm run generate
```

### Testing & Simulation

```bash
# Virtual devices automatically start with API
# Monitor output in API terminal

# Test telemetry endpoint
curl http://localhost:3001/telemetry/device-001

# Test with real MQTT client (optional)
mosquitto_sub -h localhost -t 'devices/+/telemetry'
```

### Common Commands

```bash
# Install dependencies
pnpm install

# Add dependency to specific workspace
pnpm add axios --filter=@repo/api

# Remove dependency
pnpm remove lodash --filter=web

# Update all dependencies
pnpm update --recursive

# Audit dependencies for vulnerabilities
pnpm audit

# View workspace information
pnpm ls --recursive --depth=0
```

---

## 🌍 Deployment Guide

### Prerequisites

- Docker & Docker Compose (recommended)
- Production PostgreSQL database
- Production InfluxDB instance
- MQTT broker in production
- Node.js 18+ on server

### Environment Setup for Production

#### Create production `.env` files

**`apps/api/.env.production`:**

```env
BROKER_URL=mqtt://mqtt-server.example.com:1883
INFLUX_URL=https://influxdb.example.com
INFLUX_TOKEN=production-token-here
INFLUX_ORG=MyOrganization
INFLUX_BUCKET=telemetry_prod
NODE_ENV=production
```

**`packages/db/.env.production`:**

```env
DATABASE_URL=postgresql://user:password@prod-db.aws.com:5432/vanguard_prod
BETTER_AUTH_SECRET=production-secret-key-here
BETTER_AUTH_URL=https://vanguard.example.com
```

### Docker Deployment

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build applications
RUN pnpm build

# Expose ports
EXPOSE 3000 3001

# Start both services
CMD ["pnpm", "dev"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: vanguard_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

  influxdb:
    image: influxdb:2-alpine
    environment:
      INFLUXDB_DB: vanguard_db
      INFLUXDB_ADMIN_USER: admin
      INFLUXDB_ADMIN_PASSWORD: ${INFLUX_PASSWORD}
    volumes:
      - influxdb_data:/var/lib/influxdb2
    ports:
      - '8086:8086'

  mqtt:
    image: eclipse-mosquitto:2-alpine
    volumes:
      - ./config/mosquitto.conf:/mosquitto/config/mosquitto.conf
      - mqtt_data:/mosquitto/data
    ports:
      - '1883:1883'

  app:
    build: .
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/vanguard_prod
      BROKER_URL: mqtt://mqtt:1883
      INFLUX_URL: http://influxdb:8086
      INFLUX_TOKEN: ${INFLUX_TOKEN}
      INFLUX_ORG: MyOrganization
      INFLUX_BUCKET: vanguard_db
    ports:
      - '3000:3000'
      - '3001:3001'
    depends_on:
      - postgres
      - influxdb
      - mqtt

volumes:
  postgres_data:
  influxdb_data:
  mqtt_data:
```

### Cloud Deployment (AWS Example)

1. **Deploy Frontend (Next.js) to Vercel:**

   ```bash
   vercel deploy --prod
   ```

2. **Deploy Backend (Hono API) to AWS ECS/Lambda:**

   ```bash
   # Build Docker image
   docker build -t vanguard-api:latest .

   # Push to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
   docker tag vanguard-api:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/vanguard-api:latest
   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/vanguard-api:latest
   ```

3. **Setup RDS PostgreSQL:**
   - Create RDS instance
   - Configure security groups
   - Run migrations: `pnpm migrate:deploy`

4. **Setup InfluxDB Cloud:**
   - Create InfluxDB Cloud account
   - Create bucket and organization
   - Generate API token

### Performance Optimization

```javascript
// API Server Optimization
const writeApi = influx.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 'ms', {
  flushInterval: 60000, // Batch writes every 60 seconds
  maxRetries: 3,
  maxBatchSize: 5000,
})

// Database Connection Pooling
const connectionString = `${DATABASE_URL}?sslmode=require&pool_size=20`
```

---

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Run linter: `pnpm lint`
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open Pull Request

### Coding Standards

```typescript
// ✅ DO: Use type safety
import { z } from 'zod';

const schema = z.object({
  deviceId: z.string().min(1),
  value: z.number().positive(),
});

// ❌ DON'T: Use any types
const data: any = { ... };

// ✅ DO: Export types explicitly
export type Device = typeof devicesTable.$inferSelect;

// ❌ DON'T: Use default exports in libraries
export const function() { ... }
```

### Commit Message Convention

```
feat: add device simulation
fix: handle mqtt connection timeout
docs: update API documentation
style: format telemetry handler
refactor: optimize database queries
test: add telemetry endpoint tests
chore: update dependencies
```

---

## 📊 Monitoring & Debugging

### API Server Logs

```bash
# Watch API logs
cd apps/api
pnpm run dev

# Monitor MQTT messages
mosquitto_sub -h localhost -t '#' -v

# Monitor InfluxDB
curl -X GET "http://localhost:8086/api/v2/buckets" \
  -H "Authorization: Token YOUR_TOKEN"
```

### Database Inspection

```bash
# Connect to PostgreSQL
psql postgresql://postgres:password@127.0.0.1:5432/vanguard_db

# List tables
\dt

# Query users
SELECT id, name, email FROM users;

# Query sessions
SELECT * FROM session WHERE "userId" = 'user-id';
```

### Performance Metrics

**MQTT Processing:**

- Messages per second: Check console output
- Buffer size: Displayed in logs
- Flush interval: 60 seconds

**Database:**

- Query response time
- Connection pool usage
- Slow query logs

---

## 📚 Resources & Documentation

### Official Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Hono Framework](https://hono.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [MQTT Protocol](https://mqtt.org)
- [InfluxDB Docs](https://docs.influxdata.com)
- [Turbo Monorepo](https://turbo.build)

### Useful Tools

- [API Tester - Postman](https://www.postman.com)
- [MQTT Client - MQTT Explorer](http://mqtt-explorer.com)
- [Database Client - DBeaver](https://dbeaver.io)
- [API Docs - Swagger UI](https://swagger.io/tools/swagger-ui)

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "Cannot connect to MQTT broker"**

```bash
# Check if MQTT broker is running
mosquitto --version

# Start Mosquitto
mosquitto -d -p 1883

# Test connection
mosquitto_pub -h localhost -t test/topic -m "hello"
```

**Issue: InfluxDB connection failed**

```bash
# Check InfluxDB health
curl http://localhost:8086/health

# Verify token
influx auth list

# Test write
curl -X POST http://localhost:8086/api/v2/write \
  -H "Authorization: Token YOUR_TOKEN"
```

**Issue: Database migrations failing**

```bash
# Check migration status
pnpm run migrate:status

# Reset and retry
pnpm run migrate:reset
pnpm run migrate:dev --name recovery
```

**Issue: Port already in use**

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 pnpm dev
```

---

## 📜 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 👥 Contributors

- **Md Jakaria Hossain** - Project Lead & Developer

---

## 📞 Support & Contact

- 📧 Email: support@vanguard.local
- 🐦 Twitter: [@vanguard_iot](https://twitter.com)
- 🔗 Website: https://vanguard.example.com
- 💬 Discord: [Vanguard Community](https://discord.gg)

---

<div align="center">

**Made with ❤️ by the Vanguard team**

[⬆ Back to top](#-vanguard---iot-vehicle-telemetry-platform)

</div>
