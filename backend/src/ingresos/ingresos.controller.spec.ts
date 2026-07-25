import { Test } from '@nestjs/testing';
import { IngresosController } from './ingresos.controller';
import { IngresosService } from './ingresos.service';

describe('IngresosController', () => {
  let controller: IngresosController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [IngresosController],
      providers: [{ provide: IngresosService, useValue: {} }],
    }).compile();

    controller = moduleRef.get(IngresosController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});
