import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TipoRol } from '@prisma/client';

/**
 * Alta administrativa de un Usuario (gestión de usuarios del panel admin).
 * A diferencia de CreateUsuarioDto, NO recibe la contraseña: el sistema genera
 * una temporal, la hashea y fuerza su cambio en el primer ingreso.
 */
export class AltaUsuarioDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(TipoRol)
  tipoRol: TipoRol;

  @IsOptional()
  @IsString()
  empresaId?: string;

  @IsOptional()
  @IsString()
  municipalidadId?: string;
}
