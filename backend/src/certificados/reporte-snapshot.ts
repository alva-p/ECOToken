/**
 * Datos del reporte mensual de actividad, congelados al emitir el certificado:
 * reporte y certificado quedan cerrados en el mismo instante y no cambian si
 * después se corrigen o agregan ingresos del mes.
 */
export interface ReporteSnapshot {
  entregas: {
    /** ISO 8601 (se guarda como JSON). */
    fecha: string;
    material: string;
    kg: number;
    tokens: number;
    txHash: string | null;
  }[];
  saldoAnterior: number;
  canjes: number;
  /** CO₂ acumulado del año hasta este mes inclusive. */
  co2Anio: number;
}
