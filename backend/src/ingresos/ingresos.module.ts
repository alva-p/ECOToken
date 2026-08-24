import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmpresasModule } from '../empresas/empresas.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { IngresosController } from './ingresos.controller';
import { IngresosService } from './ingresos.service';
import { IngresoMaterialRepository } from './repository/ingreso-material.repository';

@Module({
  imports: [AuthModule, EmpresasModule, BlockchainModule],
  controllers: [IngresosController],
  providers: [IngresosService, IngresoMaterialRepository],
  exports: [IngresosService],
})
export class IngresosModule {}
