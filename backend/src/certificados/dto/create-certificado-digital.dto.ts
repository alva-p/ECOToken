import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** Datos para emitir un CertificadoDigital. */
export class CreateCertificadoDigitalDto {
  @IsString()
  @IsNotEmpty()
  hashVerificacion: string;

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
