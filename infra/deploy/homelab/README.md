# Backend de `develop` 24/7 en el homelab

Corre Postgres + el backend NestJS de la rama `develop` en el homelab, para que todo el grupo
pruebe el sistema. El frontend sigue en Vercel y le habla al backend a través de un `rewrite`
(`/api/*`), así los usuarios solo ven la URL de Vercel.

```
Usuarios ─► eco-token-ruddy.vercel.app ─(/api/*)─► ecotoken-api.alva-p.xyz
                                                    └─ Cloudflare Tunnel ─► homelab:3300 (Docker)
```

La IP real del homelab nunca se expone: el túnel sale desde la casa hacia Cloudflare y no
abre puertos en el router.

## Qué hay en esta carpeta

| Archivo | Para qué |
|---------|----------|
| `docker-compose.yml` | Postgres (sin puerto publicado) + backend en `127.0.0.1:3300` |
| `.env.example` | Variables a completar en `.env` (secretos, no se commitea) |
| `actualizar.sh` | `git pull` de `develop` + rebuild solo si hay commits nuevos |
| `ecotoken-actualizar.{service,timer}` | Corre `actualizar.sh` cada 5 minutos (systemd) |
| `backup.sh` | `pg_dump` comprimido, conserva los últimos 7 |

## Puesta en marcha (una sola vez)

1. **Clonar** (el repo es público, no hacen falta credenciales):
   ```bash
   mkdir -p ~/Proyectos && cd ~/Proyectos
   git clone https://github.com/alva-p/ECOToken.git && cd ECOToken && git checkout develop
   ```
2. **Secretos**:
   ```bash
   cd infra/deploy/homelab
   cp .env.example .env && chmod 600 .env
   # completar .env; para generar valores: openssl rand -hex 32
   ```
   Las llaves `MINTER/BURNER/ADMIN_PRIVATE_KEY` deben ser de **billeteras de testnet sin fondos
   reales**, exclusivas para esto.
3. **Levantar**:
   ```bash
   ./actualizar.sh --forzar
   curl localhost:3300/health      # {"status":"ok","db":"up",...}
   ```
   El contenedor aplica las migraciones solo al arrancar.
4. **Datos de demo (opcional)**:
   ```bash
   docker compose exec backend npx ts-node prisma/seed-demo.ts
   ```
5. **Túnel de Cloudflare**: agregar en `/etc/cloudflared/config.yml`, antes de la regla final
   `http_status:404`:
   ```yaml
   - hostname: ecotoken-api.alva-p.xyz
     service: http://localhost:3300
   ```
   ```bash
   sudo cp /etc/cloudflared/config.yml /etc/cloudflared/config.yml.bak-$(date +%F)
   cloudflared tunnel route dns homelab ecotoken-api.alva-p.xyz
   sudo systemctl restart cloudflared
   ```
   (Si se prefiere desde el panel de Cloudflare: DNS → CNAME `ecotoken-api` →
   `<ID-del-túnel>.cfargotunnel.com`, con proxy activado.)
6. **Actualización automática**:
   ```bash
   sudo cp ecotoken-actualizar.service ecotoken-actualizar.timer /etc/systemd/system/
   sudo systemctl daemon-reload && sudo systemctl enable --now ecotoken-actualizar.timer
   ```
7. **Backup diario** (cron del usuario): `0 3 * * * ~/Proyectos/ECOToken/infra/deploy/homelab/backup.sh`
8. **Vercel**: en el proyecto, variable `VITE_API_URL=/api` (Production y Preview) y volver a
   desplegar. El `rewrite` ya está en `frontend/vercel.json`.

## Operación

```bash
docker compose -f docker-compose.yml --env-file .env logs -f backend   # logs
./actualizar.sh --forzar                                                # redeploy a mano
systemctl list-timers ecotoken-actualizar.timer                         # próximo chequeo
```

- **Rate limit**: el backend corre detrás de Vercel → Cloudflare → cloudflared, por eso
  `TRUST_PROXY=2`; sin eso todos los usuarios compartirían el límite de 5 logins/min.
  Si se cambia la cadena de proxies, ajustar ese número.
- **Certificados y cron del mes**: el cierre mensual corre dentro del backend (cron del día 1,
  hora de Buenos Aires); si el contenedor estuvo caído, reintenta al arrancar.
- **Subidas** (documentos de verificación) viven en el volumen `uploads_data`.
