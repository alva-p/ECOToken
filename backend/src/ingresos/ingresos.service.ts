import { Injectable, NotFoundException } from '@nestjs/common';
import { IngresoMaterialRepository } from './repository/ingreso-material.repository';
import { CreateIngresoMaterialDto } from './dto/create-ingreso-material.dto';
import { UpdateIngresoMaterialDto } from './dto/update-ingreso-material.dto';
import { PuntajesService } from '../puntajes/puntajes.service';

/** Lógica de negocio de IngresoMaterial. */
@Injectable()
export class IngresosService {
  constructor(
    private readonly repository: IngresoMaterialRepository,
    private readonly puntajesService: PuntajesService,
  ) {}

  /**
   * Registra una entrega de material. Si no se proveen tokensAcumulados,
   * los calcula automáticamente usando la tabla de conversión peso -> tokens (RN-07).
   */
  async create(dto: CreateIngresoMaterialDto) {
    if (dto.tokensAcumulados === undefined || dto.tokensAcumulados === null) {
      const factorVigente =
        await this.puntajesService.findVigenteByTipoMaterial(
          dto.tipoMaterialId,
        );
      const factorNum = parseFloat(factorVigente.cantidadPorKilo) || 1;
      dto.tokensAcumulados = Math.floor(dto.peso * factorNum);
    }
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

  // ─── Métodos de negocio del diagrama de clases (RN-07) ───

  /** Puntaje del ingreso: peso * cantidadPorKilo del Puntaje vigente del TipoMaterial. */
  async calcularPuntaje(id: string): Promise<number> {
    const ingreso = await this.findOne(id);
    const puntajeVigente = await this.puntajesService.findVigenteByTipoMaterial(
      ingreso.tipoMaterialId,
      ingreso.fechaIngreso,
    );
    const factorNum = parseFloat(puntajeVigente.cantidadPorKilo) || 1;
    return Math.floor(ingreso.peso * factorNum);
  }

  /** True si el estado del ingreso corresponde a "ingresado/registrado". */
  async esIngresado(id: string): Promise<boolean> {
    const ingreso = await this.findOne(id);
    return ingreso.estado?.nombre === 'REGISTRADO';
  }
}
