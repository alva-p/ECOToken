import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

/** Datos para registrar un IngresoMaterial (aporte de material de una empresa). */
export class CreateIngresoMaterialDto {
  @IsNumber()
  peso: number;

  @IsOptional()
  @IsInt()
  tokensAcumulados?: number;

  @IsString()
  @IsNotEmpty()
  empresaId: string;

  @IsString()
  @IsNotEmpty()
  tipoMaterialId: string;

  @IsString()
  @IsNotEmpty()
  estadoId: string;
}
