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

  /**
   * Volumen de material reciclado por canal empresarial en un período (E9-HU02).
   * Agrega en memoria en vez de vía SQL GROUP BY: a esta escala (proyecto
   * académico, no miles de ingresos) es más simple que resolver el nombre de
   * cada empresa aparte, y evita una segunda consulta.
   */
  async obtenerVolumenPorPeriodo(filtros: { desde?: string; hasta?: string }) {
    const desde = filtros.desde ? new Date(filtros.desde) : undefined;
    const hasta = filtros.hasta ? new Date(filtros.hasta) : undefined;
    const ingresos = await this.repository.findIngresosEnPeriodo(desde, hasta);

    const porEmpresa = new Map<
      string,
      {
        empresaId: string;
        razonSocial: string;
        kgReciclados: number;
        tokensAcumulados: number;
        aportes: number;
      }
    >();
    for (const ingreso of ingresos) {
      const actual = porEmpresa.get(ingreso.empresaId) ?? {
        empresaId: ingreso.empresaId,
        razonSocial: ingreso.empresa.razonSocial,
        kgReciclados: 0,
        tokensAcumulados: 0,
        aportes: 0,
      };
      actual.kgReciclados += ingreso.peso;
      actual.tokensAcumulados += ingreso.tokensAcumulados;
      actual.aportes += 1;
      porEmpresa.set(ingreso.empresaId, actual);
    }

    const data = [...porEmpresa.values()].sort(
      (a, b) => b.kgReciclados - a.kgReciclados,
    );

    return {
      data,
      totalKg: data.reduce((sum, e) => sum + e.kgReciclados, 0),
      totalTokens: data.reduce((sum, e) => sum + e.tokensAcumulados, 0),
      empresasActivas: data.length,
      desde: filtros.desde ?? null,
      hasta: filtros.hasta ?? null,
    };
  }

  /** Empresas reconocidas en el mes indicado. */
  async obtenerEmpresasReconocidas(mes: number): Promise<unknown[]> {
    // TODO: devolver las empresas reconocidas del mes.
    return [];
  }
}
