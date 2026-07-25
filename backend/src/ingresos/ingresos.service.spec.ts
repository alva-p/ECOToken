import { Test } from '@nestjs/testing';
import { IngresosService } from './ingresos.service';
import { IngresoMaterialRepository } from './repository/ingreso-material.repository';

describe('IngresosService', () => {
  let service: IngresosService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        IngresosService,
        { provide: IngresoMaterialRepository, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(IngresosService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
