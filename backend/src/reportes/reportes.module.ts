import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { ReporteRepository } from './repository/reporte.repository';

@Module({
  controllers: [ReportesController],
  providers: [ReportesService, ReporteRepository],
  exports: [ReportesService],
})
export class ReportesModule {}
