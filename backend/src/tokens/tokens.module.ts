import { Module } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';
import { MovimientoTokenRepository } from './repository/movimiento-token.repository';

@Module({
  imports: [BlockchainModule],
  controllers: [TokensController],
  providers: [TokensService, MovimientoTokenRepository],
  exports: [TokensService],
})
export class TokensModule {}
