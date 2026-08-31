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
import { PuntajesService } from './puntajes.service';
import { CreatePuntajeDto } from './dto/create-puntaje.dto';
import { UpdatePuntajeDto } from './dto/update-puntaje.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/** Rutas HTTP de Puntaje (Tabla de conversión peso -> tokens ECO). */
@Controller('puntajes')
export class PuntajesController {
  constructor(private readonly service: PuntajesService) {}

  /** Obtiene la tabla completa de conversiones vigentes por tipo de material (RN-07). */
  @Get('vigentes')
  findVigentes() {
    return this.service.findVigentes();
  }

  /** Historial completo de puntajes/factores versionados. */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /** Alta o versionado de un factor de conversión. Protegido solo para ADMIN_ROLE (RN-08). */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  create(@Body() dto: CreatePuntajeDto) {
    return this.service.create(dto);
  }

  /** Modificación de un puntaje. Protegido solo para ADMIN_ROLE (RN-08). */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdatePuntajeDto) {
    return this.service.update(id, dto);
  }

  /** Eliminación de un puntaje. Protegido solo para ADMIN_ROLE (RN-08). */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
