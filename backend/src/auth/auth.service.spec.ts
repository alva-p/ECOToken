import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TipoRol, type Usuario } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';

const usuarioBase: Usuario = {
  id: 'u1',
  email: 'coop@ejemplo.com',
  passwordHash: '',
  tipoRol: TipoRol.COOPERATIVA,
  activo: true,
  debeCambiarPassword: false,
  empresaId: 'empresa-1',
  municipalidadId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usuariosService: {
    findByEmail: jest.Mock;
    findOne: jest.Mock;
    cambiarPassword: jest.Mock;
  };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    usuariosService = {
      findByEmail: jest.fn(),
      findOne: jest.fn(),
      cambiarPassword: jest.fn(),
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('token-firmado') };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: usuariosService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('devuelve un token cuando el email y la contraseña son correctos', async () => {
      const passwordHash = await bcrypt.hash('correcta123', 4);
      usuariosService.findByEmail.mockResolvedValue({
        ...usuarioBase,
        passwordHash,
      });

      const res = await service.login('coop@ejemplo.com', 'correcta123');

      expect(res).toEqual({ token: 'token-firmado' });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: usuarioBase.id,
        email: usuarioBase.email,
        rol: TipoRol.COOPERATIVA,
        empresaId: usuarioBase.empresaId,
        municipalidadId: usuarioBase.municipalidadId,
        debeCambiarPassword: false,
      });
    });

    it('marca en el token que la cuenta debe cambiar su contraseña temporal', async () => {
      const passwordHash = await bcrypt.hash('temporal-123', 4);
      usuariosService.findByEmail.mockResolvedValue({
        ...usuarioBase,
        passwordHash,
        debeCambiarPassword: true,
      });

      await service.login('coop@ejemplo.com', 'temporal-123');

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ debeCambiarPassword: true }),
      );
    });

    it('lanza UnauthorizedException si el usuario no existe', async () => {
      usuariosService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('nadie@ejemplo.com', 'lo-que-sea'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el usuario está inactivo', async () => {
      const passwordHash = await bcrypt.hash('correcta123', 4);
      usuariosService.findByEmail.mockResolvedValue({
        ...usuarioBase,
        passwordHash,
        activo: false,
      });

      await expect(
        service.login('coop@ejemplo.com', 'correcta123'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('lanza UnauthorizedException si la contraseña es incorrecta', async () => {
      const passwordHash = await bcrypt.hash('correcta123', 4);
      usuariosService.findByEmail.mockResolvedValue({
        ...usuarioBase,
        passwordHash,
      });

      await expect(
        service.login('coop@ejemplo.com', 'incorrecta'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('cambiarPassword', () => {
    it('cambia la contraseña y devuelve un token sin la marca de temporal', async () => {
      usuariosService.cambiarPassword.mockResolvedValue(true);
      usuariosService.findOne.mockResolvedValue({
        ...usuarioBase,
        debeCambiarPassword: false,
      });

      const res = await service.cambiarPassword(
        'u1',
        'Temporal-1',
        'Nueva-clave-99',
      );

      expect(res).toEqual({ token: 'token-firmado' });
      expect(usuariosService.cambiarPassword).toHaveBeenCalledWith(
        'u1',
        'Temporal-1',
        'Nueva-clave-99',
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ debeCambiarPassword: false }),
      );
    });

    it('rechaza si la contraseña actual es incorrecta', async () => {
      usuariosService.cambiarPassword.mockResolvedValue(false);

      await expect(
        service.cambiarPassword('u1', 'mal', 'Nueva-clave-99'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('rechaza una contraseña nueva igual a la actual', async () => {
      await expect(
        service.cambiarPassword('u1', 'Misma-clave-1', 'Misma-clave-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(usuariosService.cambiarPassword).not.toHaveBeenCalled();
    });
  });
});
