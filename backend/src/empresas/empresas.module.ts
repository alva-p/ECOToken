import { Module } from '@nestjs/common';
import { BilleterasModule } from '../billeteras/billeteras.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';
import { EmpresaRepository } from './repository/empresa.repository';

@Module({
  imports: [BilleterasModule, BlockchainModule, UsuariosModule],
  controllers: [EmpresasController],
  providers: [EmpresasService, EmpresaRepository],
  exports: [EmpresasService],
})
export class EmpresasModule {}
