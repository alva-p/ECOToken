import { Test } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

describe('UsuariosController', () => {
  let controller: UsuariosController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [{ provide: UsuariosService, useValue: {} }],
    }).compile();

    controller = moduleRef.get(UsuariosController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});
