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
import { MaterialesService } from './materiales.service';
import { CreateTipoMaterialDto } from './dto/create-tipo-material.dto';
import { UpdateTipoMaterialDto } from './dto/update-tipo-material.dto';

/** Rutas HTTP de TipoMaterial: solo delegan en el service. */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('materiales')
export class MaterialesController {
  constructor(private readonly service: MaterialesService) {}

  @Roles(TipoRol.ADMIN)
  @Post()
  create(@Body() dto: CreateTipoMaterialDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateTipoMaterialDto) {
    return this.service.update(id, dto);
  }

  @Roles(TipoRol.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
