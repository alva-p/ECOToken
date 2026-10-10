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

/** Rutas HTTP de Beneficio: las administra la municipalidad. */
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBeneficioDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
