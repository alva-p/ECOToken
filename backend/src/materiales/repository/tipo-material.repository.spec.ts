import { Test } from '@nestjs/testing';
import { TipoMaterialRepository } from './tipo-material.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('TipoMaterialRepository', () => {
  let repository: TipoMaterialRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TipoMaterialRepository,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    repository = moduleRef.get(TipoMaterialRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });
});
