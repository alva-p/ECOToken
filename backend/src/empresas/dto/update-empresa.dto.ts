import { PartialType } from '@nestjs/mapped-types';
import { AltaCooperativaDto } from './alta-cooperativa.dto';

/** Datos básicos editables por el administrador. */
export class UpdateEmpresaDto extends PartialType(AltaCooperativaDto) {}
