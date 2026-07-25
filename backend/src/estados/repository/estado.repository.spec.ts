import { Test } from '@nestjs/testing';
import { EstadoRepository } from './estado.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('EstadoRepository', () => {
  let repository: EstadoRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [EstadoRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    repository = moduleRef.get(EstadoRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });
});
