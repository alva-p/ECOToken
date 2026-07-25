import type { Empresa } from '../../empresas/entities/empresa.entity';

/**
 * Ranking mensual de empresas por aportes de un período (mes/anio).
 *
 * Métodos de negocio (implementados en ranking.service.ts):
 * - consultarPuntaje(): number
 * - armarGrilla(): void
 * - generarCertificado(): void
 */
export class Ranking {
  id: string;
  mes: number;
  anio: number;
  fechaCierre: Date | null;
  hashSnapshot: string | null;
  bloqueReferencia: number | null;
  estado: string | null;
  empresaId: string | null;

  // Relaciones
  empresa?: Empresa | null;
}
