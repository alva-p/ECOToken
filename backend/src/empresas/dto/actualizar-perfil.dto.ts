import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

/**
 * Campos que una empresa puede editar de su propio perfil ("Mi Perfil").
 * No incluye el CUIT (identidad fiscal) ni estado/categoría/verificación.
 */
export class ActualizarPerfilDto {
  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @IsEmail()
  emailContacto?: string;

  @IsOptional()
  @IsString()
  domicilio?: string;

  @IsOptional()
  @IsString()
  representanteLegal?: string;

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
}
