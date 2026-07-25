import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { BilleterasService } from './billeteras.service';
import { CreateBilleteraCustodialDto } from './dto/create-billetera-custodial.dto';
import { UpdateBilleteraCustodialDto } from './dto/update-billetera-custodial.dto';

/** Rutas HTTP de BilleteraCustodial: solo delegan en el service. */
@Controller('billeteras')
export class BilleterasController {
  constructor(private readonly service: BilleterasService) {}

  @Post()
  create(@Body() dto: CreateBilleteraCustodialDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBilleteraCustodialDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
