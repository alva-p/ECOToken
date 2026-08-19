import type { TipoRol } from '@prisma/client';
import type { Empresa } from '../../empresas/entities/empresa.entity';
import type { Municipalidad } from '../../municipalidades/entities/municipalidad.entity';

/**
 * Usuario del sistema. Pertenece a una Empresa o a una Municipalidad según su rol.
 *
 * Métodos de negocio (implementados en usuarios.service.ts):
 * - autenticar(email, pass): boolean
 * - cerrarSesion(): void
 * - recuperarCuenta(): void
 * - cambiarPassword(actual, nueva): boolean
 */
export class Usuario {
  id: string;
  email: string;
  passwordHash: string;
  tipoRol: TipoRol;
  activo: boolean;
  empresaId: string | null;
  municipalidadId: string | null;

  // Relaciones
  empresa?: Empresa | null;
  municipalidad?: Municipalidad | null;

  createdAt: Date;
  updatedAt: Date;
}
