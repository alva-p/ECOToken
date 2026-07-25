import type { IngresoMaterial } from '../../ingresos/entities/ingreso-material.entity';

/**
 * Movimiento de tokens generado a partir de un IngresoMaterial validado,
 * con su anclaje on-chain (txHash / bloque).
 *
 * (Sin métodos de negocio: solo CRUD.)
 */
export class MovimientoToken {
  id: string;
  cantidad: number;
  txHash: string | null;
  bloque: number | null;
  fecha: Date;
  ingresoMaterialId: string;

  // Relaciones
  ingresoMaterial?: IngresoMaterial;
}
