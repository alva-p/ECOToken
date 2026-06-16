import { IsNotEmpty, IsString } from 'class-validator';

/** Plantilla de DTO de creación: validación de entrada con class-validator. */
export class CreateEjemploDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
