import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PuntajesService } from './puntajes.service';
import { CreatePuntajeDto } from './dto/create-puntaje.dto';
import { UpdatePuntajeDto } from './dto/update-puntaje.dto';

/** Rutas HTTP de Puntaje: solo delegan en el service. */
@Controller('puntajes')
export class PuntajesController {
  constructor(private readonly service: PuntajesService) {}

  @Post()
  create(@Body() dto: CreatePuntajeDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdatePuntajeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
