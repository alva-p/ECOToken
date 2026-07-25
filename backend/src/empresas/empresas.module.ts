import { Module } from '@nestjs/common';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';
import { EmpresaRepository } from './repository/empresa.repository';

@Module({
  controllers: [EmpresasController],
  providers: [EmpresasService, EmpresaRepository],
  exports: [EmpresasService],
})
export class EmpresasModule {}
