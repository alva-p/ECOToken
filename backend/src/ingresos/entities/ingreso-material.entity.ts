import type { Empresa } from '../../empresas/entities/empresa.entity';
import type { TipoMaterial } from '../../materiales/entities/tipo-material.entity';
import type { Estado } from '../../estados/entities/estado.entity';
import type { MovimientoToken } from '../../tokens/entities/movimiento-token.entity';

/**
 * IngresoMaterial: aporte de material reciclable registrado por una empresa.
 *
 * Métodos de negocio (implementados en ingresos.service.ts):
 * - calcularPuntaje(): number
 * - esIngresado(): boolean
 */
export class IngresoMaterial {
  id: string;
  peso: number;
  fechaIngreso: Date;
  tokensAcumulados: number;
  empresaId: string;
  tipoMaterialId: string;
  estadoId: string;

  // Relaciones
  empresa?: Empresa;
  tipoMaterial?: TipoMaterial;
  estado?: Estado;
  movimientoToken?: MovimientoToken | null;
}
