import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';

/** Acceso a datos de Usuario vía PrismaService. */
@Injectable()
export class UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateUsuarioDto) {
    return this.prisma.usuario.create({ data: dto });
  }

  findAll() {
    return this.prisma.usuario.findMany();
  }

  findById(id: string) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  /** Búsqueda por email (login, E4-HU02). */
  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  update(id: string, dto: UpdateUsuarioDto) {
    return this.prisma.usuario.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.usuario.delete({ where: { id } });
  }
}
