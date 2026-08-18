import { Injectable } from '@nestjs/common';
import { EstadoEmpresa } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { UpdateEmpresaDto } from '../dto/update-empresa.dto';
import { RegistrarEmpresaDto } from '../dto/registrar-empresa.dto';

/** Acceso a datos de Empresa vía PrismaService. */
@Injectable()
export class EmpresaRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateEmpresaDto) {
    return this.prisma.empresa.create({ data: dto });
  }

  /** Alta pública de empresa (E3-HU01): arranca en estado PENDIENTE. */
  registrar(dto: RegistrarEmpresaDto) {
    return this.prisma.empresa.create({
      data: { ...dto, estado: EstadoEmpresa.PENDIENTE },
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
