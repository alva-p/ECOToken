import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** Datos para registrar un MovimientoToken. */
export class CreateMovimientoTokenDto {
  @IsInt()
  cantidad: number;

  @IsOptional()
  @IsString()
  txHash?: string;

  @IsOptional()
  @IsInt()
  bloque?: number;

  @IsString()
  @IsNotEmpty()
  ingresoMaterialId: string;
}
