# ECOToken — Estructura de Proyecto y Estándares de Desarrollo

> **ECOToken** — Plataforma de incentivos al reciclaje empresarial.
> Proyecto Full-Stack **Web3** · Smart Contracts (Foundry + Hardhat) · Backend NestJS + PostgreSQL (Prisma) · Frontend React/Vite.
>
> Documento de referencia técnica para el armado del repositorio. Define la estructura de carpetas, la responsabilidad de cada capa, las convenciones y los pasos de arranque, alineado a los documentos de gestión validados (Propuesta y Alcance v2.0, Project Charter v2.0).

---

## 0. Contexto del proyecto

| Dato | Detalle |
|------|---------|
| **Institución** | UTN — Facultad Regional Villa María · Ingeniería en Sistemas de Información · Proyecto Final 2026 |
| **Equipo** | ClusterPA |
| **Integrantes** | Alves Rodrigo · Martínez Mateo · Rojas Pessuto Tobías · Pineda Álvaro |
| **Director del proyecto** | Álvaro Pineda |
| **Tipo** | Emprendimiento tecnológico de impacto social y ambiental (B2B / B2G) |
| **Alcance geográfico** | Piloto en Villa María, Córdoba, Argentina |
| **Red blockchain** | **Sepolia** (testnet — sin costos reales de gas) |

### Modelo de negocio (resumen)
ECOToken registra la entrega de materiales reciclables por parte de **empresas adheridas**, validada operativamente por **cooperativas de reciclaje**, y reconoce el esfuerzo ambiental mediante un **ranking mensual público** y un **certificado digital verificable**. La **municipalidad** respalda institucionalmente el reconocimiento. El token **ECO** es un ERC-20 **sin valor monetario**, que representa reputación ambiental verificable y trazable on-chain.

### Actores del sistema
- **Empresa adherida** — usuario primario. Recicla, acumula tokens, recibe certificados, aparece en el ranking.
- **Cooperativa validadora** — registra/pesa el material entregado (`VALIDATOR_ROLE`).
- **Municipalidad** — autoridad institucional, consume reportes consolidados.
- **Operador / Administrador del sistema** — backend y equipo (gestión de roles, gas, upgrades).

### Característica arquitectónica clave: **custodial**
> El sistema **administra las claves privadas** de las empresas (direcciones EVM custodiales) y **absorbe la totalidad del gas** mediante cuentas operadoras (RN-25 a RN-28).
> **Implicancia técnica:** las empresas y cooperativas **no conectan wallet ni manejan ETH**. Toda la interacción on-chain (mint, burn, registro de eventos) ocurre en el **backend** vía ethers/viem. El frontend consume **API REST + WebSocket**; no necesita wagmi ni conexión de wallet del usuario.

---

## 1. Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Contracts** | Solidity · **Foundry** (forge/cast/anvil) + **Hardhat** (deploy/verify TS) · **OpenZeppelin** (AccessControl, ERC20Capped, ERC20Burnable, Pausable, UUPS) |
| **Backend** | NestJS 11 · **Prisma ORM** · **PostgreSQL** · JWT (passport-jwt) · class-validator · bcrypt · **ethers.js / viem** (firma y escucha de eventos on-chain) · WebSocket (tiempo real) |
| **Frontend** | React 18 · Vite + SWC · TypeScript · TailwindCSS · Radix UI (shadcn) · cliente REST + WebSocket *(sin wallet: modelo custodial)* |
| **Infra / Deploy** | Docker · docker-compose · **Vercel** (frontend) · **Render** (backend) · PostgreSQL gestionado / VPS · Sepolia |
| **Gestión** | Scrum adaptado (sprints de 3 semanas) · **Notion** (backlog) · **GitHub** (código) · **Google Drive/Docs** (documentación) · **StarUML** (modelado) · **Postman** (testing API) |

**Patrón por módulo del backend:** `Controller → Service → Repository → Prisma (schema) + DTOs validados`

---

## 2. Árbol raíz del repositorio (monorepo)

