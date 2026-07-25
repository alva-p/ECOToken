import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaDto } from './create-empresa.dto';

/** Actualización de Empresa: todos los campos opcionales. */
export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {}
