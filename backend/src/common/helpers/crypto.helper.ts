import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

/**
 * Cifrado simétrico (AES-256-GCM) para datos sensibles que deben poder
 * recuperarse en claro más adelante (p. ej. la clave privada de una billetera
 * custodial) — a diferencia de bcrypt, que es de un solo sentido.
 *
 * La clave de 32 bytes se deriva por hash de `WALLET_ENCRYPTION_KEY` (env),
 * así el secreto configurado puede ser cualquier passphrase de longitud
 * arbitraria. Cada llamada a `encrypt` usa un IV aleatorio de 12 bytes (nunca
 * se reutiliza), por lo que cifrar el mismo texto dos veces da resultados
 * distintos.
 *
 * Formato de salida: `<iv>:<authTag>:<ciphertext>`, cada segmento en base64.
 */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(secret).digest();
}

export function encrypt(plainText: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, ciphertext]
    .map((buf) => buf.toString('base64'))
    .join(':');
}

/** Password temporal legible (base64url) para credenciales autogeneradas. */
export function generarPasswordTemporal(length = 12): string {
  return randomBytes(length).toString('base64url');
}

export function decrypt(payload: string, secret: string): string {
  const [ivB64, authTagB64, ciphertextB64] = payload.split(':');
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new Error('Payload cifrado con formato inválido.');
  }

  const key = deriveKey(secret);
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivB64, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));

  const plainText = Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, 'base64')),
    decipher.final(),
  ]);
  return plainText.toString('utf8');
}
