import type { PeriodoCerrado } from './api';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/** "Agosto 2026" a partir de mes (1-12) y año. */
export function etiquetaPeriodo({
  mes,
  anio,
}: {
  mes: number;
  anio: number;
}): string {
  return `${MESES[mes - 1]} ${anio}`;
}

/** "1 empresa" / "10 empresas". */
export function cantidadEmpresas(n: number): string {
  return `${n.toLocaleString('es-AR')} ${n === 1 ? 'empresa' : 'empresas'}`;
}

/**
 * Variación porcentual de kg respecto del mes calendario anterior; null si ese
 * mes no está entre los períodos cerrados (o no tuvo material), para no
 * comparar contra un mes que no es el inmediato anterior.
 */
export function variacionVsMesAnterior(
  actual: { mes: number; anio: number; totalKg: number },
  periodos: PeriodoCerrado[],
): number | null {
  const mes = actual.mes === 1 ? 12 : actual.mes - 1;
  const anio = actual.mes === 1 ? actual.anio - 1 : actual.anio;
  const anterior = periodos.find((p) => p.mes === mes && p.anio === anio);
  if (!anterior || anterior.totalKg === 0) return null;
  return Math.round(
    ((actual.totalKg - anterior.totalKg) / anterior.totalKg) * 100,
  );
}
