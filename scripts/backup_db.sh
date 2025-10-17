#!/usr/bin/env bash
set -euo pipefail

# Simple PostgreSQL backup script for cron usage.

TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
BACKUP_DIR="${1:-/var/backups/houndz}"
mkdir -p "$BACKUP_DIR"

docker exec house-of-houndz-db pg_dump -U houndz houndz > "$BACKUP_DIR/houndz-${TIMESTAMP}.sql"

find "$BACKUP_DIR" -type f -mtime +30 -delete

echo "Backup complete: $BACKUP_DIR/houndz-${TIMESTAMP}.sql"

