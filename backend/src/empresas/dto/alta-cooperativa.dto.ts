import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsCuit } from '../../common/decorators/is-cuit.decorator';

/**
 * Datos del formulario de alta de cooperativa (E4-HU01), a cargo del
 * administrador. A diferencia de `RegistrarEmpresaDto` (alta pública de una
 * empresa adherida, E3-HU01), esta alta es un acto administrativo directo:
 * la cooperativa queda `APROBADA` y `activa` de inmediato (no pasa por el
 * flujo de aprobación de E3-HU04), y además dispara la generación de su
 * cuenta operadora on-chain (VALIDATOR_ROLE) y sus credenciales de acceso.
 */
export class AltaCooperativaDto {
  @IsString()
  @IsNotEmpty()
  razonSocial: string;

  @IsCuit()
  cuit: string;

  // También es el email con el que la cooperativa inicia sesión (E4-HU02).
  @IsEmail()
  emailContacto: string;

  @IsOptional()
  @IsString()
  domicilio?: string;

  @IsOptional()
  @IsString()
  representanteLegal?: string;
}
