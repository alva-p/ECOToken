import { Injectable } from '@nestjs/common';
import { CategoriaEmpresa, EstadoEmpresa } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { UpdateEmpresaDto } from '../dto/update-empresa.dto';
import { BilleteraCustodialGenerada } from '../../billeteras/billeteras.service';
import { RegistrarEmpresaDto } from '../dto/registrar-empresa.dto';
import { AltaCooperativaDto } from '../dto/alta-cooperativa.dto';

/** Acceso a datos de Empresa vía PrismaService. */
@Injectable()
export class EmpresaRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateEmpresaDto, billetera: BilleteraCustodialGenerada) {
    return this.prisma.empresa.create({
      data: {
        razonSocial: dto.razonSocial,
        cuit: dto.cuit,
        domicilio: dto.domicilio,
        representanteLegal: dto.representanteLegal,
        emailContacto: dto.emailContacto,
        categoria: dto.categoria,
        nombre: dto.nombre,
        datosContacto: dto.datosContacto,
        activa: dto.activa,
        walletAddress: billetera.direccionEVM,
        billeteraCustodial: {
          create: {
            direccionEVM: billetera.direccionEVM,
            clavePrivadaCifrada: billetera.clavePrivadaCifrada,
            tipoRolOnChain: billetera.tipoRolOnChain,
          },
        },
      },
    });
  }

  /**
   * Alta pública de empresa (E3-HU01): arranca en estado PENDIENTE, registra
   * la aceptación de términos y condiciones con su versión y timestamp
   * (E3-HU03), y persiste la billetera custodial generada (E3-HU02).
   */
  registrar(dto: RegistrarEmpresaDto, billetera: BilleteraCustodialGenerada) {
    const { aceptaTerminos: _aceptaTerminos, versionTerminos, ...datos } = dto;
    return this.prisma.empresa.create({
      data: {
        ...datos,
        estado: EstadoEmpresa.PENDIENTE,
        terminosVersion: versionTerminos,
        terminosAceptadosEn: new Date(),
        walletAddress: billetera.direccionEVM,
        billeteraCustodial: {
          create: {
            direccionEVM: billetera.direccionEVM,
            clavePrivadaCifrada: billetera.clavePrivadaCifrada,
            tipoRolOnChain: billetera.tipoRolOnChain,
          },
        },
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
   * Buscador con autocompletado para la cooperativa (E4-HU03): solo empresas
   * adherentes APROBADAS (no otras cooperativas), por razón social o CUIT.
   */
  buscar(query: string) {
    return this.prisma.empresa.findMany({
      where: {
        estado: EstadoEmpresa.APROBADA,
        categoria: CategoriaEmpresa.EMPRESA,
        OR: [
          { razonSocial: { contains: query, mode: 'insensitive' } },
          { cuit: { contains: query } },
        ],
      },
      orderBy: { razonSocial: 'asc' },
      take: 10,
    });
  }

  /**
   * Alta administrativa de cooperativa (E4-HU01): a diferencia de `registrar`
   * (alta pública, arranca PENDIENTE), esta queda APROBADA y activa de una, y
   * persiste la billetera custodial generada (E3-HU02) como cuenta operadora.
   */
  altaCooperativa(dto: AltaCooperativaDto, billetera: BilleteraCustodialGenerada) {
    return this.prisma.empresa.create({
      data: {
        ...dto,
        categoria: CategoriaEmpresa.COOPERATIVA,
        estado: EstadoEmpresa.APROBADA,
        activa: true,
        walletAddress: billetera.direccionEVM,
        billeteraCustodial: {
          create: {
            direccionEVM: billetera.direccionEVM,
            clavePrivadaCifrada: billetera.clavePrivadaCifrada,
            tipoRolOnChain: billetera.tipoRolOnChain,
          },
        },
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
