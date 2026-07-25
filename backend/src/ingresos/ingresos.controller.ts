import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { IngresosService } from './ingresos.service';
import { CreateIngresoMaterialDto } from './dto/create-ingreso-material.dto';
import { UpdateIngresoMaterialDto } from './dto/update-ingreso-material.dto';

/** Rutas HTTP de IngresoMaterial: solo delegan en el service. */
@Controller('ingresos')
export class IngresosController {
  constructor(private readonly service: IngresosService) {}

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
