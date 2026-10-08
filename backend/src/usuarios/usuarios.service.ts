import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsuarioRepository } from './repository/usuario.repository';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

/** Lógica de negocio de Usuario. */
const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsuariosService {
  constructor(private readonly repository: UsuarioRepository) {}

  create(dto: CreateUsuarioDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const usuario = await this.repository.findById(id);
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  /** Búsqueda por email para el login (E4-HU02). `null` si no existe (no lanza). */
  findByEmail(email: string) {
    return this.repository.findByEmail(email);
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }

  // ─── Métodos de negocio del diagrama de clases (stubs — completar en próximos sprints) ───
  // Nota: la lógica real de autenticación vive en el módulo auth; acá quedan los stubs del dominio Usuario.

  /** Verifica las credenciales del usuario. */
  async autenticar(email: string, password: string): Promise<boolean> {
    // TODO: verificar credenciales (bcrypt) del email contra el passwordHash almacenado.
    return false;
  }

  /** Cierra la sesión activa del usuario. */
  async cerrarSesion(id: string): Promise<void> {
    // TODO: invalidar sesión/token del usuario.
  }

  /** Inicia el flujo de recuperación de cuenta. */
  async recuperarCuenta(email: string): Promise<void> {
    // TODO: flujo de recuperación (envío de email con token temporal, etc.).
  }

  /**
   * Cambia la contraseña validando la actual y baja la marca de "contraseña
   * temporal". Devuelve false si la actual no coincide.
   */
  async cambiarPassword(
    id: string,
    actual: string,
    nueva: string,
  ): Promise<boolean> {
    const usuario = await this.findOne(id);
    if (!(await bcrypt.compare(actual, usuario.passwordHash))) return false;
    await this.repository.update(id, {
      passwordHash: await bcrypt.hash(nueva, BCRYPT_ROUNDS),
      debeCambiarPassword: false,
    });
    return true;
  }
}
