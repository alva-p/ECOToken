import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** Datos para dar de alta un TipoMaterial. */
export class CreateTipoMaterialDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
