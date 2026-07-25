import { PartialType } from '@nestjs/mapped-types';
import { CreateReporteDto } from './create-reporte.dto';

/** Actualización de Reporte: todos los campos opcionales. */
export class UpdateReporteDto extends PartialType(CreateReporteDto) {}
