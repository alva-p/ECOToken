import { Module } from '@nestjs/common';
import { MunicipalidadesController } from './municipalidades.controller';
import { MunicipalidadesService } from './municipalidades.service';
import { MunicipalidadRepository } from './repository/municipalidad.repository';

@Module({
  controllers: [MunicipalidadesController],
  providers: [MunicipalidadesService, MunicipalidadRepository],
  exports: [MunicipalidadesService],
})
export class MunicipalidadesModule {}
