import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** Datos para dar de alta un Estado. */
export class CreateEstadoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
