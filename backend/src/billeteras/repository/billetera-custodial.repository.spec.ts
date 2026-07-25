import { Test } from '@nestjs/testing';
import { BilleteraCustodialRepository } from './billetera-custodial.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('BilleteraCustodialRepository', () => {
  let repository: BilleteraCustodialRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        BilleteraCustodialRepository,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    repository = moduleRef.get(BilleteraCustodialRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });
});
