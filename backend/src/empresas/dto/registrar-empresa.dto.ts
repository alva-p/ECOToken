import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsCuit } from '../../common/decorators/is-cuit.decorator';

/**
 * Datos del formulario público de registro de empresa (E3-HU01 + E3-HU03).
 * La empresa queda en estado PENDIENTE; el estado/categoria/activa NO se
 * aceptan del cliente. Incluye la aceptación obligatoria de términos y
 * condiciones (E3-HU03), que se persiste con su versión y timestamp.
 */
export class RegistrarEmpresaDto {
  @IsString()
  @IsNotEmpty()
  razonSocial: string;

  @IsCuit()
  cuit: string;

  @IsEmail()
  emailContacto: string;

  @IsOptional()
  @IsString()
  domicilio?: string;

  @IsOptional()
  @IsString()
  representanteLegal?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  datosContacto?: string;

  // E3-HU03: aceptación obligatoria de términos y condiciones.
  @IsBoolean()
  aceptaTerminos: boolean;

  @IsString()
  @IsNotEmpty()
  versionTerminos: string;
}
