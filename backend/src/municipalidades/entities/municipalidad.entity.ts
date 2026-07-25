import type { Usuario } from '../../usuarios/entities/usuario.entity';

/**
 * Municipalidad adherida a la plataforma (organismo público, modelo B2G).
 *
 * Métodos de negocio (implementados en municipalidades.service.ts):
 * - login(email, pass): Session
 * - consultarReporte(periodo): Reporte
 * - exportarReporte(id, formato): File
 * - verRankingPublico(mes, anio): Ranking
 * - listarEmpresasReconocidas(mes): List
 */
export class Municipalidad {
  id: string;
  nombre: string;
  ciudad: string;

  // Relaciones
  usuarios?: Usuario[];

  createdAt: Date;
  updatedAt: Date;
}
