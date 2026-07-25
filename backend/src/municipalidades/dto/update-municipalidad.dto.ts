import { PartialType } from '@nestjs/mapped-types';
import { CreateMunicipalidadDto } from './create-municipalidad.dto';

/** Actualización de Municipalidad: todos los campos opcionales. */
export class UpdateMunicipalidadDto extends PartialType(
  CreateMunicipalidadDto,
) {}
