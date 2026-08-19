import { Module } from '@nestjs/common';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';
import { EmpresaRepository } from './repository/empresa.repository';
import { BilleterasModule } from '../billeteras/billeteras.module';

@Module({
  imports: [BilleterasModule],
  controllers: [EmpresasController],
  providers: [EmpresasService, EmpresaRepository],
  exports: [EmpresasService],
})
export class EmpresasModule {}
