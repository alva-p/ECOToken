import { Module } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingScheduler } from './ranking.scheduler';
import { RankingRepository } from './repository/ranking.repository';

@Module({
  imports: [BlockchainModule],
  controllers: [RankingController],
  providers: [RankingService, RankingRepository, RankingScheduler],
  exports: [RankingService, RankingScheduler],
})
export class RankingModule {}
