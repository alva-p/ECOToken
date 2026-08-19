import { Test } from '@nestjs/testing';
import { MovimientoTokenRepository } from './movimiento-token.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('MovimientoTokenRepository', () => {
  let repository: MovimientoTokenRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MovimientoTokenRepository,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    repository = moduleRef.get(MovimientoTokenRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });
});
