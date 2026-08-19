import { PartialType } from '@nestjs/mapped-types';
import { CreatePuntajeDto } from './create-puntaje.dto';

/** Actualización de Puntaje: todos los campos opcionales. */
export class UpdatePuntajeDto extends PartialType(CreatePuntajeDto) {}
