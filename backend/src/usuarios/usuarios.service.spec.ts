import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from './usuarios.service';
import { UsuarioRepository } from './repository/usuario.repository';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let repository: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: UsuarioRepository, useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(UsuariosService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail (E4-HU02)', () => {
    it('delega en el repository y devuelve lo que encuentre', async () => {
      repository.findByEmail.mockResolvedValue({ id: 'u1' });

      const res = await service.findByEmail('coop@ejemplo.com');

      expect(repository.findByEmail).toHaveBeenCalledWith('coop@ejemplo.com');
      expect(res).toEqual({ id: 'u1' });
    });

    it('devuelve null sin lanzar si no existe', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(
        service.findByEmail('nadie@ejemplo.com'),
      ).resolves.toBeNull();
    });
  });

  describe('cambiarPassword', () => {
    it('guarda el hash nuevo y baja la marca de contraseña temporal', async () => {
      repository.findById.mockResolvedValue({
        id: 'u1',
        passwordHash: await bcrypt.hash('Temporal-1', 4),
        debeCambiarPassword: true,
      });

      const ok = await service.cambiarPassword(
        'u1',
        'Temporal-1',
        'Nueva-clave-99',
      );

      expect(ok).toBe(true);
      const [id, cambios] = repository.update.mock.calls[0];
      expect(id).toBe('u1');
      expect(cambios.debeCambiarPassword).toBe(false);
      expect(await bcrypt.compare('Nueva-clave-99', cambios.passwordHash)).toBe(
        true,
      );
    });

    it('no cambia nada si la contraseña actual no coincide', async () => {
      repository.findById.mockResolvedValue({
        id: 'u1',
        passwordHash: await bcrypt.hash('Temporal-1', 4),
      });

      await expect(
        service.cambiarPassword('u1', 'incorrecta', 'Nueva-clave-99'),
      ).resolves.toBe(false);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
