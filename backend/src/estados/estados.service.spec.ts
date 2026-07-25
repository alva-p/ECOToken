import { Test } from '@nestjs/testing';
import { EstadosService } from './estados.service';
import { EstadoRepository } from './repository/estado.repository';

describe('EstadosService', () => {
  let service: EstadosService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [EstadosService, { provide: EstadoRepository, useValue: {} }],
    }).compile();

    service = moduleRef.get(EstadosService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
