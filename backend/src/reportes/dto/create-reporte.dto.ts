import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';

/** Datos para generar un Reporte consolidado. */
export class CreateReporteDto {
  @IsString()
  @IsNotEmpty()
  periodo: string;

  @IsObject()
  datosConsolidados: Prisma.InputJsonValue;

  @IsString()
  @IsNotEmpty()
  creadorPor: string;

  @IsOptional()
  @IsString()
  empresaId?: string;
}
