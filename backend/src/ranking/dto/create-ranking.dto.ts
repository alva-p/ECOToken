import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

/** Datos para dar de alta un Ranking de un período (mes/anio). */
export class CreateRankingDto {
  @IsInt()
  mes: number;

  @IsInt()
  anio: number;

  @IsOptional()
  @IsDateString()
  fechaCierre?: string;

  @IsOptional()
  @IsString()
  hashSnapshot?: string;

  @IsOptional()
  @IsInt()
  bloqueReferencia?: number;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  empresaId?: string;
}
