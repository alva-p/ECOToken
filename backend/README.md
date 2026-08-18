# ECOToken — Backend

API NestJS 11 + **Prisma** + **PostgreSQL**. Integra la capa on-chain (modelo **custodial**): firma transacciones (mint/burn) y escucha eventos del contrato para sincronizar el estado off-chain.

## Estructura

```
backend/
├── prisma/                # schema.prisma, migrations/, seed.ts
└── src/
    ├── prisma/            # PrismaModule + PrismaService
    ├── config/            # configuración tipada + validación de env
    ├── common/            # decorators, filters, interceptors, pipes, helpers
    ├── auth/              # JWT + guards + roles (RBAC)
    ├── blockchain/        # ethers/viem: mint/burn, events.listener, wallet.service
    ├── empresas/  cooperativas/  ingresos/  tokens/  certificados/  ranking/  reportes/
    └── ejemplo/           # PLANTILLA de módulo (copiar por cada entidad nueva)
```

Patrón por módulo: `Controller → Service → Repository (PrismaService) → DTOs validados`.
Detalle en [`../doc/ESTRUCTURA-PROYECTO.md`](../doc/ESTRUCTURA-PROYECTO.md) §4.

## Puesta en marcha

```bash
npm install
cp .env.example .env                 # completar DATABASE_URL, JWT_SECRET, etc.
npx prisma migrate dev               # crea/actualiza el esquema
npx prisma db seed                   # datos iniciales (roles, tabla de conversión)
npm run start:dev                    # http://localhost:3000
```

## Generar un módulo de dominio nuevo

```bash
nest g resource <nombre>             # controller/service/module/dto
# luego reorganizar repository/ y dto/ como en la plantilla src/ejemplo/
```

## Respaldo de billeteras custodiales

La alta de empresa genera una billetera EVM custodial y guarda la clave privada cifrada con AES-256-GCM usando `WALLET_ENCRYPTION_KEY`.

Procedimiento mínimo de respaldo:

1. Respaldar la base de datos PostgreSQL con una copia consistente del entorno de desarrollo o del ambiente de despliegue.
2. Resguardar `WALLET_ENCRYPTION_KEY` por separado del backup de la base; sin esa clave no es posible recuperar las claves privadas cifradas.
3. Para restaurar una empresa, reconstruir la base y descifrar la clave privada desde el backend con la misma clave maestra.

Nunca registrar claves privadas en texto plano, logs, tickets ni PRs.
