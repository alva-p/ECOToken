import { Test } from '@nestjs/testing';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';

describe('RankingController', () => {
  let controller: RankingController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RankingController],
      providers: [{ provide: RankingService, useValue: {} }],
    }).compile();

    controller = moduleRef.get(RankingController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});
