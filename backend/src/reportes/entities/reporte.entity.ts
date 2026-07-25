import type { Prisma } from '@prisma/client';
import type { Empresa } from '../../empresas/entities/empresa.entity';

/**
 * Reporte consolidado de la plataforma (volúmenes, empresas reconocidas, etc.).
 *
 * Métodos de negocio (implementados en reportes.service.ts):
 * - generar(tipo, periodo): Reporte
 * - exportar(formato): Archivo
 * - obtenerVolumenPorPeriodo(filtros): JSON
 * - obtenerEmpresasReconocidas(mes): List
 */
export class Reporte {
  id: string;
  periodo: string;
  fechaGeneracion: Date;
  datosConsolidados: Prisma.JsonValue;
  creadorPor: string;
  empresaId: string | null;

  // Relaciones
  empresa?: Empresa | null;
}
