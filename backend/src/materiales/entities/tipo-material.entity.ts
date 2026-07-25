import type { Puntaje } from '../../puntajes/entities/puntaje.entity';
import type { IngresoMaterial } from '../../ingresos/entities/ingreso-material.entity';

/**
 * Tipo de material reciclable admitido en la plataforma.
 */
export class TipoMaterial {
  id: string;
  nombre: string;
  descripcion: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  puntajes?: Puntaje[];
  ingresos?: IngresoMaterial[];
}