```
ECOToken/
├── .gitignore
├── .env.example                 # variables globales de ejemplo (compose)
├── README.md                    # visión general + cómo arrancar todo
├── CHANGELOG.md                 # historial de cambios (Keep a Changelog)
├── docker-compose.yml           # orquesta: postgres + backend + frontend + (anvil opcional)
│
├── contracts/                   # 🔗 Smart contracts (Foundry + Hardhat)
├── backend/                     # 🧠 API NestJS + PostgreSQL (Prisma) + integración on-chain
├── frontend/                    # 🎨 SPA React + Vite (paneles empresa / cooperativa / admin)
│
├── infra/                       # 🐳 Infraestructura y despliegue
│   ├── docker/                  # Dockerfiles por servicio
│   └── deploy/                  # scripts/manifiestos de deploy
│
├── doc/                         # 📄 documentación (este archivo + Documentos Validados)
│
└── .github/
    └── workflows/               # CI: lint + test de contracts/backend/frontend
```

---

## 3. Contracts (Foundry + Hardhat híbrido)

Se usa el plugin `@nomicfoundation/hardhat-foundry` para que ambos compartan la misma carpeta `src/`. Foundry corre tests rápidos en Solidity (incl. fuzzing); Hardhat maneja despliegue y verificación en TypeScript sobre Sepolia.

```
contracts/
├── foundry.toml                 # config Foundry (src, out, libs, remappings)
├── hardhat.config.ts            # config Hardhat (red Sepolia, plugin foundry, etherscan)
├── remappings.txt               # alias de imports (OZ, forge-std)
├── package.json                 # deps Hardhat + scripts npm
├── .env.example                 # SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY, ETHERSCAN_API_KEY
├── README.md
│
├── lib/                         # deps Foundry (submodules: forge-std, openzeppelin-contracts-upgradeable)
│
├── src/                         # 📜 contratos Solidity (fuente única)
│   ├── ECOToken.sol             # ERC-20 ECO: AccessControl + Capped + Burnable + Pausable + UUPS
│   └── interfaces/
│       └── IECOToken.sol
│
├── test/                        # 🧪 tests Foundry (Solidity)
│   ├── ECOToken.t.sol           # unitarios + roles + pausa
│   └── ECOToken.fuzz.t.sol      # fuzzing de mint/burn/conversión
│
├── script/                      # 🚀 scripts Foundry (Solidity)
│   ├── DeployECOToken.s.sol     # deploy del proxy UUPS + asignación de roles
│   └── GrantRoles.s.sol
│
├── scripts/                     # 🚀 scripts Hardhat (TypeScript)
│   ├── deploy.ts                # deploy + verify en Sepolia
│   └── upgrade.ts               # upgrade UUPS de la lógica
│
└── deployments/                 # direcciones + ABIs por red (output, versionar)
    └── sepolia.json             # → consumido por backend y frontend
```

### Diseño del contrato `ECOToken.sol` (según reglas de negocio)

| Aspecto | Definición (RN) |
|---------|-----------------|
| **Estándar** | ERC-20 (token ECO, sin valor monetario) — RN-10 |
| **Patrón upgrade** | Proxy **UUPS (EIP-1822)** con OpenZeppelin upgradeable — RN-29 |
| **Roles** | `VALIDATOR_ROLE`, `MINTER_ROLE`, `BURNER_ROLE`, `ADMIN_ROLE`, `EMERGENCY_ROLE` — RN-17 |
| **Mint** | Solo `MINTER_ROLE`, bajo demanda, a partir de material validado por cooperativa — RN-06, RN-11 |
| **Supply** | `ERC20Capped` con supply cap configurable por `ADMIN_ROLE` — factibilidad técnica |
| **Pausa** | `Pausable`; solo `ADMIN_ROLE`. Sin mint/burn durante pausa — RN-19 |
| **Emergencia** | `emergencyBurn()` exclusivo de `EMERGENCY_ROLE`, **solo con contrato pausado** — RN-28 |
| **Conversión** | Tabla peso (kg) → tokens por tipo de material (plástico, vidrio, cartón), editable solo por `ADMIN_ROLE` — RN-07, RN-08 |
| **Gobernanza** | Asignación/revocación de roles exclusiva de `ADMIN_ROLE` (Vault Address) — RN-18 |
| **Auditoría** | Código abierto y **verificado** en el explorador de bloques — RN-20, RN-24 |
| **Certificado** | Emisión de credencial verificable (NFT no transferible / verifiable credential) registrada on-chain — RN-14 |

