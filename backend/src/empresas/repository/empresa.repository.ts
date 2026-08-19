import { Injectable } from '@nestjs/common';
import { CategoriaEmpresa, EstadoEmpresa } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { UpdateEmpresaDto } from '../dto/update-empresa.dto';
import { RegistrarEmpresaDto } from '../dto/registrar-empresa.dto';
import { AltaCooperativaDto } from '../dto/alta-cooperativa.dto';

/** Acceso a datos de Empresa vía PrismaService. */
@Injectable()
export class EmpresaRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateEmpresaDto) {
    return this.prisma.empresa.create({ data: dto });
  }

  /**
   * Alta pública de empresa (E3-HU01): arranca en estado PENDIENTE y registra
   * la aceptación de términos y condiciones con su versión y timestamp (E3-HU03).
   */
  registrar(dto: RegistrarEmpresaDto) {
    const { aceptaTerminos: _aceptaTerminos, versionTerminos, ...datos } = dto;
    return this.prisma.empresa.create({
      data: {
        ...datos,
        estado: EstadoEmpresa.PENDIENTE,
        terminosVersion: versionTerminos,
        terminosAceptadosEn: new Date(),
      },
    });
  }

  findAll() {
    return this.prisma.empresa.findMany();
  }

  findById(id: string) {
    return this.prisma.empresa.findUnique({ where: { id } });
  }

  findByCuit(cuit: string) {
    return this.prisma.empresa.findUnique({ where: { cuit } });
  }

  findByEmailContacto(emailContacto: string) {
    return this.prisma.empresa.findUnique({ where: { emailContacto } });
  }

  findByEstado(estado: EstadoEmpresa) {
    return this.prisma.empresa.findMany({ where: { estado } });
  }

  /**
   * Alta administrativa de cooperativa (E4-HU01): a diferencia de `registrar`
   * (alta pública, arranca PENDIENTE), esta queda APROBADA y activa de una.
   */
  altaCooperativa(dto: AltaCooperativaDto) {
    return this.prisma.empresa.create({
      data: {
        ...dto,
        categoria: CategoriaEmpresa.COOPERATIVA,
        estado: EstadoEmpresa.APROBADA,
        activa: true,
      },
    });
  }

  update(id: string, dto: UpdateEmpresaDto) {
    return this.prisma.empresa.update({ where: { id }, data: dto });
  }

  /** Transición del estado de aprobación (E3-HU04). */
  updateEstado(id: string, estado: EstadoEmpresa) {
    return this.prisma.empresa.update({ where: { id }, data: { estado } });
  }

  remove(id: string) {
    return this.prisma.empresa.delete({ where: { id } });
  }
}
