import { Module } from '@nestjs/common';
import { EjemploController } from './ejemplo.controller';
import { EjemploService } from './ejemplo.service';
import { EjemploRepository } from './repository/ejemplo.repository';

@Module({
  controllers: [EjemploController],
  providers: [EjemploService, EjemploRepository],
  exports: [EjemploService],
})
export class EjemploModule {}
