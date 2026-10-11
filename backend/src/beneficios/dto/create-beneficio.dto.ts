import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const TIPOS_BENEFICIO = ['WEB', 'PANTALLAS', 'OTRO'] as const;

/** Datos para publicar un premio o beneficio canjeable con tokens ECO. */
export class CreateBeneficioDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsIn(TIPOS_BENEFICIO)
  tipo: (typeof TIPOS_BENEFICIO)[number];

  @IsInt()
  @Min(1)
  costoTokens: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  cupos?: number;

  @IsOptional()
  @IsDateString()
  vigenteHasta?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
