import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriaEmpresa } from '@prisma/client';
import { EmpresaRepository } from './repository/empresa.repository';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

/** Lógica de negocio de Empresa. */
@Injectable()
export class EmpresasService {
  constructor(private readonly repository: EmpresaRepository) {}

  create(dto: CreateEmpresaDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const empresa = await this.repository.findById(id);
    if (!empresa) throw new NotFoundException(`Empresa ${id} no encontrada`);
    return empresa;
  }

  async update(id: string, dto: UpdateEmpresaDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }

  // ─── Métodos de negocio del diagrama de clases (stubs — completar en próximos sprints) ───

  /** True si la empresa es una cooperativa validadora (categoria = COOPERATIVA). */
  async esCooperativa(id: string): Promise<boolean> {
    const empresa = await this.findOne(id);
    return empresa.categoria === CategoriaEmpresa.COOPERATIVA;
  }

  /** Alta de una nueva empresa (perfil). */
  registrar(dto: CreateEmpresaDto) {
    // TODO: reglas de alta (validación de CUIT, creación de billetera custodial, etc.).
    return this.create(dto);
  }

  /** Actualiza el perfil de la empresa. */
  async actualizarPerfil(id: string, dto: UpdateEmpresaDto) {
    // TODO: reglas de actualización de perfil.
    return this.update(id, dto);
  }

  /** Total de tokens acumulados por la empresa. */
  async obtenerTokens(id: string): Promise<number> {
    await this.findOne(id);
    // TODO: sumar tokensAcumulados de los ingresos o consultar saldo on-chain.
    return 0;
  }

  /** Historial de aportes (ingresos de material) de la empresa. */
  async obtenerHistorialAportes(id: string) {
    await this.findOne(id);
    // TODO: devolver los IngresoMaterial de la empresa.
    return [];
  }

  /** Posición de la empresa en el ranking de un período. */
  async obtenerPosicionRanking(id: string, mes: number, anio: number) {
    await this.findOne(id);
    // TODO: calcular la posición en el ranking del período.
    return { empresaId: id, mes, anio, posicion: null };
  }

  /** Certificados digitales emitidos a la empresa. */
  async obtenerCertificados(id: string) {
    await this.findOne(id);
    // TODO: devolver los CertificadoDigital de la empresa.
    return [];
  }

  /** Exporta el historial de aportes de la empresa en CSV. */
  async exportarHistorial(id: string): Promise<string> {
    await this.findOne(id);
    // TODO: generar el CSV del historial de aportes.
    return '';
  }
}
