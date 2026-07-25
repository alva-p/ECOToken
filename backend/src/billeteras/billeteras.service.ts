import { Injectable, NotFoundException } from '@nestjs/common';
import { BilleteraCustodialRepository } from './repository/billetera-custodial.repository';
import { CreateBilleteraCustodialDto } from './dto/create-billetera-custodial.dto';
import { UpdateBilleteraCustodialDto } from './dto/update-billetera-custodial.dto';

/** Lógica de negocio de BilleteraCustodial. */
@Injectable()
export class BilleterasService {
  constructor(private readonly repository: BilleteraCustodialRepository) {}

  create(dto: CreateBilleteraCustodialDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const billetera = await this.repository.findById(id);
    if (!billetera)
      throw new NotFoundException(`BilleteraCustodial ${id} no encontrada`);
    return billetera;
  }

  async update(id: string, dto: UpdateBilleteraCustodialDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }
}
