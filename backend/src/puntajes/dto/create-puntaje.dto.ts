import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/** Datos para dar de alta o versionar un Puntaje (conversión peso -> tokens por kilo de material). */
export class CreatePuntajeDto {
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsString()
  versionConfig?: string;

  @IsString()
  @IsNotEmpty()
  cantidadPorKilo: string;

  @IsString()
  @IsNotEmpty()
  tipoMaterialId: string;
}
