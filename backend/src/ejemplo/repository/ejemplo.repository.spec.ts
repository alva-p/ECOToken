import { Test } from '@nestjs/testing';
import { EjemploRepository } from './ejemplo.repository';
import { PrismaService } from '../../prisma/prisma.service';

/** Plantilla de test de repositorio (Sprint 0). */
describe('EjemploRepository', () => {
  let repository: EjemploRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EjemploRepository,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    repository = moduleRef.get(EjemploRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });
});
