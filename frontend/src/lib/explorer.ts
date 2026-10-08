// `||` y no `??`: en Vercel una variable definida pero vacía llega como "" (no
// como undefined) y dejaba los links como "/tx/0x…", que no salen del sitio.
const EXPLORER_URL =
  import.meta.env.VITE_EXPLORER_URL || 'https://sepolia.etherscan.io';

/** Helpers para armar links de verificación al explorador de bloques (Sepolia). */
export const txLink = (hash: string) => `${EXPLORER_URL}/tx/${hash}`;
export const addressLink = (address: string) =>
  `${EXPLORER_URL}/address/${address}`;
