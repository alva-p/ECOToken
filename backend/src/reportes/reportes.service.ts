import { Injectable, NotFoundException } from '@nestjs/common';
import { ReporteRepository } from './repository/reporte.repository';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';

/** Lógica de negocio de Reporte. */
@Injectable()
export class ReportesService {
  constructor(private readonly repository: ReporteRepository) {}

  create(dto: CreateReporteDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const reporte = await this.repository.findById(id);
    if (!reporte) throw new NotFoundException(`Reporte ${id} no encontrado`);
    return reporte;
  }

  async update(id: string, dto: UpdateReporteDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }

  // ─── Métodos de negocio del diagrama de clases (stubs — completar en próximos sprints) ───

  /** Genera un reporte consolidando los datos del período. */
  async generar(tipo: string, periodo: string): Promise<unknown> {
    // TODO: consolidar datos y crear el reporte.
    return null;
  }

  /** Exporta el reporte en el formato indicado (PDF, CSV, etc.). */
  async exportar(id: string, formato: string): Promise<unknown> {
    // TODO: generar el archivo de exportación del reporte.
    return null;
  }

  /** Volumen de material reciclado por período, según los filtros. */
  async obtenerVolumenPorPeriodo(
    filtros: Record<string, unknown>,
  ): Promise<unknown> {
    // TODO: agregar el volumen por período aplicando los filtros.
    return null;
  }

  /** Empresas reconocidas en el mes indicado. */
  async obtenerEmpresasReconocidas(mes: number): Promise<unknown[]> {
    // TODO: devolver las empresas reconocidas del mes.
    return [];
  }
}
