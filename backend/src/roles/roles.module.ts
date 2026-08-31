import { Module } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [BlockchainModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
