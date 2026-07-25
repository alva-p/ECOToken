import { Test } from '@nestjs/testing';
import { MunicipalidadesController } from './municipalidades.controller';
import { MunicipalidadesService } from './municipalidades.service';

describe('MunicipalidadesController', () => {
  let controller: MunicipalidadesController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MunicipalidadesController],
      providers: [{ provide: MunicipalidadesService, useValue: {} }],
    }).compile();

    controller = moduleRef.get(MunicipalidadesController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});