**Responsabilidades:**

| Ruta | Rol |
|------|-----|
| `src/*.sol` | Lógica del token, roles y conversión. Hereda de OpenZeppelin upgradeable. |
| `test/*.t.sol` | Tests Foundry (`forge test`): roles, mint/burn, pausa, emergencia, fuzzing. |
| `script/*.s.sol` | Deploy reproducible del proxy UUPS y asignación de roles (`forge script`). |
| `scripts/*.ts` | Deploy/verify/upgrade con Hardhat sobre Sepolia. |
| `deployments/sepolia.json` | Dirección del proxy + ABI → consumido por backend (`abis/`) y frontend (links de verificación). |

---

## 4. Backend (NestJS + PostgreSQL + Prisma)

Arquitectura modular por dominio (empresas, cooperativas, ingresos de material, tokens, certificados, ranking, reportes), con un módulo `blockchain` que **firma transacciones** (mint/burn) y **escucha eventos on-chain** para sincronizar el estado off-chain en PostgreSQL.

```
backend/
├── .env                         # variables reales (NO se sube)
├── .env.example                 # DATABASE_URL, JWT_SECRET, SEPOLIA_RPC_URL, contract address, claves operadoras (cifradas)
├── .gitignore · .prettierrc · eslint.config.mjs · nest-cli.json
├── tsconfig.json · tsconfig.build.json · package.json · README.md
│
├── prisma/                      # 🗄️ capa de datos (reemplaza a Mongoose)
│   ├── schema.prisma            # modelos: Empresa, Cooperativa, IngresoMaterial, MovimientoToken, Certificado, Ranking, Usuario, Rol...
│   ├── migrations/              # migraciones versionadas (se versiona en git)
│   └── seed.ts                  # datos iniciales (roles, tabla de conversión, usuarios) — idempotente
│
├── test/
│   └── jest-e2e.json
│
└── src/
    ├── main.ts                  # bootstrap: CORS + ValidationPipe global
    ├── app.module.ts            # registra módulos globales
    ├── app.controller.ts · app.service.ts
    │
    ├── prisma/                  # PrismaModule + PrismaService (cliente inyectable)
    │   ├── prisma.module.ts
    │   └── prisma.service.ts
    │
    ├── config/                  # @nestjs/config tipado + validación de env (zod/Joi)
    │   └── configuration.ts
    │
    ├── health/
    │   └── health.controller.ts # GET /health (estado DB + nodo RPC)
    │
    ├── common/                  # transversal
    │   ├── decorators/ · filters/ · interceptors/ · pipes/ · helpers/
    │
    ├── auth/                    # autenticación JWT + RBAC
    │   ├── auth.module.ts · auth.controller.ts · auth.service.ts
    │   ├── decorators/  (current-user, roles)
    │   ├── dto/         (login.dto.ts)
    │   ├── guards/      (jwt-auth.guard, roles.guard)
    │   └── strategies/  (jwt.strategy)
    │
    ├── blockchain/             # 🔗 integración on-chain (núcleo Web3 del custodial)
    │   ├── blockchain.module.ts
    │   ├── blockchain.service.ts   # provider, contrato ECOToken, mint/burn firmados
    │   ├── events.listener.ts      # escucha eventos on-chain → sincroniza PostgreSQL
    │   ├── wallet.service.ts        # gestión segura de claves custodiales/operadoras (cifrado)
    │   └── abis/                    # ABIs copiadas de contracts/deployments
    │
    │   # ─── Módulos de dominio (cada uno sigue el patrón de §4.1) ───
    ├── empresas/               # registro y perfil de empresas adheridas (CUIT, repr. legal, dir. custodial)
    ├── cooperativas/           # alta de cooperativas validadoras y su VALIDATOR_ROLE
    ├── ingresos/               # registro de material entregado (empresa, tipo, peso, fecha) → dispara mint
    ├── tokens/                 # saldos y movimientos de tokens por empresa
    ├── certificados/           # emisión y consulta de certificados mensuales verificables
    ├── ranking/                # cálculo y cierre del ranking mensual (snapshot auditable)
    ├── reportes/               # reportes consolidados (empresa / cooperativa / municipio)
    │
    └── ejemplo/                # 👈 PLANTILLA de módulo a copiar por cada entidad nueva
        ├── ejemplo.module.ts
        ├── ejemplo.controller.ts          # rutas HTTP, solo delega
        ├── ejemplo.service.ts             # lógica de negocio + validaciones
        ├── dto/
        │   ├── create-ejemplo.dto.ts      # validación class-validator
        │   └── update-ejemplo.dto.ts      # extends PartialType(CreateDto)
        └── repository/
            ├── ejemplo.repository.ts       # acceso a datos vía PrismaService
            └── ejemplo.repository.spec.ts  # tests del repositorio
```

