import { PartialType } from '@nestjs/mapped-types';
import { CreateIngresoMaterialDto } from './create-ingreso-material.dto';

/** Actualización de IngresoMaterial: todos los campos opcionales. */
export class UpdateIngresoMaterialDto extends PartialType(
  CreateIngresoMaterialDto,
) {}
