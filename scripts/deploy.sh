#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# Auan-Auan-Platform — Production Deployment Script
#
# Usage:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh
#
# Prerequisites:
#   - Docker and Docker Compose installed
#   - .env.production file exists and is configured
#   - pnpm installed (for frontend build)
# ──────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.production"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ─── Pre-flight checks ──────────────────────────────────────

info "Starting Auan-Auan Platform deployment..."

if [ ! -f "$ENV_FILE" ]; then
    error ".env.production not found. Copy .env.production.example and fill in values."
fi

# Verify required vars exist (basic check)
required_vars=(
    DATABASE_URL
    JWT_SECRET
    STAFF_JWT_SECRET
    LINE_CHANNEL_ID
    LINE_CHANNEL_SECRET
    POSTGRES_PASSWORD
)

for var in "${required_vars[@]}"; do
    if grep -qE "^${var}=" "$ENV_FILE" && ! grep -qE "^${var}=\s*$|CHANGE_ME|your-" "$ENV_FILE"; then
        info "  ✓ $var configured"
    else
        warn "  ✗ $var is missing or still has placeholder value"
    fi
done

# ─── Build frontends ────────────────────────────────────────

info "Installing dependencies..."
cd "$PROJECT_ROOT"
pnpm install --frozen-lockfile

info "Building customer frontend..."
pnpm --filter @auan/customer build

info "Building admin frontend..."
pnpm --filter @auan/admin build

# ─── Docker ──────────────────────────────────────────────────

info "Building and starting Docker containers..."
docker compose -f docker-compose.prod.yml up -d --build

info "Waiting for services to be healthy..."
sleep 10

# ─── Health check ───────────────────────────────────────────

info "Running health check..."
HEALTH_RESPONSE=$(curl -sf http://localhost:80/api/v1/health 2>/dev/null || echo "FAILED")

if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    info "Health check passed!"
else
    error "Health check failed. Response: $HEALTH_RESPONSE"
fi

info "Deployment complete!"
info "  Customer app: http://localhost/"
info "  Admin app:    http://localhost/admin/"
info "  API:          http://localhost/api/v1/health"
info ""
warn "Remember to set up HTTPS (Cloudflare, Let's Encrypt, etc.)"
