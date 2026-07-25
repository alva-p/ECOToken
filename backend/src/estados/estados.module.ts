import { Module } from '@nestjs/common';
import { EstadosController } from './estados.controller';
import { EstadosService } from './estados.service';
import { EstadoRepository } from './repository/estado.repository';

@Module({
  controllers: [EstadosController],
  providers: [EstadosService, EstadoRepository],
  exports: [EstadosService],
})
export class EstadosModule {}