> **Cambios respecto a la plantilla original (Mongoose):**
> - Modelos definidos **una sola vez** en `prisma/schema.prisma` (no `*.schema.ts` por entidad).
> - El repositorio inyecta `PrismaService` en vez del `Model` de Mongoose.
> - Seed reproducible en `prisma/seed.ts` (`prisma db seed`), no `onModuleInit`.
> - Carpetas de DTO/repository **aplanadas** (sin el anidamiento redundante de la plantilla original).
> - Agregado el módulo **`blockchain/`** con `events.listener.ts` (sync off-chain) y `wallet.service.ts` (claves custodiales).

### 4.1. Responsabilidad de cada capa del módulo

| Archivo | Rol |
|---------|-----|
| `*.controller.ts` | Rutas HTTP (`@Controller`, `@Get/@Post/@Patch/@Delete`). Solo delega al service. |
| `*.service.ts` | Lógica de negocio + validaciones (`NotFoundException`, `ConflictException`). Orquesta `blockchain.service` cuando corresponde (ej.: `ingresos` → mint). |
| `repository/*.repository.ts` | Acceso a datos con `PrismaService` (`create/findMany/findUnique/update/delete`). |
| `prisma/schema.prisma` | Definición de modelos/entidades y relaciones (fuente de verdad del esquema). |
| `dto/create-*.dto.ts` | Validación de entrada con class-validator (`@IsString`, `@IsEmail`, `@IsNumber`...). |
| `dto/update-*.dto.ts` | `extends PartialType(CreateDto)` — campos opcionales. |
| `*.module.ts` | Une controller + service + repository e importa `PrismaModule` (y `BlockchainModule` si lo usa). |

### 4.2. Flujo principal (registro de material → mint)
1. La **cooperativa** registra un ingreso de material (`POST /ingresos`) con empresa, tipo y peso.
2. `ingresos.service` valida y persiste el registro en PostgreSQL.
3. Llama a `blockchain.service.mint()` que calcula tokens según la **tabla de conversión** y firma la tx con la cuenta `MINTER`.
4. El contrato emite un evento; `events.listener` lo captura y **confirma/sincroniza** el `MovimientoToken` y el saldo de la empresa.
5. Se genera el **comprobante digital** (RN-09) y se actualiza el ranking del mes.

---

## 5. Frontend (React + Vite) — paneles por actor

> **Sin conexión de wallet** (modelo custodial): el frontend consume la API REST y recibe actualizaciones por WebSocket. Solo usa el explorador de bloques (links) para que el usuario **verifique** transacciones y certificados.

