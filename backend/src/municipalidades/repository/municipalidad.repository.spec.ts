import { Test } from '@nestjs/testing';
import { MunicipalidadRepository } from './municipalidad.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('MunicipalidadRepository', () => {
  let repository: MunicipalidadRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MunicipalidadRepository,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    repository = moduleRef.get(MunicipalidadRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });
});
