import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { RankingService } from './ranking.service';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';
import { ConsultarRankingDto } from './dto/consultar-ranking.dto';
import { RankingMesResponse } from './interfaces/ranking-resultado.interface';

/** Rutas HTTP de Ranking: solo delegan en el service. */
@Controller('ranking')
export class RankingController {
  constructor(private readonly service: RankingService) {}

  /**
   * Obtiene el ranking de empresas del mes en curso ordenadas por tokens acuñados (E7-HU01).
   * Disponible vía API para consulta institucional, empresas o público general.
   * Permite consultar opcionalmente por query params ?mes=X&anio=Y.
   */
  @Get('actual')
  obtenerRankingActual(
    @Query() query: ConsultarRankingDto,
  ): Promise<RankingMesResponse> {
    return this.service.obtenerRankingMesActual(query.mes, query.anio);
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
