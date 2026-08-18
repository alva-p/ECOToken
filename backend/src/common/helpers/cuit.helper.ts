/**
 * Validación de CUIT/CUIL argentino (11 dígitos) — formato + dígito verificador.
 * Acepta con o sin guiones/espacios (ej.: "20-12345678-6" o "20123456786").
 * Algoritmo estándar AFIP: módulo 11 con pesos [5,4,3,2,7,6,5,4,3,2].
 */
export function esCuitValido(cuit: string): boolean {
  const limpio = cuit.replace(/[^\d]/g, '');
  if (!/^\d{11}$/.test(limpio)) {
    return false;
  }

  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const digitos = limpio.split('').map((d) => Number(d));
  const suma = pesos.reduce((acc, peso, i) => acc + peso * digitos[i], 0);

  let verificador = 11 - (suma % 11);
  if (verificador === 11) {
    verificador = 0;
  }
  // Resultado 10 no es un dígito verificador válido de CUIT.
  if (verificador === 10) {
    return false;
  }

  return verificador === digitos[10];
}
