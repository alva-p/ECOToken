import { Module } from '@nestjs/common';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingRepository } from './repository/ranking.repository';
import { RankingScheduler } from './ranking.scheduler';

@Module({
  controllers: [RankingController],
  providers: [RankingService, RankingRepository, RankingScheduler],
  exports: [RankingService, RankingScheduler],
})
export class RankingModule {}
