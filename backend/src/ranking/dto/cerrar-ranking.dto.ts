import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Período a cerrar (E7-HU02). Opcional: sin body, el service cierra el mes
 * calendario anterior al actual (el mismo criterio que usa el job mensual).
 */
export class CerrarRankingDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  mes?: number;

  @IsOptional()
  @IsInt()
  @Min(2000)
  anio?: number;
}
