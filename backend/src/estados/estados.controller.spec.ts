import { Test } from '@nestjs/testing';
import { EstadosController } from './estados.controller';
import { EstadosService } from './estados.service';

describe('EstadosController', () => {
  let controller: EstadosController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [EstadosController],
      providers: [{ provide: EstadosService, useValue: {} }],
    }).compile();

    controller = moduleRef.get(EstadosController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});
