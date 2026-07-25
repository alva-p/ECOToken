import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadoRepository } from './repository/estado.repository';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

/** Lógica de negocio de Estado. */
@Injectable()
export class EstadosService {
  constructor(private readonly repository: EstadoRepository) {}

  create(dto: CreateEstadoDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const estado = await this.repository.findById(id);
    if (!estado) throw new NotFoundException(`Estado ${id} no encontrado`);
    return estado;
  }

  async update(id: string, dto: UpdateEstadoDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }
}
