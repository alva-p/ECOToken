import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CertificadosService } from './certificados.service';
import { CreateCertificadoDigitalDto } from './dto/create-certificado-digital.dto';
import { UpdateCertificadoDigitalDto } from './dto/update-certificado-digital.dto';

/** Rutas HTTP de CertificadoDigital: solo delegan en el service. */
@Controller('certificados')
export class CertificadosController {
  constructor(private readonly service: CertificadosService) {}

  @Post()
  create(@Body() dto: CreateCertificadoDigitalDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCertificadoDigitalDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
