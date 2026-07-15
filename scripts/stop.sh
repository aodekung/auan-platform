#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# Auan-Auan-Platform — Stop Production Services
#
# Usage:
#   chmod +x scripts/stop.sh
#   ./scripts/stop.sh
# ──────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

docker compose -f docker-compose.prod.yml down

echo "All services stopped."
