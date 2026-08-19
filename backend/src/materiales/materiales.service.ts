import { Injectable, NotFoundException } from '@nestjs/common';
import { TipoMaterialRepository } from './repository/tipo-material.repository';
import { CreateTipoMaterialDto } from './dto/create-tipo-material.dto';
import { UpdateTipoMaterialDto } from './dto/update-tipo-material.dto';

/** Lógica de negocio de TipoMaterial. */
@Injectable()
export class MaterialesService {
  constructor(private readonly repository: TipoMaterialRepository) {}

  create(dto: CreateTipoMaterialDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const tipoMaterial = await this.repository.findById(id);
    if (!tipoMaterial)
      throw new NotFoundException(`TipoMaterial ${id} no encontrado`);
    return tipoMaterial;
  }

  async update(id: string, dto: UpdateTipoMaterialDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }
}