```
frontend/
├── .gitignore
├── .env.example                 # VITE_API_URL, VITE_WS_URL, VITE_EXPLORER_URL, VITE_CONTRACT_ADDRESS
├── index.html
├── vite.config.ts               # alias '@' -> ./src, proxy /api, port 5173
├── tsconfig.json · package.json · README.md
│
├── public/                      # assets estáticos
│
└── src/
    ├── main.tsx                 # createRoot + providers
    ├── App.tsx                  # layout raíz + montaje del router
    ├── index.css
    ├── styles/globals.css       # Tailwind + tokens de diseño
    ├── types/index.ts           # tipos compartidos (UserRole, Empresa, Certificado...)
    │
    ├── lib/                     # infraestructura transversal
    │   ├── api.ts               # fetch wrapper + token JWT en localStorage
    │   ├── ws.ts                # cliente WebSocket (ranking/saldos en tiempo real)
    │   └── explorer.ts          # helpers para armar links a Sepolia Etherscan
    │
    ├── providers/              # agrupa los context providers (Auth + Query + Router)
    │   └── AuthContext.tsx      # estado global de sesión (useAuth)
    │
    ├── routes/                 # routing + control de acceso (RBAC)
    │   ├── index.tsx            # definición de rutas
    │   └── ProtectedRoute.tsx   # guard por rol (empresa/cooperativa/admin/municipio)
    │
    ├── layouts/                # shells con nav/sidebar por rol
    │   ├── EmpresaLayout.tsx
    │   ├── CooperativaLayout.tsx
    │   └── AdminLayout.tsx
    │
    ├── features/               # 👈 feature-first: cada actor colocaliza TODO lo suyo
    │   ├── auth/                # login, recuperación de acceso
    │   ├── empresa/
    │   │   ├── pages/           # Dashboard, Ranking, Certificados, Reportes
    │   │   ├── components/      # piezas propias del panel empresa
    │   │   ├── hooks/           # useSaldo, useCertificados...
    │   │   └── api.ts           # llamadas REST del dominio empresa
    │   ├── cooperativa/         # pages/components/hooks → registro de ingresos de material
    │   ├── admin/               # roles, tabla de conversión, métricas
    │   └── municipio/           # reportes consolidados (solo lectura)
    │
    ├── components/
    │   └── ui/                  # primitivos compartidos (button, card, dialog, table...)
    │
    └── utils/                   # helpers, translations.ts...
```

> **Criterio de organización (feature-first):** cada actor agrupa sus `pages/`, `components/`, `hooks/` y `api.ts` bajo `features/<rol>/`, lo que calza con la estrategia de ramas `feature/*` del documento validado y evita que los integrantes se pisen. En `components/ui/` queda únicamente lo verdaderamente transversal; el RBAC del backend se refleja en el frontend con `routes/ProtectedRoute.tsx`.

---

## 6. Infra y despliegue

```
infra/
├── docker/
│   ├── backend.Dockerfile       # build multi-stage NestJS
│   ├── frontend.Dockerfile      # build Vite + nginx
│   └── nginx.conf
└── deploy/
    └── deploy.sh                # despliegue (referencia)
```

| Servicio | Plataforma (piloto) |
|----------|---------------------|
| Frontend | **Vercel** (capa gratuita) |
| Backend | **Render** (capa gratuita) |
| Base de datos | PostgreSQL gestionado / VPS de bajo costo |
| Blockchain | **Sepolia** testnet (gas vía faucets, sin costo real) |

El `docker-compose.yml` raíz (desarrollo) levanta: **postgres** (volumen persistente), **backend**, **frontend** y, opcionalmente, **anvil** (nodo local Foundry).

---

## 7. `.gitignore` base

```gitignore
# dependencias y builds
/node_modules
/dist
/build
/out                  # artefactos Foundry
/cache                # cache Hardhat/Foundry
/coverage
/.nyc_output

# entornos (secretos)
.env
.env.local
.env.*.local

# overrides locales de compose (la definición base SÍ se versiona)
docker-compose.override.yml

# editor / SO
.DS_Store
.vscode/*
!.vscode/settings.json
.temp · .tmp · *.log

# blockchain (artefactos generados)
contracts/lib/
contracts/artifacts/
contracts/typechain-types/
```

> ⚠️ `backend/prisma/migrations/` **SÍ se versiona**. Lo que se ignora es el `.env` con `DATABASE_URL` y, sobre todo, **las claves privadas operadoras** — nunca deben llegar al repo.
>
> ✅ **`docker-compose.yml` SÍ se versiona** (no va al `.gitignore`): es infraestructura compartida que garantiza que cualquier integrante levante el sistema igual (`docker compose up`). No debe contener secretos: los valores sensibles se inyectan desde el `.env` (ignorado) con `${VARIABLE}`. Los ajustes propios de cada dev van en `docker-compose.override.yml`, que **sí se ignora**.

---

## 8. Convenciones y buenas prácticas

> **Validado contra** `03 Ciclo de Vida y Enfoque de desarrollo v1.1` (Equipo ClusterPA). Las prácticas de esta sección reproducen las decisiones formales del documento. Las extensiones técnicas propuestas por el equipo de desarrollo (aún no incluidas en los documentos validados) se listan aparte en §8.2.

