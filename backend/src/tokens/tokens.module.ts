import { Module } from '@nestjs/common';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';
import { MovimientoTokenRepository } from './repository/movimiento-token.repository';

@Module({
  controllers: [TokensController],
  providers: [TokensService, MovimientoTokenRepository],
  exports: [TokensService],
})
export class TokensModule {}
