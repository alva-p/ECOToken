import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { TipoRol } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuariosService } from '../../usuarios/usuarios.service';

/**
 * Claims del JWT. El frontend (`lib/auth.ts`, `feat/E11-HU03-base-frontend`)
 * ya asume este contrato para rehidratar la sesión sin round-trip a `/auth/me`
 * — la clave del rol es `rol` (no `tipoRol`, aunque así se llama en Prisma).
 */
export interface JwtPayload {
  sub: string;
  email: string;
  rol: TipoRol;
  empresaId: string | null;
  municipalidadId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret') ?? '',
    });
  }

  /** Lo que devuelve queda disponible como `request.user` (ver @CurrentUser). */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const usuario = await this.usuariosService
      .findOne(payload.sub)
      .catch(() => null);
    if (!usuario?.activo) {
      throw new UnauthorizedException('La cuenta está inactiva');
    }
    return payload;
  }
}