### 8.1. Convenciones validadas (Ciclo de Vida v1.1)

- **Metodología:** Scrum adaptado al contexto académico. **Sprints de duración fija de 3 semanas**; sincronización tipo Daily Scrum **3 veces por semana** (máx. 15 min). Se ejecuta un **Sprint 0** de preparación técnica/organizativa antes del Sprint 1.
- **Convención de commits:** mensajes descriptivos por tipo de cambio:
  `feat:` · `fix:` · `docs:` · `test:` · `refactor:` · `chore:`.
- **Estrategia de ramas (Git Flow adaptado):**
  - `main` — versión estable; solo cambios validados y aptos para entrega/demostración. No se trabaja directo sobre `main`.
  - `develop` — rama de integración; refleja el avance más reciente del sprint.
  - `feature/*` — una rama por historia/módulo (ej.: `feature/registro-organizacion`, `feature/dashboard-ranking`, `feature/certificado-mensual`, `feature/smart-contract-points`).
  - `fix/*` — corrección de errores (ej.: `fix/error-calculo-puntos`, `fix/test-contrato-mint`).
  - `release/*` — estabilización previa a una entrega formal (ej.: `release/v1.0.0-mvp`).
  - **Flujo:** rama desde `develop` → commits descriptivos → pruebas → **Pull Request a `develop`** → **revisión obligatoria por otro integrante** (sin conflictos + criterios de aceptación cumplidos) antes de integrar.
- **Gestión de versiones:** **versionado semántico** `vMAJOR.MINOR.PATCH` (MAJOR = cambios estructurales/incompatibles · MINOR = nuevas funcionalidades · PATCH = correcciones menores). Cada versión relevante se marca con **tags en GitHub** asociados a entregables (prototipos, MVP, entregas de cátedra). Ej.: `v0.1.0 → v0.2.0 → v1.0.0 (MVP) → v1.0.1`.
- **Versionado documental:** `V1.0` (versión inicial aprobada) · `V1.1` (ajustes menores) · `V2.0` (cambios estructurales). Cada documento lleva historial, versión, fecha y responsable.
- **Gestión de configuración:** **GitHub** controla código, ramas, commits, PR y versiones técnicas. **Google Drive/Docs** controla la documentación formal con historial de revisiones.
- **Gestión de cambios (a nivel backlog, en Notion):** Identificación → Registro → Evaluación de impacto (funcional/técnico/documental/cronograma) → Decisión (acepta/rechaza/posterga/divide) → Priorización → Implementación → Evidencia. Los cambios no se incorporan al sprint en curso salvo que sean críticos o desbloqueen trabajo comprometido.
- **Historias de usuario:** ID `E{épica}-HU{historia}`, formato “Como [rol], quiero [necesidad], para [beneficio]”, prioridad, **estimación en puntos de historia (Fibonacci: 1,2,3,5,8,13,21)**. Una historia de **≥13 puntos se divide** antes de entrar al Sprint Backlog. Se estima por consenso en Sprint Planning/refinamiento.
- **Definition of Done + métricas:** una historia se considera terminada según la DoD acordada y aceptada en Sprint Review. Métrica principal: **velocidad del sprint** (puntos completados y aceptados); complementarias: velocidad promedio, cumplimiento del Sprint Goal, burndown, comprometidas vs. completadas, defectos detectados/corregidos, impedimentos, horas por integrante.
- **Herramientas y stack (gestión de configuración):**

  | Categoría | Herramienta |
  |-----------|-------------|
  | Backlog / tareas | Notion |
  | Repositorio de código | GitHub |
  | Documentación | Google Drive / Google Docs |
  | Modelado (UML/DER/BPMN) | StarUML |
  | Testing de API | Postman |
  | Testing de smart contracts | Foundry |
  | Blockchain | Sepolia testnet |
  | Smart contracts | Solidity + Foundry |
  | Backend | NestJS + PostgreSQL |
  | Frontend | React + Vite + TailwindCSS |
  | Diseño UI/UX | *No definido inicialmente* (a resolver según necesidad del sprint) |

### 8.2. Extensiones técnicas propuestas (no incluidas aún en los documentos validados)

