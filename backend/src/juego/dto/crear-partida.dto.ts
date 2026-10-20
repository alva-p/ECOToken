import { Transform } from 'class-transformer';
import { IsInt, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

/** Partida terminada del minijuego. Mismas reglas de nombre que el juego. */
export class CrearPartidaDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.normalize('NFC').trim() : value,
  )
  @IsString()
  @MaxLength(30)
  @Matches(/^[\p{L}\p{M}\p{N} ]+$/u, {
    message: 'El nombre solo admite letras, números y espacios',
  })
  nombre: string;

  // ponytail: el puntaje lo calcula el navegador, así que se puede falsear con
  // un POST a mano; el tope corta lo absurdo (una partida muy buena ≈ 12k).
  // Si hace falta más, firmar la partida o validar el desglose en el server.
  @IsInt()
  @Min(0)
  @Max(30_000)
  puntaje: number;
}
