import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBilleteraCustodialDto } from '../dto/create-billetera-custodial.dto';
import { UpdateBilleteraCustodialDto } from '../dto/update-billetera-custodial.dto';

/** Acceso a datos de BilleteraCustodial vía PrismaService. */
@Injectable()
export class BilleteraCustodialRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBilleteraCustodialDto) {
    return this.prisma.billeteraCustodial.create({ data: dto });
  }

  findAll() {
    return this.prisma.billeteraCustodial.findMany();
  }

  findById(id: string) {
    return this.prisma.billeteraCustodial.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateBilleteraCustodialDto) {
    return this.prisma.billeteraCustodial.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.billeteraCustodial.delete({ where: { id } });
  }
}