> Recomendaciones del equipo de desarrollo para reforzar calidad. Conviene incorporarlas formalmente al documento de Ciclo de Vida en una próxima versión antes de tratarlas como obligatorias.

- **Linting/formato:** ESLint + Prettier (backend/frontend); `forge fmt` + `solhint` (contracts).
- **Pre-commit hooks:** husky + lint-staged (formatear y lintear lo staged).
- **CI (`.github/workflows/`):** en cada PR correr `forge test`, `npm test` (backend) y `npm run build` (frontend) como verificación automática complementaria a la revisión por pares.
- **Tests automatizados:** repositorios con Jest en backend; `forge test` con fuzzing en contracts (cobertura de roles, pausa y emergencia).
- **Validación de variables de entorno:** validar al boot (zod/Joi en NestJS) para fallar rápido.
- **Seguridad de claves (crítico — modelo custodial):** claves operadoras y custodiales cifradas, nunca commiteadas; separación de ambientes; rotación de claves; `ADMIN_ROLE` en el Vault Address.
- **ABIs como contrato de integración:** al desplegar, copiar ABI + dirección desde `contracts/deployments/sepolia.json` hacia `backend/src/blockchain/abis/` y `frontend/src/lib/`.

---

## 9. Pasos para arrancar el proyecto

```bash
mkdir ECOToken && cd ECOToken

# 1) Contracts (Foundry + Hardhat)
mkdir contracts && cd contracts
forge init --no-commit .
npm init -y && npm i -D hardhat @nomicfoundation/hardhat-foundry @openzeppelin/contracts-upgradeable
npx hardhat init
forge install OpenZeppelin/openzeppelin-contracts-upgradeable
cd ..

# 2) Backend (NestJS + Prisma + PostgreSQL)
nest new backend
cd backend
npm i @prisma/client ethers && npm i -D prisma
npx prisma init --datasource-provider postgresql
# crear: prisma/ (service), config/, common/, auth/, blockchain/
# generar dominios: nest g resource empresas cooperativas ingresos tokens certificados ranking reportes
#   → reorganizar repository/dto como la tabla §4.1
cd ..

# 3) Frontend (React + Vite)
npm create vite@latest frontend -- --template react-swc-ts
cd frontend
npm i @tanstack/react-query
# crear services/ (api.ts, ws.ts), contexts/, hooks/, lib/, types/, components/{empresa,cooperativa,admin,municipio,ui}
cd ..

# 4) Infra y raíz: docker-compose.yml, .env.example, .gitignore, README.md, infra/{docker,deploy}

# Por cada entidad nueva del backend: copiar src/ejemplo/ y renombrar.
```

---

## 10. Checklist de cumplimiento de estándares

- [x] Separación de capas Controller → Service → Repository → Datos
- [x] DTOs validados (`class-validator`) + `update extends PartialType`
- [x] Carpetas DTO/repository **aplanadas** (sin anidamiento redundante)
- [x] Base de datos unificada en **PostgreSQL/Prisma** (sin conflicto Mongoose)
- [x] Capa **contracts** (Foundry + Hardhat) con ERC-20 UUPS + roles del modelo
- [x] Módulo **blockchain** con escucha de eventos y **gestión custodial** de claves
- [x] Frontend alineado al modelo **custodial** (REST + WebSocket, sin wallet de usuario)
- [x] Módulos de dominio reales: empresas, cooperativas, ingresos, tokens, certificados, ranking, reportes
- [x] `infra/` con Docker y deploy (Vercel / Render / Sepolia)
- [x] Config tipada + validación de variables de entorno
- [x] Filters/Interceptors/Pipes en `common/`
- [x] CI, CHANGELOG y pre-commit hooks contemplados
- [x] `.env` y **claves privadas** fuera de git + `.env.example` mantenido

---

### Trazabilidad documental
Este documento técnico deriva de los entregables de gestión validados del Equipo ClusterPA:
`01 Propuesta y Alcance v2.0`, `02 Project Charter v2.0`, `03 Ciclo de Vida y Enfoque de desarrollo v1.1`, `04 Interesados y Comunicaciones v1.1`, `05 Alcance del proyecto v1.0` (ver `doc/Documentos Validados/`).
```
