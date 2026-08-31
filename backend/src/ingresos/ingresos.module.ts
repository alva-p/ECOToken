import { Module } from '@nestjs/common';
import { IngresosController } from './ingresos.controller';
import { IngresosService } from './ingresos.service';
import { IngresoMaterialRepository } from './repository/ingreso-material.repository';
import { PuntajesModule } from '../puntajes/puntajes.module';

@Module({
  imports: [PuntajesModule],
  controllers: [IngresosController],
  providers: [IngresosService, IngresoMaterialRepository],
  exports: [IngresosService],
})
export class IngresosModule {}
