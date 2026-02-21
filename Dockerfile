FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy workspace
COPY apps apps
COPY packages packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build applications
RUN pnpm run build

# Set environment
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3001/docs || exit 1

# Start services
CMD ["sh", "-c", "pnpm --filter @repo/api dev & pnpm --filter web dev"]
