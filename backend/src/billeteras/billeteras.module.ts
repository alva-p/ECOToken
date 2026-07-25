import { Module } from '@nestjs/common';
import { BilleterasController } from './billeteras.controller';
import { BilleterasService } from './billeteras.service';
import { BilleteraCustodialRepository } from './repository/billetera-custodial.repository';

@Module({
  controllers: [BilleterasController],
  providers: [BilleterasService, BilleteraCustodialRepository],
  exports: [BilleterasService],
})
export class BilleterasModule {}
