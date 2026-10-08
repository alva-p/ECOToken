import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

/** Cambio de contraseña del usuario logueado. */
export class CambiarPasswordDto {
  @IsString()
  @IsNotEmpty()
  passwordActual: string;

  @IsString()
  @MinLength(10, {
    message: 'La contraseña nueva debe tener al menos 10 caracteres',
  })
  @Matches(/[A-Za-z]/, {
    message: 'La contraseña nueva debe incluir una letra',
  })
  @Matches(/\d/, { message: 'La contraseña nueva debe incluir un número' })
  passwordNueva: string;
}
