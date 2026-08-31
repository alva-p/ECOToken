/**
 * Configuración tipada de la app. Centraliza la lectura de variables de entorno.
 * Recomendación (§8.2): validar al boot con zod/Joi para fallar rápido.
 */
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  blockchain: {
    rpcUrl: process.env.SEPOLIA_RPC_URL ?? '',
    contractAddress: process.env.ECOTOKEN_CONTRACT_ADDRESS ?? '',
    explorerUrl: process.env.EXPLORER_URL ?? 'https://sepolia.etherscan.io',
    // Cuenta con ADMIN_ROLE/DEFAULT_ADMIN_ROLE on-chain: es quien puede otorgar
    // roles (p. ej. VALIDATOR_ROLE a una cooperativa, E4-HU01).
    adminPrivateKey: process.env.ADMIN_PRIVATE_KEY ?? '',
    // Cuenta con MINTER_ROLE on-chain: firma la acuñación de tokens al registrar
    // un ingreso de material (E5-HU01).
    minterPrivateKey: process.env.MINTER_PRIVATE_KEY ?? '',
  },
  // Cifra datos sensibles que deben poder recuperarse (p. ej. la clave privada
  // de una billetera custodial) — ver common/helpers/crypto.helper.ts.
  walletEncryptionKey: process.env.WALLET_ENCRYPTION_KEY ?? '',
});
