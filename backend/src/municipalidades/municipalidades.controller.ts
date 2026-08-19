import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { MunicipalidadesService } from './municipalidades.service';
import { CreateMunicipalidadDto } from './dto/create-municipalidad.dto';
import { UpdateMunicipalidadDto } from './dto/update-municipalidad.dto';

/** Rutas HTTP de Municipalidad: solo delegan en el service. */
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
