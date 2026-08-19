import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TipoRol } from '@prisma/client';

/** Datos para dar de alta un Usuario. */
export class CreateUsuarioDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  // El hasheo real se hará en el módulo auth; acá se recibe la contraseña ya hasheada.
  @IsString()
  @IsNotEmpty()
  passwordHash: string;

  @IsEnum(TipoRol)
  tipoRol: TipoRol;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  empresaId?: string;

  @IsOptional()
  @IsString()
  municipalidadId?: string;
}
