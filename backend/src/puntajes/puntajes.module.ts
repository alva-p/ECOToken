import { Module } from '@nestjs/common';
import { PuntajesController } from './puntajes.controller';
import { PuntajesService } from './puntajes.service';
import { PuntajeRepository } from './repository/puntaje.repository';

@Module({
  controllers: [PuntajesController],
  providers: [PuntajesService, PuntajeRepository],
  exports: [PuntajesService],
})
export class PuntajesModule {}
