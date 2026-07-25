import { Injectable, NotFoundException } from '@nestjs/common';
import { PuntajeRepository } from './repository/puntaje.repository';
import { CreatePuntajeDto } from './dto/create-puntaje.dto';
import { UpdatePuntajeDto } from './dto/update-puntaje.dto';

/** Lógica de negocio de Puntaje. */
@Injectable()
export class PuntajesService {
  constructor(private readonly repository: PuntajeRepository) {}

  create(dto: CreatePuntajeDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const puntaje = await this.repository.findById(id);
    if (!puntaje) throw new NotFoundException(`Puntaje ${id} no encontrado`);
    return puntaje;
  }

  async update(id: string, dto: UpdatePuntajeDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }
}
