import { Module } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { CertificadosModule } from '../certificados/certificados.module';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingScheduler } from './ranking.scheduler';
import { RankingRepository } from './repository/ranking.repository';

@Module({
  imports: [BlockchainModule, CertificadosModule],
  controllers: [RankingController],
  providers: [RankingService, RankingRepository, RankingScheduler],
  exports: [RankingService],
})
export class RankingModule {}
