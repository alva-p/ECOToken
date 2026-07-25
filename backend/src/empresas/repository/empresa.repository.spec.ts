import { Test } from '@nestjs/testing';
import { EmpresaRepository } from './empresa.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('EmpresaRepository', () => {
  let repository: EmpresaRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [EmpresaRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    repository = moduleRef.get(EmpresaRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });
});
