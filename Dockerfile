FROM node:20-alpine AS base

# Install pnpm and postgresql-client (for pg_isready in entrypoint)
RUN npm install -g pnpm@9.0.0 && apk add --no-cache postgresql-client

# ---- Dependencies stage ----
FROM base AS deps
WORKDIR /app

# Copy package manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
COPY packages/ui/package.json packages/ui/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/typescript-config/package.json packages/typescript-config/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# ---- Builder stage ----
FROM base AS builder
WORKDIR /app

# Copy deps and source
COPY --from=deps /app ./
COPY . .

# Build Next.js web app (NEXT_PUBLIC_* vars must be available at build time)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_MQTT_BROKER_URL=ws://localhost:9001/mqtt
ENV NEXT_PUBLIC_API_URL=http://localhost:3001/
ENV NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
RUN pnpm --filter web build

# ---- Production stage ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy the full built workspace
COPY --from=builder /app ./

# Copy the entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Expose ports (Next.js: 3000, API: 3001)
EXPOSE 3000 3001

# Health check against API docs
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3001/docs || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
