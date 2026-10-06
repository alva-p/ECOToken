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
import { MunicipalidadesService } from './municipalidades.service';
import { CreateMunicipalidadDto } from './dto/create-municipalidad.dto';
import { UpdateMunicipalidadDto } from './dto/update-municipalidad.dto';

/** Rutas HTTP de Municipalidad: solo delegan en el service. */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TipoRol.ADMIN)
@Controller('municipalidades')
export class MunicipalidadesController {
  constructor(private readonly service: MunicipalidadesService) {}

  @Post()
  create(@Body() dto: CreateMunicipalidadDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateMunicipalidadDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
