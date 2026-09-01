import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import { CategoriaEmpresa, TipoRol } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EmpresasService } from './empresas.service';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { RegistrarEmpresaDto } from './dto/registrar-empresa.dto';
import { AltaCooperativaDto } from './dto/alta-cooperativa.dto';

/** Rutas HTTP de Empresa: solo delegan en el service. */
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly service: EmpresasService) {}

  // ─── E3-HU01: registro público de empresa (queda en estado PENDIENTE) ───
  @Post('registro')
  registrar(@Body() dto: RegistrarEmpresaDto) {
    return this.service.registrar(dto);
  }

  // ─── E4-HU01: alta administrativa de cooperativa ───
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Post('cooperativas')
  altaCooperativa(@Body() dto: AltaCooperativaDto) {
    return this.service.altaCooperativa(dto);
  }

  // ─── E3-HU04: panel de administración (aprobar / rechazar altas) ───
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Get('pendientes')
  findPendientes() {
    return this.service.findPendientes();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Patch(':id/aprobar')
  aprobar(@Param('id') id: string) {
    return this.service.aprobar(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Patch(':id/rechazar')
  rechazar(@Param('id') id: string) {
    return this.service.rechazar(id);
  }

  // ─── E4-HU03: buscador de empresas (cooperativa, con autocompletado) ───
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.COOPERATIVA)
  @Get('buscar')
  buscar(@Query('q') q?: string) {
    return this.service.buscar(q ?? '');
  }

  // ─── Consulta, modificación y baja lógica (solo admin) ───
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Get()
  findAll(
    @Query('categoria', new ParseEnumPipe(CategoriaEmpresa, { optional: true }))
    categoria?: CategoriaEmpresa,
  ) {
    return this.service.findAll(categoria);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmpresaDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
