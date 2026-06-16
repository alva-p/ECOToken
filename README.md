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

```bash
# 1) Variables de entorno
cp .env.example .env            # completar valores

# 2) Levantar infraestructura (PostgreSQL)
docker compose up -d

# 3) Hidratar cada paquete (ver doc/ESTRUCTURA-PROYECTO.md §9)
cd contracts && forge install && npm install
cd ../backend && npm install && npx prisma migrate dev
cd ../frontend && npm install && npm run dev
```

## Estrategia de ramas

- `main` — rama estable (solo cambios validados / aptos para entrega).
- `develop` — rama de integración.
- `feature/*` — nuevas funcionalidades.
- `fix/*` — correcciones.
- `release/*` — preparación de entregas.

Flujo: rama desde `develop` → commits descriptivos ([Conventional Commits](doc/ESTRUCTURA-PROYECTO.md)) → Pull Request a `develop` → **revisión por otro integrante** antes de integrar.

## Equipo ClusterPA

Alves Rodrigo · Martínez Mateo · Rojas Pessuto Tobías · Pineda Álvaro (director del proyecto).
