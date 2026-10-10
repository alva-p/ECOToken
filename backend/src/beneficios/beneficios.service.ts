import { Injectable, NotFoundException } from '@nestjs/common';
import { BeneficioRepository } from './repository/beneficio.repository';
import { CreateBeneficioDto } from './dto/create-beneficio.dto';
import { UpdateBeneficioDto } from './dto/update-beneficio.dto';

/** Lógica de negocio de Beneficio (premios canjeables con tokens ECO). */
@Injectable()
export class BeneficiosService {
  constructor(private readonly repository: BeneficioRepository) {}

  create(dto: CreateBeneficioDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async update(id: string, dto: UpdateBeneficioDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }

  private async findOne(id: string) {
    const beneficio = await this.repository.findById(id);
    if (!beneficio)
      throw new NotFoundException(`Beneficio ${id} no encontrado`);
    return beneficio;
  }
}
