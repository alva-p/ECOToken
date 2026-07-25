import { Module } from '@nestjs/common';
import { MaterialesController } from './materiales.controller';
import { MaterialesService } from './materiales.service';
import { TipoMaterialRepository } from './repository/tipo-material.repository';

@Module({
  controllers: [MaterialesController],
  providers: [MaterialesService, TipoMaterialRepository],
  exports: [MaterialesService],
})
export class MaterialesModule {}
