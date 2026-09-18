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
  certificados: {
    // Empresas que reciben certificado al cierre del mes (E8-HU01). 0 = todas
    // las empresas con aportes ese mes (default), sin recorte de Top X.
    topX: parseInt(process.env.CERTIFICADOS_TOP_X ?? '0', 10),
    // kg de CO2 evitado por kg reciclado, según el material (nombre de
    // TipoMaterial en mayúsculas). Un material sin factor en este mapa no
    // suma CO2 evitado (ver factoresCo2PorMaterial en certificados.service).
    factoresCo2: {
      PLASTICO: parseFloat(process.env.CERTIFICADOS_FACTOR_CO2_PLASTICO ?? '1.8'),
      CARTON: parseFloat(process.env.CERTIFICADOS_FACTOR_CO2_CARTON ?? '1.5'),
      VIDRIO: parseFloat(process.env.CERTIFICADOS_FACTOR_CO2_VIDRIO ?? '0.3'),
    } as Record<string, number>,
  },
});
