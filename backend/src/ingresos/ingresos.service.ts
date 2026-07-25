import { Injectable, NotFoundException } from '@nestjs/common';
import { IngresoMaterialRepository } from './repository/ingreso-material.repository';
import { CreateIngresoMaterialDto } from './dto/create-ingreso-material.dto';
import { UpdateIngresoMaterialDto } from './dto/update-ingreso-material.dto';

/** Lógica de negocio de IngresoMaterial. */
@Injectable()
export class IngresosService {
  constructor(private readonly repository: IngresoMaterialRepository) {}

  create(dto: CreateIngresoMaterialDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const ingreso = await this.repository.findById(id);
    if (!ingreso)
      throw new NotFoundException(`IngresoMaterial ${id} no encontrado`);
    return ingreso;
  }

  async update(id: string, dto: UpdateIngresoMaterialDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }

  // ─── Métodos de negocio del diagrama de clases (stubs — completar en próximos sprints) ───

  /** Puntaje del ingreso: peso * cantidadPorKilo del Puntaje vigente del TipoMaterial. */
  async calcularPuntaje(id: string): Promise<number> {
    await this.findOne(id);
    // TODO: peso * cantidadPorKilo del Puntaje vigente del TipoMaterial.
    return 0;
  }

  /** True si el estado del ingreso corresponde a "ingresado/registrado". */
  async esIngresado(id: string): Promise<boolean> {
    await this.findOne(id);
    // TODO: true si el estado corresponde a "ingresado/registrado".
    return false;
  }
}
