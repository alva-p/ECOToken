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

`ECOToken.sol` — ERC-20 **UUPS upgradeable** con OpenZeppelin: `AccessControl`, `ERC20Capped`, `ERC20Burnable`, `Pausable`.
Roles: `VALIDATOR_ROLE`, `MINTER_ROLE`, `BURNER_ROLE`, `ADMIN_ROLE`, `EMERGENCY_ROLE`.
Ver reglas de negocio en [`../doc/ESTRUCTURA-PROYECTO.md`](../doc/ESTRUCTURA-PROYECTO.md) §3.

## Vault Address (ADMIN_ROLE)

La **Vault Address** es la cuenta operadora principal del sistema. Actúa como `ADMIN_ROLE` del contrato y financia las cuentas operadoras en Sepolia. Es una cuenta **custodial**: el backend firma las transacciones con su clave privada.

### Datos de la Vault (Sepolia testnet)

| Campo | Valor |
|-------|-------|
| **Address** | `0x034604c39Db14f6126C4D7EEC728FF1bedcDc3de` |
| **Red** | Sepolia testnet |
| **Rol en contrato** | `ADMIN_ROLE` + `DEFAULT_ADMIN_ROLE` |

### Cómo se generó

```bash
# Requiere Foundry instalado (https://getfoundry.sh)
cast wallet new
```

El comando genera un par de claves. La **clave privada nunca se commitea**: se guarda en `.env` local (gitignoreado) y en el gestor de contraseñas del equipo.

### Cómo cargar saldo (faucet Sepolia)

1. Copiá la address: `0x034604c39Db14f6126C4D7EEC728FF1bedcDc3de`
2. Pedí ETH de testnet en alguno de estos faucets:
   - [Google Cloud Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) — sin requisitos
   - [Alchemy Faucet](https://sepoliafaucet.com) — requiere cuenta Alchemy
   - [Chainlink Faucet](https://faucets.chain.link/sepolia) — requiere 0.001 ETH en mainnet
3. Verificá el saldo en [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x034604c39Db14f6126C4D7EEC728FF1bedcDc3de)

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

# Deploy + verify en Sepolia (Hardhat)
npx hardhat run scripts/deploy.ts --network sepolia
```
