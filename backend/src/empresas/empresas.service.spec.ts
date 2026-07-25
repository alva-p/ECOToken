import { Test } from '@nestjs/testing';
import { EmpresasService } from './empresas.service';
import { EmpresaRepository } from './repository/empresa.repository';

describe('EmpresasService', () => {
  let service: EmpresasService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EmpresasService,
        { provide: EmpresaRepository, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(EmpresasService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
