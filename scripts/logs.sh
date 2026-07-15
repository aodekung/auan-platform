#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# Auan-Auan-Platform — View Production Logs
#
# Usage:
#   chmod +x scripts/logs.sh
#   ./scripts/logs.sh              # All services
#   ./scripts/logs.sh api          # API only
#   ./scripts/logs.sh nginx       # Nginx only
#   ./scripts/logs.sh postgres    # PostgreSQL only
#   ./scripts/logs.sh api -f      # Follow (tail)
# ──────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVICE="${1:-}"

cd "$PROJECT_ROOT"

if [ -z "$SERVICE" ]; then
    docker compose -f docker-compose.prod.yml logs "${@:2}"
else
    docker compose -f docker-compose.prod.yml logs "$SERVICE" "${@:2}"
fi
