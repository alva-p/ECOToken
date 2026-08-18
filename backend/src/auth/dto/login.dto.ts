import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/** Credenciales del login (E4-HU02). */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
