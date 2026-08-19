import type { CategoriaEmpresa, EstadoEmpresa } from '@prisma/client';
import type { Usuario } from '../../usuarios/entities/usuario.entity';
import type { IngresoMaterial } from '../../ingresos/entities/ingreso-material.entity';
import type { BilleteraCustodial } from '../../billeteras/entities/billetera-custodial.entity';
import type { CertificadoDigital } from '../../certificados/entities/certificado-digital.entity';
import type { Reporte } from '../../reportes/entities/reporte.entity';
import type { Ranking } from '../../ranking/entities/ranking.entity';

/**
 * Empresa adherida (o cooperativa validadora si categoria = COOPERATIVA).
 *
 * Métodos de negocio (implementados en empresas.service.ts):
 * - registrar(datos): Empresa          // E3-HU01 (alta pública, estado PENDIENTE)
 * - aprobar(id) / rechazar(id): void    // E3-HU04
 * - verificarAprobada(id): Empresa      // gate "solo opera si aprobada"
 * - esCooperativa(): boolean
 * - obtenerTokens(): number
 * - obtenerHistorialAportes(): IngresoMaterial[]
 * - obtenerPosicionRanking(mes, anio): PosicionRanking
 * - obtenerCertificados(): CertificadoDigital[]
 * - exportarHistorial(): string (CSV)
 */
export class Empresa {
  id: string;
  razonSocial: string;
  cuit: string;
  domicilio: string | null;
  representanteLegal: string | null;
  emailContacto: string | null;
  estado: EstadoEmpresa;
  categoria: CategoriaEmpresa;
  fechaRegistro: Date;
  nombre: string | null;
  datosContacto: string | null;
  activa: boolean;
  walletAddress: string;
  terminosVersion: string | null;
  terminosAceptadosEn: Date | null;

  // Relaciones
  usuarios?: Usuario[];
  ingresos?: IngresoMaterial[];
  billeteraCustodial?: BilleteraCustodial | null;
  certificados?: CertificadoDigital[];
  reportes?: Reporte[];
  rankings?: Ranking[];

  createdAt: Date;
  updatedAt: Date;
}
