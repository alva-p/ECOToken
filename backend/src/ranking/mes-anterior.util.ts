import { partesArt } from '../common/helpers/fecha-art.helper';

/** Mes/año calendario (1-indexado) anteriores a la fecha dada, en hora argentina. */
export function mesAnterior(fecha: Date): { mes: number; anio: number } {
  const { mes, anio } = partesArt(fecha);
  return mes === 1 ? { mes: 12, anio: anio - 1 } : { mes: mes - 1, anio };
}
