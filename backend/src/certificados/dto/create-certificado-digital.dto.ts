import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import type { Prisma } from '@prisma/client';

/** Datos para emitir un CertificadoDigital. */
export class CreateCertificadoDigitalDto {
  @IsInt()
  mes: number;

  @IsInt()
  anio: number;

  @IsInt()
  posicion: number;

  @IsInt()
  totalEmpresas: number;

  @IsNumber()
  kgReciclados: number;

  @IsNumber()
  co2Evitado: number;

  @IsArray()
  desglosePorMaterial: Prisma.InputJsonValue;

  @IsString()
  @IsNotEmpty()
  hashVerificacion: string;

  @IsString()
  @IsNotEmpty()
  credencialFirmada: string;

  @IsOptional()
  @IsString()
  urlPDF?: string;

  @IsOptional()
  @IsString()
  txHashOnChain?: string;

  @IsString()
  @IsNotEmpty()
  empresaId: string;
}
