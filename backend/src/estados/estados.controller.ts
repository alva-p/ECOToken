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
import { EstadosService } from './estados.service';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

/** Rutas HTTP de Estado: solo delegan en el service. */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('estados')
export class EstadosController {
  constructor(private readonly service: EstadosService) {}

  @Roles(TipoRol.ADMIN)
  @Post()
  create(@Body() dto: CreateEstadoDto) {
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

  @Roles(TipoRol.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEstadoDto) {
    return this.service.update(id, dto);
  }

  @Roles(TipoRol.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
