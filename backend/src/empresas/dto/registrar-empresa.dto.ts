import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsCuit } from '../../common/decorators/is-cuit.decorator';

/**
 * Datos del formulario público de registro de empresa (E3-HU01).
 * La empresa queda en estado PENDIENTE; el `estado`/`categoria`/`activa`
 * NO se aceptan del cliente (los gestiona el flujo de aprobación, E3-HU04).
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
}
