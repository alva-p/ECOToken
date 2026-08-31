import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TipoRol } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportesService } from './reportes.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';

/** Rutas HTTP de Reporte: solo delegan en el service. */
@Controller('reportes')
export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  // ─── E9-HU02: volumen reciclado por canal empresarial ───
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.MUNICIPALIDAD, TipoRol.ADMIN)
  @Get('volumen')
  volumen(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.service.obtenerVolumenPorPeriodo({ desde, hasta });
  }

  @Post()
  create(@Body() dto: CreateReporteDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateReporteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
