import { Injectable, NotFoundException } from '@nestjs/common';
import { PuntajeRepository } from './repository/puntaje.repository';
import { CreatePuntajeDto } from './dto/create-puntaje.dto';
import { UpdatePuntajeDto } from './dto/update-puntaje.dto';

/** Lógica de negocio de Puntaje (Tabla de conversión peso -> tokens ECO). */
@Injectable()
export class PuntajesService {
  constructor(private readonly repository: PuntajeRepository) {}

  /** Crea o genera una nueva versión inmutable del factor de conversión para un tipo de material (RN-07). */
  async create(dto: CreatePuntajeDto) {
    const ahora = new Date();
    // Cerrar versión vigente previa para mantener historial inmutable
    await this.repository.cerrarPuntajeVigente(dto.tipoMaterialId, ahora);

    if (!dto.versionConfig) {
      const anteriores = await this.repository.findAll();
      const count = anteriores.filter(
        (p) => p.tipoMaterialId === dto.tipoMaterialId,
      ).length;
      dto.versionConfig = `v${count + 1}`;
    }

    dto.fechaDesde = dto.fechaDesde ?? ahora.toISOString();
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  /** Retorna la lista completa de factores de conversión vigentes por material. */
  findVigentes() {
    return this.repository.findVigentes();
  }

  /** Obtiene el factor vigente para un tipo de material en una fecha dada. */
  async findVigenteByTipoMaterial(tipoMaterialId: string, fecha?: Date) {
    const puntaje = await this.repository.findVigenteByTipoMaterial(
      tipoMaterialId,
      fecha,
    );
    if (!puntaje) {
      throw new NotFoundException(
        `No existe un factor de conversión vigente para el material ${tipoMaterialId}`,
      );
    }
    return puntaje;
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
