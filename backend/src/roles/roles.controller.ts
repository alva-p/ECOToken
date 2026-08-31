import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TipoRol } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesService } from './roles.service';
import { OtorgarRolDto } from './dto/otorgar-rol.dto';

/** Panel de administración de roles on-chain (E10-HU01). */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TipoRol.ADMIN)
@Controller('admin/roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get('cuentas')
  listarCuentas() {
    return this.service.listarCuentas();
  }

  // Devuelven { txHash } (no el string pelado) para que la respuesta sea
  // JSON válido sin depender de cómo Nest serialice un primitivo.
  @Post('otorgar')
  async otorgar(@Body() dto: OtorgarRolDto) {
    const txHash = await this.service.otorgar(dto.direccionEVM, dto.rol);
    return { txHash };
  }

  @Post('revocar')
  async revocar(@Body() dto: OtorgarRolDto) {
    const txHash = await this.service.revocar(dto.direccionEVM, dto.rol);
    return { txHash };
  }
}
