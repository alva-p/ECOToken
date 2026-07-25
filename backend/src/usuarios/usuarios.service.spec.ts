import { Test } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { UsuarioRepository } from './repository/usuario.repository';

describe('UsuariosService', () => {
  let service: UsuariosService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UsuariosService, { provide: UsuarioRepository, useValue: {} }],
    }).compile();

    service = moduleRef.get(UsuariosService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
