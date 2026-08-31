import { Module } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ContratoController } from './contrato.controller';
import { ContratoService } from './contrato.service';

@Module({
  imports: [BlockchainModule],
  controllers: [ContratoController],
  providers: [ContratoService],
})
export class ContratoModule {}
