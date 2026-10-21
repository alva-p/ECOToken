import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JuegoService } from './juego.service';
import { CrearPartidaDto } from './dto/crear-partida.dto';

/** Rutas públicas (sin JWT) del minijuego. */
@UseGuards(ThrottlerGuard)
@Controller('juego')
export class JuegoController {
  constructor(private readonly service: JuegoService) {}

  @Get('ranking')
  ranking() {
    return this.service.ranking();
  }

  // Una partida dura ~2 min: 10/min por IP alcanza para el stand (todos salen
  // por la misma IP) y frena el spam de puntajes.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('partidas')
  crear(@Body() dto: CrearPartidaDto) {
    return this.service.crear(dto);
  }
}
