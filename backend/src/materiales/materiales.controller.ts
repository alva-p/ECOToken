import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { MaterialesService } from './materiales.service';
import { CreateTipoMaterialDto } from './dto/create-tipo-material.dto';
import { UpdateTipoMaterialDto } from './dto/update-tipo-material.dto';

/** Rutas HTTP de TipoMaterial: solo delegan en el service. */
@Controller('materiales')
export class MaterialesController {
  constructor(private readonly service: MaterialesService) {}

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTipoMaterialDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
