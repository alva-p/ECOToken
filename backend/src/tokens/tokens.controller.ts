import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TokensService } from './tokens.service';
import { CreateMovimientoTokenDto } from './dto/create-movimiento-token.dto';
import { UpdateMovimientoTokenDto } from './dto/update-movimiento-token.dto';

/** Rutas HTTP de MovimientoToken: solo delegan en el service. */
@Controller('tokens')
export class TokensController {
  constructor(private readonly service: TokensService) {}

  @Post()
  create(@Body() dto: CreateMovimientoTokenDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateMovimientoTokenDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
