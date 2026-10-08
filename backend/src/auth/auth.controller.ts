import {
  Body,
  Controller,
  HttpCode,
  UseGuards,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { JwtPayload } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { LoginDto } from './dto/login.dto';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 5 intentos/min por IP: frena fuerza bruta contra el login
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // Cambio de contraseña del usuario logueado (obligatorio con la temporal).
  // Mismo límite que el login: la actual se podría adivinar por fuerza bruta.
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('cambiar-password')
  @HttpCode(HttpStatus.OK)
  cambiarPassword(
    @Body() dto: CambiarPasswordDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.authService.cambiarPassword(
      user.sub,
      dto.passwordActual,
      dto.passwordNueva,
    );
  }
}
