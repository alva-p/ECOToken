import { Module } from '@nestjs/common';
import { JuegoController } from './juego.controller';
import { JuegoService } from './juego.service';

@Module({
  controllers: [JuegoController],
  providers: [JuegoService],
})
export class JuegoModule {}
