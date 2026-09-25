import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  StreamableFile,
} from '@nestjs/common';
import { TipoRol } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
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

  // ─── E8-HU02: certificados propios de la empresa logueada ───
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.EMPRESA)
  @Get('mios')
  misCertificados(@CurrentUser() user: JwtPayload) {
    return this.service.misCertificados(user.empresaId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.EMPRESA)
  @Get(':id/pdf')
  async pdf(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const buffer = await this.service.obtenerPdf(id, user.empresaId);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="certificado-${id}.pdf"`,
    });
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
