#!/usr/bin/env bash
# Backup diario de la base (pg_dump comprimido). Conserva los últimos 7.
set -euo pipefail

DESTINO="${BACKUP_DIR:-$HOME/backups/ecotoken}"
mkdir -p "$DESTINO"
ARCHIVO="$DESTINO/ecotoken-$(date +%F).sql.gz"

docker exec ecotoken-develop-postgres-1 pg_dump -U ecotoken ecotoken | gzip > "$ARCHIVO"
ls -1t "$DESTINO"/ecotoken-*.sql.gz | tail -n +8 | xargs -r rm --
echo "backup: $ARCHIVO"
