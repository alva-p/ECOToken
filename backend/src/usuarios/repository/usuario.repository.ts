import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';

/**
 * Proyección pública del Usuario: todos los campos MENOS `passwordHash`.
 * Se usa en las lecturas que llegan al cliente (findAll/findById) para no
 * exponer nunca el hash de la contraseña. El login y el cambio de contraseña
 * usan métodos dedicados (findByEmail / findByIdConHash) que sí lo traen.
 */
const USUARIO_PUBLICO = {
  id: true,
  email: true,
  tipoRol: true,
  activo: true,
  debeCambiarPassword: true,
  empresaId: true,
  municipalidadId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UsuarioSelect;

/** Acceso a datos de Usuario vía PrismaService. */
@Injectable()
export class UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateUsuarioDto) {
    return this.prisma.usuario.create({
      data: dto,
      select: USUARIO_PUBLICO,
    });
  }

  findAll() {
    return this.prisma.usuario.findMany({
      select: USUARIO_PUBLICO,
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: USUARIO_PUBLICO,
    });
  }

  /** Igual que findById pero incluye el passwordHash (cambio de contraseña). */
  findByIdConHash(id: string) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  /** Búsqueda por email (login, E4-HU02): incluye el passwordHash. */
  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  update(id: string, dto: UpdateUsuarioDto) {
    return this.prisma.usuario.update({
      where: { id },
      data: dto,
      select: USUARIO_PUBLICO,
    });
  }

  remove(id: string) {
    return this.prisma.usuario.delete({
      where: { id },
      select: USUARIO_PUBLICO,
    });
  }
}
