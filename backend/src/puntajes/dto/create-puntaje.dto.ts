import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/** Datos para dar de alta un Puntaje (configuración de tokens por kilo de material). */
export class CreatePuntajeDto {
  @IsDateString()
  fechaDesde: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsString()
  @IsNotEmpty()
  versionConfig: string;

  @IsString()
  @IsNotEmpty()
  cantidadPorKilo: string;

  @IsString()
  @IsNotEmpty()
  tipoMaterialId: string;
}
