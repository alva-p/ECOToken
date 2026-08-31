import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TipoRol } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ContratoService } from './contrato.service';
import { PausarContratoDto } from './dto/pausar-contrato.dto';

/** Panel de administración del contrato: pausa/despausa con motivo (E10-HU02). */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TipoRol.ADMIN)
@Controller('admin/contrato')
export class ContratoController {
  constructor(private readonly service: ContratoService) {}

  @Get('estado')
  estado() {
    return this.service.estado();
  }

  @Post('pausar')
  pausar(@Body() dto: PausarContratoDto, @CurrentUser() user: JwtPayload) {
    return this.service.pausar(dto.motivo, user.email);
  }

  @Post('despausar')
  despausar(@Body() dto: PausarContratoDto, @CurrentUser() user: JwtPayload) {
    return this.service.despausar(dto.motivo, user.email);
  }
}
