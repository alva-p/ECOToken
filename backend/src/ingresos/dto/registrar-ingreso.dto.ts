import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

/**
 * Datos que la cooperativa envía para registrar un ingreso de material (E5-HU01).
 * La cooperativa se toma del JWT (usuario autenticado); el estado inicial, el
 * cálculo de tokens y la acuñación los resuelve el backend.
 */
export class RegistrarIngresoDto {
  /** Empresa adherente (APROBADA) a la que se le acredita el aporte. */
  @IsString()
  @IsNotEmpty()
  empresaId: string;

  /** Tipo de material reciclable entregado. */
  @IsString()
  @IsNotEmpty()
  tipoMaterialId: string;

  /** Peso entregado, en kilogramos (mayor a cero). */
  @IsPositive()
  peso: number;
}
