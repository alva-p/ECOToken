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
