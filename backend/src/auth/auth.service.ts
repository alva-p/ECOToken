import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import type { JwtPayload } from './strategies/jwt.strategy';

/** Lógica de negocio de autenticación (E4-HU02). */
@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valida email + contraseña y devuelve un JWT firmado. El mensaje de error
   * es siempre el mismo (usuario inexistente, inactivo o contraseña
   * incorrecta) para no revelar cuál de las tres cosas falló.
   */
  async login(email: string, password: string): Promise<{ token: string }> {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.tipoRol,
      empresaId: usuario.empresaId,
      municipalidadId: usuario.municipalidadId,
    };
    const token = await this.jwtService.signAsync(payload);

    return { token };
  }
}
