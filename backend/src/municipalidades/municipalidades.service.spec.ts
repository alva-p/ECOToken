import { Test } from '@nestjs/testing';
import { MunicipalidadesService } from './municipalidades.service';
import { MunicipalidadRepository } from './repository/municipalidad.repository';

describe('MunicipalidadesService', () => {
  let service: MunicipalidadesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MunicipalidadesService,
        { provide: MunicipalidadRepository, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(MunicipalidadesService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
