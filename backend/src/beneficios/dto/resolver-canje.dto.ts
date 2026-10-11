import { IsIn } from 'class-validator';

/** La municipalidad aprueba o rechaza una solicitud de canje pendiente. */
export class ResolverCanjeDto {
  @IsIn(['APROBADO', 'RECHAZADO'])
  estado: 'APROBADO' | 'RECHAZADO';
}
