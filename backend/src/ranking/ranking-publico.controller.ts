import { Controller, Get, Query } from '@nestjs/common';
import { RankingPublicoService } from './ranking-publico.service';
import {
  PeriodosQueryDto,
  RankingPublicoQueryDto,
} from './dto/ranking-publico-query.dto';

/**
 * Rutas públicas (sin JWT) del ranking mensual cerrado (E7-HU03). Solo
 * delegan en el service. Se registra antes que `RankingController` en el
 * módulo para que `GET /ranking/:id` no capture la ruta `/ranking/publico`.
 */
@Controller('ranking/publico')
export class RankingPublicoController {
  constructor(private readonly service: RankingPublicoService) {}

  @Get('periodos')
  periodos(@Query() query: PeriodosQueryDto) {
    return this.service.periodos(query.limite);
  }

  @Get()
  obtener(@Query() query: RankingPublicoQueryDto) {
    return this.service.obtener(query.mes, query.anio);
  }
}
