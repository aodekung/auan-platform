#!/bin/bash
set -e

echo "==> Installing dependencies..."
# Render sets NODE_ENV=production which causes pnpm to skip devDependencies.
# But we need @types/*, @auan/tsconfig, and typescript for tsc to work.
NODE_ENV="" pnpm install --no-frozen-lockfile --ignore-scripts

echo "==> Generating Prisma Client..."
cd apps/api
npx prisma@6 generate

echo "==> Building API..."
npx tsc

echo "==> Syncing database schema..."
npx prisma@6 db push --skip-generate

echo "==> Build complete!"
