import { IsNotEmpty, IsString } from 'class-validator';

/** Datos para dar de alta una Municipalidad. */
export class CreateMunicipalidadDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  ciudad: string;
}
