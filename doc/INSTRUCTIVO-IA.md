# Instructivo de uso de IA / Chatbots — Equipo ClusterPA (ECOToken)

> **Propósito.** Este documento es el **estándar único de trabajo asistido por IA** para todo el equipo. Cualquier integrante que use una inteligencia artificial o chatbot (Claude, ChatGPT, Copilot, Gemini, etc.) para desarrollar ECOToken debe **pegar o referenciar las reglas de este documento al inicio de su sesión**, de modo que todos generemos código, commits y documentación con el **mismo formato**.
>
> **Cómo usarlo (rápido):** copiá el bloque [§9 — Prompt base para pegar a la IA](#9-prompt-base-para-pegar-a-la-ia) al iniciar cualquier chat. Ese bloque resume las reglas obligatorias de este instructivo.
>
> **Trazabilidad.** Deriva de `03 Ciclo de Vida y Enfoque de desarrollo v1.1`, `04 Interesados y Comunicaciones v1.1` y de `doc/ESTRUCTURA-PROYECTO.md`. Si esos documentos cambian, este se actualiza.

| Dato | Valor |
|------|-------|
| **Proyecto** | ECOToken — plataforma de incentivos al reciclaje empresarial (Web3, modelo B2B/B2G) |
| **Equipo** | ClusterPA (Alves Rodrigo · Martínez Mateo · Rojas Pessuto Tobías · Pineda Álvaro) |
| **Repositorio** | Monorepo en GitHub: `contracts/` · `backend/` · `frontend/` · `infra/` · `doc/` |
| **Versión del instructivo** | v1.0 — 2026-06-16 |
| **Estado** | Vivo (se modifica a medida que avanza el proyecto) |

---

## Índice
1. [Reglas de oro (lo que la IA SIEMPRE debe respetar)](#1-reglas-de-oro)
2. [Validaciones obligatorias antes de aceptar código de la IA](#2-validaciones)
3. [Formato y estándar de trabajo](#3-formato-y-estándar-de-trabajo)
4. [Paso a paso: hacer un COMMIT](#4-paso-a-paso-commit)
5. [Paso a paso: hacer un PUSH](#5-paso-a-paso-push)
6. [Paso a paso: ELIMINAR un archivo](#6-paso-a-paso-eliminar-un-archivo)
7. [Qué NUNCA debe hacer la IA](#7-qué-nunca-debe-hacer-la-ia)
8. [Seguridad — modelo custodial](#8-seguridad--modelo-custodial)
9. [Prompt base para pegar a la IA](#9-prompt-base-para-pegar-a-la-ia)
10. [Checklist final antes de pedir revisión (PR)](#10-checklist-final)

---

## 1. Reglas de oro

Estas reglas aplican a **toda** sesión con una IA. Si la IA propone algo que las viola, **no se acepta**.

1. **El humano decide, la IA asiste.** Ningún código generado por IA se integra sin que un integrante lo entienda, lo pruebe y pueda explicarlo. No copiar y pegar a ciegas.
2. **Respetar la estructura del monorepo.** La IA debe ubicar cada archivo donde corresponde (`contracts/`, `backend/`, `frontend/`, `infra/`, `doc/`) según `doc/ESTRUCTURA-PROYECTO.md`. No crear carpetas nuevas fuera de ese estándar sin acordarlo con el equipo.
3. **No tocar `main` ni `develop` directamente.** Todo trabajo va en una rama `feature/*` o `fix/*` y se integra por Pull Request con **revisión obligatoria de otro integrante**.
4. **Nunca exponer secretos.** Claves privadas, `.env`, `DATABASE_URL`, claves operadoras/custodiales **jamás** se pegan en el chat ni se commitean. (Ver [§8](#8-seguridad--modelo-custodial)).
5. **Idioma:** código y commits en español o inglés según ya esté el módulo; **comentarios, documentación y mensajes de commit en español**. Mantener coherencia con el código existente.
6. **Cambios pequeños y atómicos.** Pedir a la IA cambios acotados (una historia / una tarea), no reescrituras masivas de archivos que funcionan.
7. **Ante la duda, preguntar al equipo**, no improvisar. Cambios de alcance se gestionan como [cambio de backlog](#gestión-de-cambios) en Notion.

---

## 2. Validaciones

> Antes de aceptar **cualquier** código que genere la IA, se valida lo siguiente. La IA puede ayudar a ejecutar estas validaciones, pero la responsabilidad es del integrante.

### 2.1. Validaciones generales (todo el código)
- [ ] **Compila / corre** sin errores en local.
- [ ] **Linter y formato** pasan: `ESLint + Prettier` (backend/frontend) · `forge fmt` (contracts).
- [ ] **No hay secretos** ni datos reales hardcodeados (claves, tokens, URLs privadas, CUIT reales).
- [ ] El código **respeta el patrón de la capa** donde vive (ver [§3](#3-formato-y-estándar-de-trabajo)).
- [ ] No se rompió funcionalidad existente (correr los tests que ya había).
- [ ] El cambio corresponde a una **historia de usuario** o tarea registrada (`E{épica}-HU{historia}`).

### 2.2. Backend (NestJS + Prisma)
- [ ] Respeta el flujo **`Controller → Service → Repository → Prisma`**. El controller **solo delega**; la lógica va en el service.
- [ ] **DTOs validados** con `class-validator` (`@IsString`, `@IsEmail`, `@IsNumber`, `@IsNotEmpty`...). Los `update` usan `extends PartialType(CreateDto)`.
- [ ] Se usan las excepciones correctas (`NotFoundException`, `ConflictException`, `BadRequestException`, etc.), no `throw new Error()` genérico.
- [ ] Acceso a datos **solo** vía `PrismaService` en el repository (no queries sueltas en el service/controller).
- [ ] Endpoints protegidos por **JWT + RBAC** (`@Roles`, guards) cuando corresponde.
- [ ] Si toca cadena de bloques, pasa por `blockchain.service` (no firma transacciones en otra capa).
- [ ] Variables de entorno nuevas se agregan a `.env.example` (sin el valor real) y se validan al boot.

### 2.3. Frontend (React + Vite)
- [ ] Organización **feature-first**: el código va en `features/<rol>/` (`pages/`, `components/`, `hooks/`, `api.ts`). Solo lo verdaderamente transversal va en `components/ui/`.
- [ ] **Sin conexión de wallet** (modelo custodial): solo REST + WebSocket. La IA **no** debe meter `wagmi`, `web3modal` ni pedir wallet del usuario.
- [ ] Tipado correcto en TypeScript (sin `any` salvo justificación).
- [ ] Llamadas a la API pasan por el wrapper de `lib/api.ts` (token JWT), no `fetch` sueltos por todos lados.
- [ ] Control de acceso por rol con `routes/ProtectedRoute.tsx`.

### 2.4. Contracts (Solidity / Foundry + Hardhat)
- [ ] Hereda de **OpenZeppelin upgradeable** (AccessControl, ERC20Capped, ERC20Burnable, Pausable, UUPS).
- [ ] Respeta los **5 roles**: `VALIDATOR_ROLE`, `MINTER_ROLE`, `BURNER_ROLE`, `ADMIN_ROLE`, `EMERGENCY_ROLE`.
- [ ] **Tests Foundry** pasan: `forge test` (incluido fuzzing de mint/burn/conversión, roles, pausa, emergencia).
- [ ] `forge fmt` aplicado.
- [ ] No introduce funciones que rompan el patrón UUPS ni que permitan mint/burn sin el rol correcto.
- [ ] Si se redeploya, se actualiza `deployments/sepolia.json` y se copian ABIs a `backend/src/blockchain/abis/`.

### 2.5. Documentación
- [ ] Sigue el versionado documental: `V1.0` (inicial), `V1.1` (ajuste menor), `V2.0` (cambio estructural).
- [ ] Incluye historial: versión, fecha, autor, observaciones.

---

## 3. Formato y estándar de trabajo

### 3.1. Estructura por capa (resumen — fuente: `ESTRUCTURA-PROYECTO.md`)

| Capa | Patrón obligatorio |
|------|--------------------|
| **Backend** | `Controller (delega) → Service (lógica + validaciones) → Repository (PrismaService) → schema.prisma`. DTOs con `class-validator`. Un módulo por dominio. Plantilla: `src/ejemplo/`. |
| **Frontend** | Feature-first: `features/<rol>/{pages,components,hooks,api.ts}`. UI transversal en `components/ui/`. REST + WS, sin wallet. |
| **Contracts** | `src/*.sol` (lógica) · `test/*.t.sol` (Foundry) · `script/*.s.sol` (deploy) · `scripts/*.ts` (Hardhat). OZ upgradeable + 5 roles. |
| **Infra** | `infra/docker/` (Dockerfiles) · `infra/deploy/`. `docker-compose.yml` en la raíz, sin secretos (usa `${VARIABLE}`). |

### 3.2. Convenciones de nombres
- **Ramas:** `feature/<descripcion-corta>` o `fix/<descripcion-corta>` en kebab-case. Ej.: `feature/registro-organizacion`, `fix/error-calculo-puntos`.
  > ⚠️ **Nunca** nombrar una rama exactamente `feature` o `fix` (sin slash ni descripción): bloquea el namespace e impide crear cualquier `feature/*` o `fix/*` en el remoto.
- **Commits:** Conventional Commits (ver [§4.2](#42-formato-del-mensaje-de-commit)).
- **Historias de usuario:** `E{épica}-HU{historia}`. Ej.: `E2-HU5`.
- **Variables/funciones:** seguir el estilo del archivo donde se trabaja (camelCase en TS, etc.).

### 3.3. Versionado
- **Código:** semántico `vMAJOR.MINOR.PATCH`. MAJOR = cambios incompatibles · MINOR = nuevas funcionalidades · PATCH = correcciones. Releases relevantes con **tags en GitHub** (`v1.0.0-mvp`, etc.).
- **Documentación:** `V1.0 / V1.1 / V2.0` con historial.

### 3.4. Herramientas oficiales del equipo
| Para... | Usar |
|---------|------|
| Backlog / historias / tareas | **Notion** |
| Código, ramas, PR, versiones | **GitHub** |
| Documentación formal / minutas | **Google Drive / Docs** |
| Modelado (UML, DER, BPMN) | **StarUML** |
| Testing de API | **Postman** |
| Testing de contracts | **Foundry** |
| Coordinación rápida | **WhatsApp** (escala a **Discord**) |
| Temas técnicos / blockchain / infra | **Discord** + **GitHub Issues** |

---

## 4. Paso a paso: COMMIT

> Un commit registra un cambio **terminado y coherente**. La IA puede ayudarte a redactar el mensaje, pero vos validás el contenido.

### 4.1. Antes de commitear
1. **Confirmá en qué rama estás.** Debe ser `feature/*` o `fix/*`, **nunca** `main` ni `develop`.
   ```bash
   git branch          # ¿estoy en la rama correcta?
   git status          # ¿qué archivos cambié?
   git diff            # ¿qué cambió exactamente? Revisá línea por línea
   ```
2. **Pasá las [validaciones de §2](#2-validaciones)** sobre lo que vas a commitear (lint, build, tests).
3. **Revisá que no haya secretos** en el diff (`.env`, claves, tokens). Si aparece un `.env`, **detenete** y revisá el `.gitignore`.
4. **Agrupá cambios relacionados.** Un commit = un propósito. No mezcles "registro de empresas" con "arreglo de CSS del login".
   ```bash
   git add <archivos-especificos>     # preferí esto a 'git add .'
   ```

### 4.2. Formato del mensaje de commit
Conventional Commits, en español, descriptivo:

```
<tipo>: <descripción en presente, breve y clara>
```

**Tipos válidos:**
| Tipo | Cuándo |
|------|--------|
| `feat:` | Nueva funcionalidad. |
| `fix:` | Corrección de un error. |
| `docs:` | Cambios solo en documentación. |
| `test:` | Agregar o ajustar pruebas. |
| `refactor:` | Reorganizar código sin cambiar comportamiento. |
| `chore:` | Tareas de mantenimiento (deps, config, scripts). |

**Ejemplos correctos:**
```
feat: agrega registro de organizaciones
fix: corrige cálculo de puntos por material
docs: actualiza documento de riesgos
test: agrega pruebas para mint de puntos
refactor: reorganiza servicio de reciclaje
chore: actualiza dependencias del backend
```

> 💡 **A la IA:** "Generá un mensaje de commit en formato Conventional Commits, en español, para estos cambios: \<pegás el `git diff`\>". Revisá que el tipo y la descripción sean correctos antes de usarlo.

### 4.3. Commitear
```bash
git commit -m "feat: agrega registro de organizaciones"
```
- Si configuramos **pre-commit hooks** (husky + lint-staged), dejá que corran y **no los saltees** (`--no-verify` está prohibido salvo acuerdo del equipo).

---

## 5. Paso a paso: PUSH

> El push sube tus commits al repositorio remoto para que el equipo los vea y para abrir el Pull Request.

1. **Asegurate de estar en tu rama de trabajo** (`feature/*` / `fix/*`), no en `develop`/`main`.
2. **Traé los últimos cambios de `develop`** para evitar conflictos grandes:
   ```bash
   git fetch origin
   git merge origin/develop      # o: git rebase origin/develop (según acuerdo del equipo)
   ```
   Resolvé conflictos en local, **validá de nuevo** (build + tests) y commiteá la resolución.
3. **Subí tu rama:**
   ```bash
   git push origin feature/mi-rama
   # primera vez: git push -u origin feature/mi-rama
   ```
4. **Abrí un Pull Request hacia `develop`** (nunca directo a `main`):
   - Título claro + referencia a la historia (`E2-HU5`).
   - Descripción: qué hace, cómo probarlo, qué validaste.
   - Asigná a **otro integrante como revisor** (revisión obligatoria).
5. **Esperá la revisión.** El revisor verifica: sin conflictos, criterios de aceptación cumplidos, validaciones de [§2](#2-validaciones) OK. Recién ahí se integra a `develop`.

> ❌ **Nunca** `git push --force` sobre `develop` o `main`. En tu propia rama feature, solo si es estrictamente necesario y avisando al equipo (preferir `--force-with-lease`).

---

## 6. Paso a paso: ELIMINAR un archivo

> Borrar archivos es **irreversible en la práctica** si ya se mergeó. Procedé con cuidado y, ante la duda, preguntá al equipo en **Discord**.

1. **Entendé qué hace el archivo antes de borrarlo.** Si la IA sugiere eliminarlo, pedile que explique **por qué** y **qué lo referencia**. No borres algo que no creaste sin confirmar.
2. **Buscá referencias / imports** en el resto del repo:
   ```bash
   git grep "NombreDelArchivo"     # ¿alguien lo importa o lo usa?
   ```
   Si está referenciado, primero actualizá/eliminá esas referencias.
3. **¿Es un archivo sensible o de infraestructura?** Confirmá que NO sea:
   - Una **migración de Prisma** ya aplicada (`backend/prisma/migrations/` **se versiona** y normalmente **no se borra**).
   - Un `deployments/sepolia.json`, ABI, o config compartida.
   - Documentación validada en `doc/Documentos Validados/`.
   - `docker-compose.yml`, `.gitignore`, `.env.example`.
   
   Si es alguno de estos → **NO borrar sin acuerdo del equipo**.
4. **Eliminá con Git** (para que quede registrado el borrado):
   ```bash
   git rm ruta/al/archivo
   ```
   Si ya lo borraste con el explorador/IDE, igual registralo: `git add ruta/al/archivo` (Git detecta la eliminación).
5. **Validá** que el proyecto **sigue compilando y los tests pasan** sin ese archivo ([§2](#2-validaciones)).
6. **Commit descriptivo** explicando el porqué:
   ```bash
   git commit -m "chore: elimina servicio obsoleto de reciclaje no utilizado"
   git commit -m "refactor: remueve componente duplicado del dashboard"
   ```
7. **Push + PR** como en [§5](#5-paso-a-paso-push). En la descripción del PR, **aclará qué se borró y por qué**, para que el revisor lo verifique.

> 🔒 **Para borrar un `.env` o cualquier secreto que se haya subido por error:** no alcanza con `git rm`; el secreto queda en el historial. Avisá **inmediatamente** al equipo en Discord, hay que **rotar la clave** y limpiar el historial. (Ver [§8](#8-seguridad--modelo-custodial)).

---

## 7. Qué NUNCA debe hacer la IA

- ❌ Commitear o pushear directo a `main` o `develop`.
- ❌ Incluir claves privadas, `.env`, `DATABASE_URL`, claves operadoras/custodiales en código o en el chat.
- ❌ Agregar dependencias de **wallet** (`wagmi`, `web3modal`, `RainbowKit`) al frontend — el modelo es **custodial**.
- ❌ Inventar reglas de negocio. Las reglas (RN-xx) están en los documentos validados; ante duda, preguntar.
- ❌ Reescribir archivos enteros que funcionan para "mejorarlos" sin que se haya pedido.
- ❌ Saltear validaciones, tests o hooks (`--no-verify`).
- ❌ Borrar migraciones de Prisma aplicadas, ABIs, deployments o documentación validada.
- ❌ Cambiar el stack o la arquitectura por iniciativa propia (PostgreSQL/Prisma, NestJS, React/Vite, Foundry+Hardhat están definidos).

---

## 8. Seguridad — modelo custodial

ECOToken **administra las claves privadas de las empresas y absorbe el gas** (RN-25 a RN-28). Esto hace que la seguridad de claves sea **crítica**:

- Las claves **operadoras y custodiales** van **cifradas**, en variables de entorno, **nunca** en el repo ni en un chat de IA.
- El `.env` está en `.gitignore`. Solo se versiona `.env.example` **sin valores reales**.
- Si pedís ayuda a la IA con configuración, **reemplazá los valores reales por placeholders** (`<SEPOLIA_RPC_URL>`, `<JWT_SECRET>`).
- Si un secreto se filtra (commit, chat, captura): **avisar en Discord de inmediato**, **rotar la clave** y limpiar el historial. No esperar.
- `ADMIN_ROLE` reside en el **Vault Address**; la asignación/revocación de roles es exclusiva de ese rol.

---

## 9. Prompt base para pegar a la IA

> Copiá el bloque que corresponda al inicio de cualquier sesión con un chatbot/IA para el proyecto.
> Hay **dos variantes**:
> - **9.1 — Versión completa:** péguela cuando la IA **puede leer los archivos del repo** (Claude Code, Copilot, Cursor, o cualquier IA con acceso al proyecto). Le indica qué documentos consultar.
> - **9.2 — Versión autocontenida:** péguela cuando la IA **NO tiene acceso a los archivos** (ChatGPT/Gemini web sin adjuntar nada). Incluye todo el contexto necesario para trabajar sin abrir el repo.
>
> 💡 Si tu IA permite **adjuntar archivos**, subí también `doc/INSTRUCTIVO-IA.md` y `doc/ESTRUCTURA-PROYECTO.md`: con eso la IA tiene la fuente completa y solo necesitás la variante 9.1.

### 9.1. Versión completa (IA con acceso al repositorio)

```
Estás ayudando a desarrollar ECOToken (Proyecto Final UTN FRVM, equipo ClusterPA):
plataforma Web3 de incentivos al reciclaje empresarial, modelo B2B/B2G y CUSTODIAL.

ANTES DE TRABAJAR, leé y respetá estos documentos del repo (son la fuente de verdad):
- doc/INSTRUCTIVO-IA.md  -> estándar de trabajo con IA: validaciones, formato, commit/push/borrado.
- doc/ESTRUCTURA-PROYECTO.md -> estructura del monorepo, responsabilidad de cada capa y convenciones.
- doc/Documentos Validados/ -> reglas de negocio (RN-xx), ciclo de vida y alcance. NO inventes reglas;
  si una regla no está ahí, preguntámela en vez de asumirla.
Si alguno de esos archivos contradice este prompt, GANA EL DOCUMENTO; avisame la diferencia.

Monorepo: contracts/ (Solidity, Foundry+Hardhat, OpenZeppelin UUPS, 5 roles) ·
backend/ (NestJS 11 + Prisma + PostgreSQL, patrón Controller→Service→Repository, DTOs con
class-validator, integración on-chain con ethers/viem) · frontend/ (React 18 + Vite + Tailwind,
SOLO REST + WebSocket, SIN wallet porque es custodial) · infra/ · doc/.

Reglas que debés respetar SIEMPRE (resumen del instructivo; ante duda, consultá el documento):
1. Nunca propongas commitear o pushear a main/develop: el trabajo va en feature/* o fix/* con PR
   hacia develop y revisión obligatoria de otro integrante. (ver §4-§5 del instructivo)
2. Nunca incluyas secretos (.env, claves privadas, DATABASE_URL, claves custodiales). Usá placeholders. (§8)
3. Frontend SIN wallet (nada de wagmi/web3modal); solo REST + WebSocket. (§2.3)
4. Backend: Controller solo delega; lógica en Service; datos vía Repository con PrismaService;
   DTOs validados con class-validator; update extends PartialType(CreateDto). (§2.2, §3.1)
5. Contracts: OpenZeppelin upgradeable, UUPS, roles VALIDATOR/MINTER/BURNER/ADMIN/EMERGENCY,
   tests con forge test. (§2.4)
6. Commits en formato Conventional Commits en español: feat/fix/docs/test/refactor/chore. (§4.2)
7. Cambios pequeños y atómicos. Comentarios y documentación en español. (§1)
8. No inventes reglas de negocio ni cambies el stack/arquitectura definidos. (§7)
9. Antes de eliminar un archivo, seguí §6 del instructivo (buscar referencias, no tocar migraciones
   de Prisma / ABIs / deployments / docs validados sin acuerdo del equipo).

Cuando generes código, indicá en qué carpeta del monorepo va y qué validaciones de §2 corresponde
correr. Al terminar, recordame correr lint + build + tests antes de commitear.
```

### 9.2. Versión autocontenida (IA sin acceso a los archivos)

```
Estás ayudando a desarrollar ECOToken (Proyecto Final UTN FRVM, equipo ClusterPA):
plataforma Web3 de incentivos al reciclaje empresarial, modelo B2B/B2G y CUSTODIAL (el backend
administra las claves privadas de las empresas y absorbe el gas; los usuarios NO usan wallet).
El token ECO es un ERC-20 sin valor monetario (reputación ambiental) en la red Sepolia testnet.

Trabajás sobre un monorepo en GitHub con estas carpetas:
- contracts/ : Solidity con Foundry+Hardhat, OpenZeppelin UUPS upgradeable, 5 roles
  (VALIDATOR_ROLE, MINTER_ROLE, BURNER_ROLE, ADMIN_ROLE, EMERGENCY_ROLE). Tests con `forge test`.
- backend/   : NestJS 11 + Prisma + PostgreSQL. Patrón Controller→Service→Repository.
  El Controller solo delega; la lógica va en el Service; los datos se acceden por Repository con
  PrismaService. DTOs validados con class-validator; el update extends PartialType(CreateDto).
  Integración on-chain con ethers/viem en el módulo blockchain (firma de tx y escucha de eventos).
- frontend/  : React 18 + Vite + TailwindCSS. SOLO REST + WebSocket, SIN wallet (modelo custodial:
  nada de wagmi/web3modal/RainbowKit). Organización feature-first: features/<rol>/.
- infra/     : Docker y deploy.  ·  doc/ : documentación.

Reglas que debés respetar SIEMPRE:
1. No commitear ni pushear a main/develop. Todo va en una rama feature/* o fix/*, se integra por
   Pull Request hacia develop, con revisión obligatoria de otro integrante.
2. Nunca incluir secretos (.env, claves privadas, DATABASE_URL, claves operadoras/custodiales).
   Usá placeholders como <JWT_SECRET> o <SEPOLIA_RPC_URL>.
3. Commits en Conventional Commits, en español: feat / fix / docs / test / refactor / chore.
   Ej.: "feat: agrega registro de organizaciones".
4. Ramas en kebab-case: feature/<descripcion> o fix/<descripcion>.
5. Antes de borrar un archivo: buscar quién lo referencia y NO eliminar migraciones de Prisma
   aplicadas, ABIs, deployments ni documentación validada sin acuerdo del equipo.
6. Cambios pequeños y atómicos (una historia/tarea por vez). Comentarios y docs en español.
7. No inventes reglas de negocio ni cambies el stack/arquitectura: están definidos.
8. Validaciones antes de aceptar código: compila/corre, pasa linter (ESLint+Prettier o forge fmt),
   no tiene secretos, respeta el patrón de su capa y no rompe tests existentes.

Cuando generes código, indicá en qué carpeta del monorepo va. Al terminar, recordame correr
lint + build + tests antes de commitear. Si algo no está claro, preguntá en vez de asumir.
```

---

## 10. Checklist final

> Antes de pedir la revisión (PR), repasá:

- [ ] Trabajé en una rama `feature/*` o `fix/*` (no en `main`/`develop`).
- [ ] El código pasa **lint + build + tests** ([§2](#2-validaciones)).
- [ ] No hay **secretos** en el diff.
- [ ] Los **commits** siguen Conventional Commits en español.
- [ ] El cambio corresponde a una **historia** registrada en Notion (`E{x}-HU{y}`).
- [ ] Actualicé `.env.example` / documentación si hizo falta.
- [ ] La estructura de archivos respeta `ESTRUCTURA-PROYECTO.md`.
- [ ] Abrí el **PR hacia `develop`** y asigné a **otro integrante** como revisor.

---

### Historial del documento
| Versión | Fecha | Autor | Observaciones |
|---------|-------|-------|---------------|
| v1.0 | 2026-06-16 | Equipo ClusterPA | Versión inicial. Estándar de uso de IA/chatbots: validaciones, formato de trabajo y guías de commit/push/eliminación de archivos. Alineado a Ciclo de Vida v1.1, Interesados y Comunicaciones v1.1 y ESTRUCTURA-PROYECTO.md. |
