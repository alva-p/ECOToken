import { Test } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { UsuarioRepository } from './repository/usuario.repository';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let repository: { findByEmail: jest.Mock };

  beforeEach(async () => {
    repository = { findByEmail: jest.fn() };

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
});
