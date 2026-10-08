import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TipoRol } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
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

  /** Posición de la empresa logueada (requiere sesión de empresa). */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.EMPRESA)
  @Get('mio')
  miPosicion(
    @Query() query: RankingPublicoQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.miPosicion(user.empresaId, query.mes, query.anio);
  }

  @Get()
  obtener(@Query() query: RankingPublicoQueryDto) {
    return this.service.obtener(query.mes, query.anio);
  }
}
