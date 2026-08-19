import { Injectable, NotFoundException } from '@nestjs/common';
import { RankingRepository } from './repository/ranking.repository';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';

/** Lógica de negocio de Ranking. */
@Injectable()
export class RankingService {
  constructor(private readonly repository: RankingRepository) {}

  create(dto: CreateRankingDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const ranking = await this.repository.findById(id);
    if (!ranking) throw new NotFoundException(`Ranking ${id} no encontrado`);
    return ranking;
  }

  async update(id: string, dto: UpdateRankingDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }

  // ─── Métodos de negocio del diagrama de clases (stubs — completar en próximos sprints) ───

  /** Puntaje acumulado de la empresa en este ranking. */
  async consultarPuntaje(id: string): Promise<number> {
    await this.findOne(id);
    // TODO: calcular el puntaje de la empresa en el ranking.
    return 0;
  }

  /** Construye la grilla del ranking del período. */
  async armarGrilla(mes: number, anio: number): Promise<void> {
    // TODO: construir la grilla del ranking del período mes/anio.
  }

  /** Emite el certificado digital a la empresa de esa posición. */
  async generarCertificado(id: string): Promise<void> {
    await this.findOne(id);
    // TODO: emitir certificado a la empresa de esa posición.
  }
}
