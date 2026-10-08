#!/usr/bin/env bash
# Mantiene el backend del homelab al día con `origin/develop`.
# Lo ejecuta un timer de systemd (ver README.md); también se puede correr a mano.
# Solo reconstruye si hay commits nuevos (o con --forzar).
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
COMPOSE=(docker compose -f "$REPO_DIR/infra/deploy/homelab/docker-compose.yml" --env-file "$REPO_DIR/infra/deploy/homelab/.env")

cd "$REPO_DIR"
git fetch --quiet origin develop
LOCAL="$(git rev-parse HEAD)"
REMOTO="$(git rev-parse origin/develop)"

if [ "$LOCAL" = "$REMOTO" ] && [ "${1:-}" != "--forzar" ]; then
  echo "$(date -Is) sin cambios ($LOCAL)"
  exit 0
fi

echo "$(date -Is) actualizando $LOCAL -> $REMOTO"
git checkout --quiet develop
git reset --hard --quiet origin/develop
"${COMPOSE[@]}" up -d --build --remove-orphans
docker image prune -f >/dev/null
echo "$(date -Is) listo: $(git rev-parse --short HEAD)"
