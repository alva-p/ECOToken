import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CategoriaEmpresa } from '@prisma/client';
import { IsCuit } from '../../common/decorators/is-cuit.decorator';

/**
 * Alta genérica de Empresa (CRUD interno/admin). El `estado` NO se setea acá:
 * lo gestiona el flujo de aprobación (E3-HU04) y arranca en PENDIENTE por default.
 */
export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty()
  razonSocial: string;

  @IsCuit()
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
