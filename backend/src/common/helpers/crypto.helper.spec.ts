import { decrypt, encrypt, generarPasswordTemporal } from './crypto.helper';

const SECRET = 'clave-de-prueba-no-usar-en-produccion';

describe('crypto.helper (AES-256-GCM)', () => {
  it('descifra a texto plano lo que cifró con el mismo secreto', () => {
    const original = '0xabc123-clave-privada-de-prueba';
    const cifrado = encrypt(original, SECRET);

    expect(decrypt(cifrado, SECRET)).toBe(original);
  });

  it('produce salidas distintas para el mismo texto (IV aleatorio)', () => {
    const original = '0xabc123-clave-privada-de-prueba';

    expect(encrypt(original, SECRET)).not.toBe(encrypt(original, SECRET));
  });

  it('lanza si se intenta descifrar con un secreto distinto', () => {
    const cifrado = encrypt('dato-sensible', SECRET);

    expect(() => decrypt(cifrado, 'otro-secreto')).toThrow();
  });

  it('lanza si el payload cifrado no tiene el formato esperado', () => {
    expect(() => decrypt('payload-invalido', SECRET)).toThrow(
      'Payload cifrado con formato inválido.',
    );
  });
});

describe('generarPasswordTemporal', () => {
  it('genera valores distintos en cada llamada', () => {
    expect(generarPasswordTemporal()).not.toBe(generarPasswordTemporal());
  });

  it('no está vacío', () => {
    expect(generarPasswordTemporal().length).toBeGreaterThan(0);
  });
});
