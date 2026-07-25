import { Injectable, NotFoundException } from '@nestjs/common';
import { MunicipalidadRepository } from './repository/municipalidad.repository';
import { CreateMunicipalidadDto } from './dto/create-municipalidad.dto';
import { UpdateMunicipalidadDto } from './dto/update-municipalidad.dto';

/** Lógica de negocio de Municipalidad. */
@Injectable()
export class MunicipalidadesService {
  constructor(private readonly repository: MunicipalidadRepository) {}

  create(dto: CreateMunicipalidadDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const municipalidad = await this.repository.findById(id);
    if (!municipalidad)
      throw new NotFoundException(`Municipalidad ${id} no encontrada`);
    return municipalidad;
  }

  async update(id: string, dto: UpdateMunicipalidadDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }

  // ─── Métodos de negocio del diagrama de clases (stubs — completar en próximos sprints) ───

  /** Autenticación del usuario municipal. */
  async login(email: string, pass: string): Promise<unknown> {
    // TODO: delegar en el módulo de auth.
    return null;
  }

  /** Consulta el reporte de un período. */
  async consultarReporte(periodo: string): Promise<unknown> {
    // TODO: obtener el reporte del período indicado.
    return null;
  }

  /** Exporta un reporte en el formato solicitado. */
  async exportarReporte(id: string, formato: string): Promise<unknown> {
    // TODO: generar el archivo del reporte en el formato solicitado.
    return null;
  }

  /** Ranking público de empresas de un período. */
  async verRankingPublico(mes: number, anio: number): Promise<unknown> {
    // TODO: calcular el ranking público del período.
    return null;
  }

  /** Empresas reconocidas en un mes. */
  async listarEmpresasReconocidas(mes: number): Promise<unknown[]> {
    // TODO: listar las empresas reconocidas del mes.
    return [];
  }
}
