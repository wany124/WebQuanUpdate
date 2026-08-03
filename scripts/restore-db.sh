#!/usr/bin/env bash
set -euo pipefail

# Restores a pg_dump custom-format backup into a target database.
#
# Usage:
#   ./scripts/restore-db.sh <backup-file> [target-database-url]
#
# If target-database-url is omitted, DATABASE_URL from the environment
# (or .env) is used instead.
#
# WARNING: uses --clean --if-exists, which drops existing objects in
# the target database before restoring. Only point this at a database
# you intend to fully overwrite (e.g. a freshly provisioned staging or
# production database that you are populating for the first time).
#
# --no-owner and --no-acl skip restoring role ownership and
# grant/revoke statements from the source database, since those roles
# usually don't exist on the target (e.g. your local Postgres user
# won't exist on a hosted database).

cd "$(dirname "$0")/.."

BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup-file> [target-database-url]" >&2
  exit 1
fi

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

TARGET_URL="${2:-${DATABASE_URL:-}}"

if [ -z "$TARGET_URL" ]; then
  echo "Error: no target database URL provided and DATABASE_URL is not set." >&2
  exit 1
fi

echo "About to restore:"
echo "  file:   $BACKUP_FILE"
echo "  target: $TARGET_URL"
echo ""
read -r -p "This will DROP and recreate existing objects in the target database. Continue? [y/N] " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

pg_restore --no-owner --no-acl --clean --if-exists -d "$TARGET_URL" "$BACKUP_FILE"
echo "Restore complete."
