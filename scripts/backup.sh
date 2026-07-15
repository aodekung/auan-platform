#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# Auan-Auan-Platform — Database Backup Script
#
# Usage:
#   chmod +x scripts/backup.sh
#   ./scripts/backup.sh              # Creates timestamped backup
#   ./scripts/backup.sh restore      # Restores most recent backup
#
# Backups are stored in ./backups/
# ──────────────────────────────────────────────────────────────

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
ENV_FILE="$PROJECT_ROOT/.env.production"

# Load postgres credentials from env file
if [ -f "$ENV_FILE" ]; then
    export $(grep -E '^POSTGRES_' "$ENV_FILE" | xargs)
fi

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-auan_platform}"
CONTAINER_NAME="auan-postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# ─── Backup ─────────────────────────────────────────────────

backup() {
    local filename="${POSTGRES_DB}_${TIMESTAMP}.sql.gz"
    local filepath="$BACKUP_DIR/$filename"

    echo "Creating backup: $filename"

    docker exec "$CONTAINER_NAME" \
        pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
        | gzip > "$filepath"

    echo "Backup saved: $filepath"
    echo "Size: $(du -h "$filepath" | cut -f1)"

    # Keep only last 30 backups
    ls -t "$BACKUP_DIR"/${POSTGRES_DB}_*.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm --
    echo "Old backups cleaned (keeping last 30)"
}

# ─── Restore ────────────────────────────────────────────────

restore() {
    local latest=$(ls -t "$BACKUP_DIR"/${POSTGRES_DB}_*.sql.gz 2>/dev/null | head -1)

    if [ -z "$latest" ]; then
        echo "ERROR: No backup found in $BACKUP_DIR"
        exit 1
    fi

    echo "WARNING: This will replace all data in $POSTGRES_DB"
    echo "Restoring from: $latest"
    read -rp "Type 'yes' to continue: " confirm

    if [ "$confirm" != "yes" ]; then
        echo "Cancelled."
        exit 0
    fi

    gunzip -c "$latest" \
        | docker exec -i "$CONTAINER_NAME" \
            psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

    echo "Restore complete from: $latest"
}

# ─── Main ───────────────────────────────────────────────────

case "${1:-backup}" in
    backup)   backup ;;
    restore)  restore ;;
    *)        echo "Usage: $0 [backup|restore]"; exit 1 ;;
esac
