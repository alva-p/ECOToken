import { PartialType } from '@nestjs/mapped-types';
import { CreateCertificadoDigitalDto } from './create-certificado-digital.dto';

/** Actualización de CertificadoDigital: todos los campos opcionales. */
export class UpdateCertificadoDigitalDto extends PartialType(
  CreateCertificadoDigitalDto,
) {}
