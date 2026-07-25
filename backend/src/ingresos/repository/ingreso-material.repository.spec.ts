import { Test } from '@nestjs/testing';
import { IngresoMaterialRepository } from './ingreso-material.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('IngresoMaterialRepository', () => {
  let repository: IngresoMaterialRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        IngresoMaterialRepository,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    repository = moduleRef.get(IngresoMaterialRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });
});
