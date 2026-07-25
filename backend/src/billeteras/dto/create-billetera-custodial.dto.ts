import { IsNotEmpty, IsString } from 'class-validator';

/** Datos para dar de alta una BilleteraCustodial. */
export class CreateBilleteraCustodialDto {
  @IsString()
  @IsNotEmpty()
  direccionEVM: string;

  // Dato sensible: debe llegar YA cifrado; nunca en claro ni en logs.
  @IsString()
  @IsNotEmpty()
  clavePrivadaCifrada: string;

  @IsString()
  @IsNotEmpty()
  tipoRolOnChain: string;

  @IsString()
  @IsNotEmpty()
  empresaId: string;
}
