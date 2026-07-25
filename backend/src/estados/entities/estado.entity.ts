import type { IngresoMaterial } from '../../ingresos/entities/ingreso-material.entity';

/**
 * Estado del ciclo de vida de un IngresoMaterial.
 *
 * (Sin métodos de negocio: catálogo simple.)
 */
export class Estado {
  id: string;
  nombre: string;
  descripcion: string | null;

  // Relaciones
  ingresos?: IngresoMaterial[];
}
