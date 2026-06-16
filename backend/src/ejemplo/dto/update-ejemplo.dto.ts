import { PartialType } from '@nestjs/mapped-types';
import { CreateEjemploDto } from './create-ejemplo.dto';

/** Plantilla de DTO de actualización: todos los campos opcionales. */
export class UpdateEjemploDto extends PartialType(CreateEjemploDto) {}
