# ECOToken — Contracts

Smart contracts del token **ECO** (ERC-20 sin valor monetario) sobre **Sepolia** testnet. Setup híbrido **Foundry + Hardhat** (plugin `@nomicfoundation/hardhat-foundry`): Foundry corre los tests rápidos en Solidity; Hardhat maneja despliegue y verificación en TypeScript.

## Estructura

```
contracts/
├── foundry.toml          # config Foundry
├── hardhat.config.ts     # config Hardhat (red Sepolia + plugin foundry)
├── remappings.txt        # alias de imports (OZ, forge-std)
├── src/                  # contratos Solidity (fuente única)
├── test/                 # tests Foundry (*.t.sol)
├── script/               # scripts de deploy Foundry (*.s.sol)
├── scripts/              # scripts de deploy Hardhat (*.ts)
├── deployments/          # direcciones + ABIs por red (output)
└── lib/                  # dependencias Foundry (forge install)
```

## Diseño del contrato

`ECOToken.sol` — ERC-20 con OpenZeppelin: `AccessControl`, `ERC20Capped`, `Pausable`.
Roles implementados: `ADMIN_ROLE` (pausa + gestión de roles), `MINTER_ROLE` (mint con trazabilidad de material/peso), `EMERGENCY_ROLE` (`emergencyBurn` solo en pausa).
Pendientes en backlog: `VALIDATOR_ROLE`, `BURNER_ROLE`, migración a UUPS upgradeable.
Ver reglas de negocio en [`../doc/ESTRUCTURA-PROYECTO.md`](../doc/ESTRUCTURA-PROYECTO.md) §3.

## Deployment en Sepolia (E2-HU08)

Redesplegado el 2026-08-31 tras la migración a UUPS (E2-HU06) y la quema con
firma EIP-712 (E2-HU03): el deploy anterior (`0xa649Fe...`) era de un
contrato no-upgradeable y quedó obsoleto, no compatible con el ABI actual.

| Campo | Valor |
|-------|-------|
| **Contrato (proxy UUPS)** | [`0x659BDe074Dd65f9C443705Be9225bd823029E49E`](https://sepolia.etherscan.io/address/0x659BDe074Dd65f9C443705Be9225bd823029E49E) |
| **Implementación** | [`0xf74E4E4F239416CFa8A289e6Dc04ea8c5cb86fd3`](https://sepolia.etherscan.io/address/0xf74E4E4F239416CFa8A289e6Dc04ea8c5cb86fd3) (upgrade del 2026-08-31, ver abajo) |
| **Tx de deploy (proxy)** | [`0xe5d613a2...44384b6f`](https://sepolia.etherscan.io/tx/0xe5d613a2d2a87259bb0c0c9ea714abd0276567c4bf3b597fa725583e44384b6f) |
| **Block** | 11606101 |
| **Cap** | 1.000.000 ECO |
| **ADMIN + MINTER + EMERGENCY** | Vault `0xE7136d34f62C3c8375a1d3Fe04ec4B2e99F9629E` |
| **VALIDATOR_ROLE / BURNER_ROLE** | Sin otorgar todavía — `initialize()` no los asigna a nadie por default. Se otorgan post-deploy desde `/admin/roles` (E10-HU01) o por alta de cooperativa (E4-HU01). |
| **Verificado en Etherscan** | ✅ [código fuente](https://sepolia.etherscan.io/address/0x659BDe074Dd65f9C443705Be9225bd823029E49E#code) |

> **Siempre usar la dirección del proxy** (`0x659BDe...`) en `backend/.env` y en cualquier integración — la implementación es un detalle interno del patrón UUPS, nunca se llama directamente.

### Upgrade 2026-08-31: `decimals()` a 0

El backend acuña `amount` como un entero (1 unidad = 1 ECO, sin escalar por
`10^18`), pero el contrato heredaba el `decimals()` default de OpenZeppelin
(18). Wallets y exploradores que respetan decimales (Etherscan, MetaMask)
mostraban el saldo real como ~0. Se subió una nueva implementación
(`script/UpgradeECOToken.s.sol`) que pisa `decimals()` para devolver `0`; el
storage del proxy (balances, roles, cap) no se tocó.

| Campo | Valor |
|-------|-------|
| **Nueva implementación** | [`0xf74E4E4F239416CFa8A289e6Dc04ea8c5cb86fd3`](https://sepolia.etherscan.io/address/0xf74E4E4F239416CFa8A289e6Dc04ea8c5cb86fd3) |
| **Tx de upgrade** | [`0x413d7f01...be5241db`](https://sepolia.etherscan.io/tx/0x413d7f017c95110897287ec65f7cf2b76371e68fc5169e862487a496be5241db) |
| **Block** | 11607396 |
| **Verificado en Etherscan** | ✅ |

## Vault Address (ADMIN_ROLE)

La **Vault Address** es la cuenta operadora principal del sistema. Actúa como `ADMIN_ROLE` del contrato y financia las cuentas operadoras en Sepolia. Es una cuenta **custodial**: el backend firma las transacciones con su clave privada.

### Datos de la Vault (Sepolia testnet)

| Campo | Valor |
|-------|-------|
| **Address** | `0xE7136d34f62C3c8375a1d3Fe04ec4B2e99F9629E` |
| **Red** | Sepolia testnet |
| **Rol en contrato** | `ADMIN_ROLE` + `DEFAULT_ADMIN_ROLE` |

### Cómo se generó

```bash
# Requiere Foundry instalado (https://getfoundry.sh)
cast wallet new
```

El comando genera un par de claves. La **clave privada nunca se commitea**: se guarda en `.env` local (gitignoreado) y en el gestor de contraseñas del equipo.

### Cómo cargar saldo (faucet Sepolia)

1. Copiá la address: `0xE7136d34f62C3c8375a1d3Fe04ec4B2e99F9629E`
2. Pedí ETH de testnet en alguno de estos faucets:
   - [Google Cloud Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) — sin requisitos
   - [Alchemy Faucet](https://sepoliafaucet.com) — requiere cuenta Alchemy
   - [Chainlink Faucet](https://faucets.chain.link/sepolia) — requiere 0.001 ETH en mainnet
3. Verificá el saldo en [Sepolia Etherscan](https://sepolia.etherscan.io/address/0xE7136d34f62C3c8375a1d3Fe04ec4B2e99F9629E)

### Seguridad

- La clave privada de la Vault **jamás** se sube al repo ni se comparte por WhatsApp/Discord.
- Se comparte entre integrantes solo por canal cifrado (gestor de contraseñas compartido o mensaje directo cifrado).
- Si se filtra: avisar inmediatamente al equipo, rotar la clave y regenerar los roles en el contrato. Ver §8 del `INSTRUCTIVO-IA.md`.
- En producción (mainnet), usar un HSM o servicio de gestión de claves (AWS KMS, HashiCorp Vault).

## Uso

```bash
# Requisitos: Foundry (https://getfoundry.sh) + Node.js
forge install OpenZeppelin/openzeppelin-contracts-upgradeable
npm install

forge build           # compilar
forge test            # tests unitarios + fuzzing
forge fmt             # formato

# Deploy + verify en Sepolia (requiere keystore: cast wallet import ecotoken-admin --interactive)
forge script script/DeployECOToken.s.sol --rpc-url $SEPOLIA_RPC_URL --account ecotoken-admin \
  --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
```
