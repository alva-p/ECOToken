# ECOToken — Infra

Infraestructura y despliegue del proyecto.

```
infra/
├── docker/    # Dockerfiles por servicio + nginx.conf
└── deploy/    # scripts de despliegue
```

## Despliegue (piloto)

| Servicio | Plataforma |
|----------|------------|
| Frontend | Vercel (capa gratuita) |
| Backend | Render (capa gratuita) |
| Base de datos | PostgreSQL gestionado / VPS |
| Blockchain | Sepolia testnet |

Los `Dockerfile` de este directorio se referencian desde el `docker-compose.yml` raíz
(servicios `backend` y `frontend`, hoy comentados hasta que avancen los paquetes).

## Sincronización `develop` → `main`

`.github/workflows/sync-main.yml` mantiene `main` a la par de `develop`: cuando el CI de `develop` termina en verde abre un PR a `main` (parte de `main` y aplica el diff exacto contra `develop`, para evitar los conflictos falsos del historial con squashes) y lo mergea con squash. Vercel despliega producción desde `main`, así que `eco-token-ruddy.vercel.app` queda siempre igual a `develop`. Se puede forzar a mano desde Actions → "Sync main con develop" → Run workflow.

