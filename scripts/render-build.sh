#!/bin/bash
set -e

echo "==> Installing dependencies..."
pnpm install --no-frozen-lockfile --prod=false

echo "==> Generating Prisma Client..."
cd apps/api
npx prisma@6 generate

echo "==> Building API..."
npx tsc

echo "==> Deploying database migrations..."
npx prisma@6 migrate deploy

echo "==> Build complete!"
