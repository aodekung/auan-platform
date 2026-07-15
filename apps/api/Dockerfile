# ──────────────────────────────────────────────────────────────
# Auan-Auan-Platform — API Dockerfile
# Multi-stage build for production
# ──────────────────────────────────────────────────────────────

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./

# Copy package.json for each workspace package (required by pnpm install)
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

# Stage 2: Build API
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy full source (needed for TypeScript compilation)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/types/ ./packages/types/
COPY apps/api/ ./apps/api/

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules

# Generate Prisma client + build TypeScript
RUN pnpm --filter @auan/api db:generate
RUN pnpm --filter @auan/api build

# Stage 3: Production runtime
FROM node:20-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy workspace config + package.json (for pnpm to resolve workspace packages)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules

# Copy build artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Copy @auan/types source (consumed as TS source via "main": "./src/index.ts")
COPY --from=builder /app/packages/types/src ./packages/types/src

# Create upload directory
RUN mkdir -p /app/apps/api/uploads

EXPOSE 3000

WORKDIR /app/apps/api

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
