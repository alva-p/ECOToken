import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TipoRol } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { TokensService } from './tokens.service';
import { CreateMovimientoTokenDto } from './dto/create-movimiento-token.dto';
import { UpdateMovimientoTokenDto } from './dto/update-movimiento-token.dto';

/** Rutas HTTP de MovimientoToken: solo delegan en el service. */
@Controller('tokens')
export class TokensController {
  constructor(private readonly service: TokensService) {}

  // ─── E6-HU01: saldo de la empresa logueada ───
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.EMPRESA)
  @Get('mi-saldo')
  miSaldo(@CurrentUser() user: JwtPayload) {
    return this.service.miSaldo(user.empresaId);
  }

  @Post()
  create(@Body() dto: CreateMovimientoTokenDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateMovimientoTokenDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
