import { Test } from '@nestjs/testing';
import { MaterialesService } from './materiales.service';
import { TipoMaterialRepository } from './repository/tipo-material.repository';

describe('MaterialesService', () => {
  let service: MaterialesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MaterialesService,
        { provide: TipoMaterialRepository, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(MaterialesService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
