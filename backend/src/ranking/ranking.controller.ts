import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TipoRol } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RankingService } from './ranking.service';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';
import { CerrarRankingDto } from './dto/cerrar-ranking.dto';
import { mesAnterior } from './ranking.scheduler';

/** Rutas HTTP de Ranking: solo delegan en el service. */
@Controller('ranking')
export class RankingController {
  constructor(private readonly service: RankingService) {}

  /**
   * Cierre manual del ranking (E7-HU02): mismo camino que corre el job
   * mensual, expuesto para poder cerrar un período puntual sin esperar al
   * cron (backfill, demo o reintento tras un cierre fallido).
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Post('cerrar')
  cerrar(@Body() dto: CerrarRankingDto) {
    const { mes, anio } =
      dto.mes && dto.anio
        ? { mes: dto.mes, anio: dto.anio }
        : mesAnterior(new Date());
    return this.service.cerrarRankingDelMes(mes, anio);
  }

  /**
   * Reintento de la emisión de certificados de un mes ya cerrado (E8-HU01):
   * para cuando el cierre corrió bien pero algún certificado quedó sin
   * emitir. No vuelve a cerrar el ranking (por eso no da 409 si ya está
   * cerrado) y es seguro repetirlo — devuelve cuántos se emitieron/fallaron.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Post('reemitir-certificados')
  reemitirCertificados(@Body() dto: CerrarRankingDto) {
    const { mes, anio } =
      dto.mes && dto.anio
        ? { mes: dto.mes, anio: dto.anio }
        : mesAnterior(new Date());
    return this.service.reemitirCertificados(mes, anio);
  }

  @Post()
  create(@Body() dto: CreateRankingDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRankingDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
