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
import { EjemploService } from './ejemplo.service';
import { CreateEjemploDto } from './dto/create-ejemplo.dto';
import { UpdateEjemploDto } from './dto/update-ejemplo.dto';

/** Plantilla de controller: solo define rutas HTTP y delega en el service. */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TipoRol.ADMIN)
@Controller('ejemplo')
export class EjemploController {
  constructor(private readonly service: EjemploService) {}

  @Post()
  create(@Body() dto: CreateEjemploDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateEjemploDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
