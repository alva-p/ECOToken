import { Test } from '@nestjs/testing';
import { RankingRepository } from './ranking.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('RankingRepository', () => {
  let repository: RankingRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RankingRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    repository = moduleRef.get(RankingRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });
});
