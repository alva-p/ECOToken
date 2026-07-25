# ECOToken — Plataforma de incentivos al reciclaje empresarial

Proyecto Final 2026 · UTN FRVM · Ingeniería en Sistemas de Información · Equipo **ClusterPA**.

ECOToken registra, mide y visibiliza el reciclaje de empresas adheridas mediante puntos **ECO** (token ERC-20 sin valor monetario), ranking mensual, certificados ambientales verificables y una capa de trazabilidad **blockchain** sobre **Sepolia** testnet. Modelo **custodial**: el backend administra las claves y absorbe el gas; empresas y cooperativas no manejan wallet.

> Documentación técnica completa: [`doc/ESTRUCTURA-PROYECTO.md`](doc/ESTRUCTURA-PROYECTO.md).

## Estado del proyecto

Etapa **Sprint 0**: definición de la estructura del monorepo, estrategia de ramas, acuerdos de trabajo y preparación técnica mínima para iniciar el desarrollo.

## Estructura del monorepo

```
ECOToken/
├── contracts/   # Smart contracts en Solidity (Foundry + Hardhat)
├── backend/     # API NestJS + Prisma + PostgreSQL + integración on-chain
├── frontend/    # SPA React + Vite + Tailwind (paneles por actor)
├── infra/       # Docker y scripts de despliegue
├── doc/         # Documentación del proyecto
└── .github/     # Workflows de CI (GitHub Actions)
```

## Arranque rápido (desarrollo)

Requisitos previos:
- Docker Desktop + Docker Compose instalados.
- Puertos 3000, 5173 y 5432 libres en tu máquina.

```bash
# 1) Variables de entorno opcionales (solo si querés personalizar valores)
cp .env.example .env

# 2) Levantar la infraestructura completa con un solo comando
docker compose up -d
```

Esto levanta:
- PostgreSQL en `localhost:5432`
- Backend NestJS en `http://localhost:3000`
- Frontend Vite en `http://localhost:5173`

Si necesitás ver logs:

```bash
docker compose logs -f backend frontend postgres
```

Para detener todo:

```bash
docker compose down
```

> Si querés trabajar solo con la base de datos desde el host, podés seguir usando `docker compose up -d postgres`.

## Estrategia de ramas

- `main` — rama estable (solo cambios validados / aptos para entrega).
- `develop` — rama de integración.
- `feature/*` — nuevas funcionalidades.
- `fix/*` — correcciones.
- `release/*` — preparación de entregas.

Flujo: rama desde `develop` → commits descriptivos ([Conventional Commits](doc/ESTRUCTURA-PROYECTO.md)) → Pull Request a `develop` → **revisión por otro integrante** antes de integrar.

## Equipo ClusterPA

Alves Rodrigo · Martínez Mateo · Rojas Pessuto Tobías · Pineda Álvaro (director del proyecto).
