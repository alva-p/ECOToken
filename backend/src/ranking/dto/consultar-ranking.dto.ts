import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Parámetros de consulta para el ranking de un período puntual. */
export class ConsultarRankingDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El mes debe ser un número entero entre 1 y 12' })
  @Min(1, { message: 'El mes debe ser mayor o igual a 1' })
  @Max(12, { message: 'El mes debe ser menor o igual a 12' })
  mes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(2020, { message: 'El año mínimo es 2020' })
  @Max(2100, { message: 'El año máximo es 2100' })
  anio?: number;
}
