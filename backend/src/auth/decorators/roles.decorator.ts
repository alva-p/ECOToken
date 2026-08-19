import { SetMetadata } from '@nestjs/common';
import { TipoRol } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Restringe un endpoint a los roles indicados (usar junto a RolesGuard). */
export const Roles = (...roles: TipoRol[]) => SetMetadata(ROLES_KEY, roles);
