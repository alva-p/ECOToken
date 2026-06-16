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
  },
});
