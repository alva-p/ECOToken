/** Mes/año calendario (1-indexado) anteriores a la fecha dada. */
export function mesAnterior(fecha: Date): { mes: number; anio: number } {
  const mesActual = fecha.getMonth(); // 0-indexado
  return mesActual === 0
    ? { mes: 12, anio: fecha.getFullYear() - 1 }
    : { mes: mesActual, anio: fecha.getFullYear() };
}
