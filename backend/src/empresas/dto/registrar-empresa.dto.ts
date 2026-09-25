import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
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

  // E3-HU05: datos formales ampliados del registro (todos opcionales; el
  // registro básico se completa sin ellos). La "dirección legal" se cubre con
  // `domicilio` y el "identificador fiscal" con `cuit`.
  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsUrl({}, { message: 'El sitio web debe ser una URL válida' })
  sitioWeb?: string;

  @IsOptional()
  @IsString()
  codigoPostal?: string;

  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  // E3-HU03: aceptación obligatoria de términos y condiciones.
  @IsBoolean()
  aceptaTerminos: boolean;

  @IsString()
  @IsNotEmpty()
  versionTerminos: string;
}
