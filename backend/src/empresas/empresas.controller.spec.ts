import { Test } from '@nestjs/testing';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';

describe('EmpresasController', () => {
  let controller: EmpresasController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [EmpresasController],
      providers: [{ provide: EmpresasService, useValue: {} }],
    }).compile();

    controller = moduleRef.get(EmpresasController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});
