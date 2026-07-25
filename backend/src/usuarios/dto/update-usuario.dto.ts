import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';

/** Actualización de Usuario: todos los campos opcionales. */
export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
