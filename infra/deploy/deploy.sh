#!/usr/bin/env bash
# Script de despliegue (referencia - Sprint 0).
# Ajustar según el proveedor final (Vercel / Render / VPS).
set -euo pipefail

echo "==> Build backend"
( cd backend && npm ci && npm run build )

echo "==> Build frontend"
( cd frontend && npm ci && npm run build )

echo "==> Deploy: completar con el flujo del proveedor (Vercel / Render)."
