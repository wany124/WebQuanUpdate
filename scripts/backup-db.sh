#!/usr/bin/env bash
set -euo pipefail

# Creates a timestamped, compressed pg_dump backup of DATABASE_URL.
#
# Usage:
#   ./scripts/backup-db.sh [output-dir]
#
# Reads DATABASE_URL from the environment, or from .env if present.

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: DATABASE_URL is not set (checked environment and .env)." >&2
  exit 1
fi

OUT_DIR="${1:-./backups}"
mkdir -p "$OUT_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUT_FILE="$OUT_DIR/webquan-${TIMESTAMP}.backup"

echo "Backing up database to $OUT_FILE ..."
pg_dump -d "$DATABASE_URL" -Fc -f "$OUT_FILE"

echo "Done. Backup size: $(du -h "$OUT_FILE" | cut -f1)"
echo ""
echo "Restore with:"
echo "  ./scripts/restore-db.sh \"$OUT_FILE\" <target-database-url>"
