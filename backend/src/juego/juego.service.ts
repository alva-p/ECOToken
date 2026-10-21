import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearPartidaDto } from './dto/crear-partida.dto';

const TOP = 100;

/** Ranking público del minijuego (/juego). */
@Injectable()
export class JuegoService {
  constructor(private readonly prisma: PrismaService) {}

  /** Mejores puntajes; a igual puntaje gana el que llegó primero. */
  ranking() {
    return this.prisma.partidaJuego.findMany({
      select: { nombre: true, puntaje: true, createdAt: true },
      orderBy: [{ puntaje: 'desc' }, { createdAt: 'asc' }],
      take: TOP,
    });
  }

  /** Guarda la partida y devuelve su posición (1-based) en el ranking. */
  async crear(dto: CrearPartidaDto) {
    const partida = await this.prisma.partidaJuego.create({ data: dto });
    // la nueva es la última en llegar: queda detrás de todas las de igual puntaje
    const posicion = await this.prisma.partidaJuego.count({
      where: { puntaje: { gte: partida.puntaje } },
    });
    return { posicion };
  }
}
