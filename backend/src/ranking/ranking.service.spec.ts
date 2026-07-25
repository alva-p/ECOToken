import { Test } from '@nestjs/testing';
import { RankingService } from './ranking.service';
import { RankingRepository } from './repository/ranking.repository';

describe('RankingService', () => {
  let service: RankingService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RankingService, { provide: RankingRepository, useValue: {} }],
    }).compile();

    service = moduleRef.get(RankingService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
