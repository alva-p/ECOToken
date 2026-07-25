import { PartialType } from '@nestjs/mapped-types';
import { CreateMovimientoTokenDto } from './create-movimiento-token.dto';

/** Actualización de MovimientoToken: todos los campos opcionales. */
export class UpdateMovimientoTokenDto extends PartialType(
  CreateMovimientoTokenDto,
) {}
