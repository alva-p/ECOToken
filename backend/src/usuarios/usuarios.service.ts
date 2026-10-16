import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generarPasswordTemporal } from '../common/helpers/crypto.helper';
import { UsuarioRepository } from './repository/usuario.repository';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { AltaUsuarioDto } from './dto/alta-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

/** Lógica de negocio de Usuario. */
const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsuariosService {
  constructor(private readonly repository: UsuarioRepository) {}

  create(dto: CreateUsuarioDto) {
    return this.repository.create(dto);
  }

  /**
   * Alta administrativa (gestión de usuarios): genera una contraseña temporal,
   * la hashea y crea la cuenta con `debeCambiarPassword`. Devuelve el usuario y
   * la contraseña en claro UNA sola vez para entregarla al titular.
   */
  async altaAdministrativa(dto: AltaUsuarioDto) {
    const existente = await this.repository.findByEmail(dto.email);
    if (existente)
      throw new ConflictException(
        `Ya existe un usuario con el email ${dto.email}`,
      );

    const passwordTemporal = generarPasswordTemporal();
    const usuario = await this.repository.create({
      email: dto.email,
      passwordHash: await bcrypt.hash(passwordTemporal, BCRYPT_ROUNDS),
      tipoRol: dto.tipoRol,
      debeCambiarPassword: true,
      empresaId: dto.empresaId,
      municipalidadId: dto.municipalidadId,
    });

    return { usuario, passwordTemporal };
  }

  /**
   * Restablece la contraseña de un usuario que no puede ingresar: genera una
   * nueva temporal, la hashea y vuelve a exigir el cambio en el próximo acceso.
   * Devuelve la contraseña en claro UNA sola vez.
   */
  async restablecerPassword(id: string) {
    const existe = await this.repository.findById(id);
    if (!existe) throw new NotFoundException(`Usuario ${id} no encontrado`);

    const passwordTemporal = generarPasswordTemporal();
    const usuario = await this.repository.update(id, {
      passwordHash: await bcrypt.hash(passwordTemporal, BCRYPT_ROUNDS),
      debeCambiarPassword: true,
    });

    return { usuario, passwordTemporal };
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
    const usuario = await this.repository.findByIdConHash(id);
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    if (!(await bcrypt.compare(actual, usuario.passwordHash))) return false;
    await this.repository.update(id, {
      passwordHash: await bcrypt.hash(nueva, BCRYPT_ROUNDS),
      debeCambiarPassword: false,
    });
    return true;
  }
}
