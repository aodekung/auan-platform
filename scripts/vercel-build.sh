#!/bin/bash
set -e

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> Building customer app..."
pnpm --filter @auan/customer build

echo "==> Building admin app..."
pnpm --filter @auan/admin build

echo "==> Merging dist folders..."
rm -rf vercel-output
mkdir -p vercel-output

# Copy customer app (serves at root /)
cp -r apps/customer/dist/* vercel-output/

# Create admin directory and copy admin app (serves at /admin/)
mkdir -p vercel-output/admin
cp -r apps/admin/dist/* vercel-output/admin/

echo "==> Build complete. Output in vercel-output/"
ls -la vercel-output/
ls -la vercel-output/admin/
