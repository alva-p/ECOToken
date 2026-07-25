import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoMaterialDto } from './create-tipo-material.dto';

/** Actualización de TipoMaterial: todos los campos opcionales. */
export class UpdateTipoMaterialDto extends PartialType(CreateTipoMaterialDto) {}
