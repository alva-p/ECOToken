import { Module } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { CertificadosModule } from '../certificados/certificados.module';
import { RankingController } from './ranking.controller';
import { RankingPublicoController } from './ranking-publico.controller';
import { RankingService } from './ranking.service';
import { RankingPublicoService } from './ranking-publico.service';
import { RankingScheduler } from './ranking.scheduler';
import { RankingRepository } from './repository/ranking.repository';
import { RankingPublicoRepository } from './repository/ranking-publico.repository';

@Module({
  imports: [BlockchainModule, CertificadosModule],
  // El controller público va primero: /ranking/publico no debe caer en /ranking/:id.
  controllers: [RankingPublicoController, RankingController],
  providers: [
    RankingService,
    RankingRepository,
    RankingScheduler,
    RankingPublicoService,
    RankingPublicoRepository,
  ],
  exports: [RankingService, RankingScheduler],
})
export class RankingModule {}
