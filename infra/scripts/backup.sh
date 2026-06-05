#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
# Coast Academy — Postgres backup script
# Usage: ./infra/scripts/backup.sh [local|remote]
#
# Requires environment variables:
#   SUPABASE_DB_URL   — postgres connection string (service role)
#   BACKUP_DIR        — local path to store dumps (default: infra/backups)
#   RETENTION_DAYS    — how many days to keep local backups (default: 30)
# ──────────────────────────────────────────────────────────────────
set -euo pipefail

MODE="${1:-local}"
BACKUP_DIR="${BACKUP_DIR:-$(dirname "$0")/../../infra/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="coast-academy_backup_${TIMESTAMP}.sql.gz"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

# ── Validate env ──────────────────────────────────────────────────
if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "ERROR: SUPABASE_DB_URL is required" >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

echo "[backup] Starting ${MODE} backup → ${FILEPATH}"

# ── Dump ─────────────────────────────────────────────────────────
pg_dump \
  --no-owner \
  --no-acl \
  --schema=public \
  --schema=auth \
  "${SUPABASE_DB_URL}" \
  | gzip -9 \
  > "${FILEPATH}"

SIZE=$(du -sh "${FILEPATH}" | cut -f1)
echo "[backup] Done — ${FILENAME} (${SIZE})"

# ── Prune old backups ─────────────────────────────────────────────
if [[ "${MODE}" == "local" ]]; then
  PRUNED=$(find "${BACKUP_DIR}" -name "coast-academy_backup_*.sql.gz" \
    -mtime "+${RETENTION_DAYS}" -print -delete | wc -l)
  echo "[backup] Pruned ${PRUNED} backup(s) older than ${RETENTION_DAYS} days"
fi

# ── Optional: upload to remote storage ───────────────────────────
if [[ "${MODE}" == "remote" ]]; then
  if [[ -z "${S3_BUCKET:-}" ]]; then
    echo "WARN: S3_BUCKET not set; skipping remote upload" >&2
  else
    aws s3 cp "${FILEPATH}" "s3://${S3_BUCKET}/backups/${FILENAME}" \
      --storage-class STANDARD_IA
    echo "[backup] Uploaded to s3://${S3_BUCKET}/backups/${FILENAME}"
  fi
fi

echo "[backup] Complete"
