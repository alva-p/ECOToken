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
