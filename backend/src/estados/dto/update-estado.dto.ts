import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadoDto } from './create-estado.dto';

/** Actualización de Estado: todos los campos opcionales. */
export class UpdateEstadoDto extends PartialType(CreateEstadoDto) {}
