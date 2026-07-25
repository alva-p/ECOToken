import { Test } from '@nestjs/testing';
import { PuntajeRepository } from './puntaje.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('PuntajeRepository', () => {
  let repository: PuntajeRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PuntajeRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    repository = moduleRef.get(PuntajeRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });
});
