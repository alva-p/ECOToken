import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CategoriaEmpresa } from '@prisma/client';

/** Datos para dar de alta una Empresa (o cooperativa, según categoria). */
export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty()
  razonSocial: string;

  @IsString()
  @IsNotEmpty()
  cuit: string;

  @IsOptional()
  @IsString()
  domicilio?: string;

  @IsOptional()
  @IsString()
  representanteLegal?: string;

  @IsOptional()
  @IsEmail()
  emailContacto?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsEnum(CategoriaEmpresa)
  categoria?: CategoriaEmpresa;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  datosContacto?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
