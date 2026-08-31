import { IsNotEmpty, IsString } from 'class-validator';

/** Motivo obligatorio de una pausa/despausa del contrato (E10-HU02). */
export class PausarContratoDto {
  @IsString()
  @IsNotEmpty()
  motivo: string;
}
