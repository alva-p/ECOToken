/**
 * CUIT/CUIL argentino: 11 dígitos + dígito verificador (módulo 11, pesos
 * 5,4,3,2,7,6,5,4,3,2). Misma regla que el backend (common/helpers/cuit.helper.ts)
 * para avisar antes de enviar el formulario.
 */
export function esCuitValido(cuit: string): boolean {
  const limpio = cuit.replace(/\D/g, '');
  if (limpio.length !== 11) return false;
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const suma = pesos.reduce((acc, p, i) => acc + p * Number(limpio[i]), 0);
  let verificador = 11 - (suma % 11);
  if (verificador === 11) verificador = 0;
  return verificador !== 10 && verificador === Number(limpio[10]);
}
