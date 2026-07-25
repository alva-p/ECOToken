import { Module } from '@nestjs/common';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingRepository } from './repository/ranking.repository';

@Module({
  controllers: [RankingController],
  providers: [RankingService, RankingRepository],
  exports: [RankingService],
})
export class RankingModule {}
