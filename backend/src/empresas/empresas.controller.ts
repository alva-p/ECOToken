import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { RegistrarEmpresaDto } from './dto/registrar-empresa.dto';

/** Rutas HTTP de Empresa: solo delegan en el service. */
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly service: EmpresasService) {}

  // ─── E3-HU01: registro público de empresa (queda en estado PENDIENTE) ───
  @Post('registro')
  registrar(@Body() dto: RegistrarEmpresaDto) {
    return this.service.registrar(dto);
  }

  // ─── E3-HU04: panel de administración (aprobar / rechazar altas) ───
  // NOTA (auth): estos endpoints deben ser exclusivos del rol ADMIN. La base de
  // auth (JWT + RBAC) se construye en E4-HU02; al llegar, proteger con:
  //   @UseGuards(JwtAuthGuard, RolesGuard) @Roles(TipoRol.ADMIN)

  // TODO(auth E4-HU02): @UseGuards(JwtAuthGuard, RolesGuard) @Roles(TipoRol.ADMIN)
  @Get('pendientes')
  findPendientes() {
    return this.service.findPendientes();
  }

  // TODO(auth E4-HU02): @UseGuards(JwtAuthGuard, RolesGuard) @Roles(TipoRol.ADMIN)
  @Patch(':id/aprobar')
  aprobar(@Param('id') id: string) {
    return this.service.aprobar(id);
  }

  // TODO(auth E4-HU02): @UseGuards(JwtAuthGuard, RolesGuard) @Roles(TipoRol.ADMIN)
  @Patch(':id/rechazar')
  rechazar(@Param('id') id: string) {
    return this.service.rechazar(id);
  }

  // ─── CRUD genérico (interno / admin) ───
  @Post()
  create(@Body() dto: CreateEmpresaDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateEmpresaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
