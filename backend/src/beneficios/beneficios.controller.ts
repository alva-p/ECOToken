import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TipoRol } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BeneficiosService } from './beneficios.service';
import { CreateBeneficioDto } from './dto/create-beneficio.dto';
import { UpdateBeneficioDto } from './dto/update-beneficio.dto';
import { ResolverCanjeDto } from './dto/resolver-canje.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

/**
 * Rutas HTTP de Beneficio: las administra la municipalidad; las organizaciones
 * (rol EMPRESA, override por método) consultan el catálogo y solicitan canjes.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TipoRol.MUNICIPALIDAD, TipoRol.ADMIN)
@Controller('beneficios')
export class BeneficiosController {
  constructor(private readonly service: BeneficiosService) {}

  @Post()
  create(@Body() dto: CreateBeneficioDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  // ─── Organización ───

  @Roles(TipoRol.EMPRESA)
  @Get('organizacion')
  paraOrganizacion(@CurrentUser() user: JwtPayload) {
    return this.service.paraOrganizacion(user.empresaId);
  }

  @Roles(TipoRol.EMPRESA)
  @Post(':id/canjear')
  canjear(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.service.canjear(user.empresaId, id);
  }

  // ─── Solicitudes de canje (municipalidad) ───

  @Get('canjes')
  listarCanjes() {
    return this.service.listarCanjes();
  }

  @Patch('canjes/:id')
  resolverCanje(@Param('id') id: string, @Body() dto: ResolverCanjeDto) {
    return this.service.resolverCanje(id, dto.estado);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBeneficioDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
