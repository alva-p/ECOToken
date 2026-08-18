import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { UpdateEmpresaDto } from '../dto/update-empresa.dto';
import { BilleteraCustodialGenerada } from '../../billeteras/billeteras.service';

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
        estado: dto.estado,
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

  findAll() {
    return this.prisma.empresa.findMany();
  }

  findById(id: string) {
    return this.prisma.empresa.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateEmpresaDto) {
    return this.prisma.empresa.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.empresa.delete({ where: { id } });
  }
}
