import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { TipoRol } from '@prisma/client';
import { RolesGuard } from './roles.guard';
import type { JwtPayload } from '../strategies/jwt.strategy';

function buildContext(user?: JwtPayload): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const usuarioCoop: JwtPayload = {
    sub: 'u1',
    email: 'coop@ejemplo.com',
    rol: TipoRol.COOPERATIVA,
    empresaId: 'e1',
    municipalidadId: null,
  };

  it('permite el acceso si no se declaró ningún @Roles(...)', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(buildContext(usuarioCoop))).toBe(true);
  });

  it('permite el acceso si el rol del usuario está en la lista requerida', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([TipoRol.COOPERATIVA]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(buildContext(usuarioCoop))).toBe(true);
  });

  it('rechaza el acceso si el rol del usuario no está en la lista requerida', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([TipoRol.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(buildContext(usuarioCoop))).toBe(false);
  });

  it('rechaza el acceso si no hay usuario autenticado en el request', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([TipoRol.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(buildContext(undefined))).toBe(false);
  });
});
