import type { TipoMaterial } from '../../materiales/entities/tipo-material.entity';

/**
 * Puntaje: configuración vigente de tokens (cantidadPorKilo) para un tipo de material.
 *
 * (Sin métodos de negocio: el service expone solo el CRUD.)
 */
export class Puntaje {
  id: string;
  fechaDesde: Date;
  fechaHasta: Date | null;
  versionConfig: string;
  cantidadPorKilo: string;
  tipoMaterialId: string;

  // Relaciones
  tipoMaterial?: TipoMaterial;

  createdAt: Date;
  updatedAt: Date;
}
