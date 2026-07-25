import { PartialType } from '@nestjs/mapped-types';
import { CreateBilleteraCustodialDto } from './create-billetera-custodial.dto';

/** Actualización de BilleteraCustodial: todos los campos opcionales. */
export class UpdateBilleteraCustodialDto extends PartialType(
  CreateBilleteraCustodialDto,
) {}
