import { Injectable, NotFoundException } from '@nestjs/common';
import { EjemploRepository } from './repository/ejemplo.repository';
import { CreateEjemploDto } from './dto/create-ejemplo.dto';
import { UpdateEjemploDto } from './dto/update-ejemplo.dto';

/** Plantilla de service: lógica de negocio y validaciones. */
@Injectable()
export class EjemploService {
  constructor(private readonly repository: EjemploRepository) {}

  create(dto: CreateEjemploDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException(`Ejemplo ${id} no encontrado`);
    return entity;
  }

  async update(id: string, dto: UpdateEjemploDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }
}
