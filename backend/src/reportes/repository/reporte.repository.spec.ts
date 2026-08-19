import { Test } from '@nestjs/testing';
import { ReporteRepository } from './reporte.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('ReporteRepository', () => {
  let repository: ReporteRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ReporteRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    repository = moduleRef.get(ReporteRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });
});
