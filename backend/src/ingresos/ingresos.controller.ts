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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { IngresosService } from './ingresos.service';
import { CreateIngresoMaterialDto } from './dto/create-ingreso-material.dto';
import { UpdateIngresoMaterialDto } from './dto/update-ingreso-material.dto';
import { RegistrarIngresoDto } from './dto/registrar-ingreso.dto';

/** Rutas HTTP de IngresoMaterial: solo delegan en el service. */
@Controller('ingresos')
export class IngresosController {
  constructor(private readonly service: IngresosService) {}

  // ─── E5-HU01: registro de ingreso por la cooperativa ───
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.COOPERATIVA)
  @Post('registro')
  registrar(@Body() dto: RegistrarIngresoDto, @CurrentUser() user: JwtPayload) {
    return this.service.registrar(dto, user.empresaId);
  }

  // ─── E5-HU01: reintento de acuñación de un ingreso pendiente ───
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.COOPERATIVA)
  @Post(':id/acunar')
  reintentarAcunacion(@Param('id') id: string) {
    return this.service.reintentarAcunacion(id);
  }

  // ─── CRUD genérico (interno / admin) ───
  @Post()
  create(@Body() dto: CreateIngresoMaterialDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateIngresoMaterialDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
