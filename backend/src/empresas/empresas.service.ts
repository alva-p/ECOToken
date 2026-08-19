import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CategoriaEmpresa, EstadoEmpresa, TipoRol } from '@prisma/client';
import { generarPasswordTemporal } from '../common/helpers/crypto.helper';
import { BilleterasService } from '../billeteras/billeteras.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { EmpresaRepository } from './repository/empresa.repository';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { RegistrarEmpresaDto } from './dto/registrar-empresa.dto';
import { AltaCooperativaDto } from './dto/alta-cooperativa.dto';

const BCRYPT_ROUNDS = 10;

/** Lógica de negocio de Empresa. */
@Injectable()
export class EmpresasService {
  constructor(
    private readonly repository: EmpresaRepository,
    private readonly billeterasService: BilleterasService,
    private readonly blockchainService: BlockchainService,
    private readonly usuariosService: UsuariosService,
  ) {}

  create(dto: CreateEmpresaDto) {
    return this.crearConBilletera(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const empresa = await this.repository.findById(id);
    if (!empresa) throw new NotFoundException(`Empresa ${id} no encontrada`);
    return empresa;
  }

  async update(id: string, dto: UpdateEmpresaDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }

  // ─── E3-HU01: registro público de empresa ───

  /**
   * Registra una empresa (alta pública). Valida unicidad de CUIT y correo, la
   * deja en estado PENDIENTE y le genera su billetera custodial (E3-HU02). La
   * validación de formato/dígito del CUIT la hace el DTO (@IsCuit); acá se
   * controla la unicidad y el estado inicial.
   */
  async registrar(dto: RegistrarEmpresaDto) {
    if (!dto.aceptaTerminos) {
      throw new BadRequestException(
        'Debe aceptar los términos y condiciones para registrarse',
      );
    }

    const porCuit = await this.repository.findByCuit(dto.cuit);
    if (porCuit) {
      throw new ConflictException(
        'Ya existe una empresa registrada con ese CUIT',
      );
    }
    const porEmail = await this.repository.findByEmailContacto(
      dto.emailContacto,
    );
    if (porEmail) {
      throw new ConflictException(
        'Ya existe una empresa registrada con ese correo electrónico',
      );
    }

    const billetera =
      this.billeterasService.generarBilleteraCustodial('EMPRESA');
    return this.repository.registrar(dto, billetera);
  }

  // ─── E4-HU01: alta administrativa de cooperativa ───

  /**
   * Da de alta una cooperativa (acto administrativo, no pasa por el flujo de
   * aprobación de E3-HU04): crea la Empresa (`categoria: COOPERATIVA`,
   * `estado: APROBADA`, `activa: true`) con su billetera custodial (E3-HU02),
   * le otorga VALIDATOR_ROLE on-chain y crea el Usuario con el que va a
   * iniciar sesión (E4-HU02), con una contraseña temporal que se devuelve
   * una única vez en la respuesta.
   *
   * Si un paso posterior a la creación de la Empresa falla (grant on-chain o
   * alta del usuario), se borra la Empresa creada (la billetera custodial se
   * borra en cascada) para no dejar una cooperativa a medio dar de alta.
   */
  async altaCooperativa(dto: AltaCooperativaDto) {
    const porCuit = await this.repository.findByCuit(dto.cuit);
    if (porCuit) {
      throw new ConflictException(
        'Ya existe una empresa registrada con ese CUIT',
      );
    }
    const porEmail = await this.repository.findByEmailContacto(
      dto.emailContacto,
    );
    if (porEmail) {
      throw new ConflictException(
        'Ya existe una empresa registrada con ese correo electrónico',
      );
    }

    const billetera =
      this.billeterasService.generarBilleteraCustodial('VALIDATOR');
    const empresa = await this.repository.altaCooperativa(dto, billetera);
    let usuarioId: string | undefined;

    try {
      const txHash = await this.blockchainService.grantValidatorRole(
        billetera.direccionEVM,
      );

      const passwordTemporal = generarPasswordTemporal();
      const usuario = await this.usuariosService.create({
        email: dto.emailContacto,
        passwordHash: await bcrypt.hash(passwordTemporal, BCRYPT_ROUNDS),
        tipoRol: TipoRol.COOPERATIVA,
        empresaId: empresa.id,
      });
      usuarioId = usuario.id;

      return {
        empresa,
        direccionEVM: billetera.direccionEVM,
        txHash,
        credencialesTemporales: { email: usuario.email, passwordTemporal },
      };
    } catch (err) {
      if (usuarioId) {
        await this.usuariosService.remove(usuarioId).catch(() => undefined);
      }
      await this.repository.remove(empresa.id).catch(() => undefined);
      throw err;
    }
  }

  // ─── E3-HU04: aprobación / rechazo por el administrador ───

  /** Empresas pendientes de aprobación (listado del panel admin). */
  findPendientes() {
    return this.repository.findByEstado(EstadoEmpresa.PENDIENTE);
  }

  /** Aprueba una empresa PENDIENTE → APROBADA. */
  async aprobar(id: string) {
    const empresa = await this.findOne(id);
    if (empresa.estado !== EstadoEmpresa.PENDIENTE) {
      throw new BadRequestException(
        `Solo se puede aprobar una empresa PENDIENTE (estado actual: ${empresa.estado})`,
      );
    }
    return this.repository.updateEstado(id, EstadoEmpresa.APROBADA);
  }

  /** Rechaza una empresa PENDIENTE → RECHAZADA. */
  async rechazar(id: string) {
    const empresa = await this.findOne(id);
    if (empresa.estado !== EstadoEmpresa.PENDIENTE) {
      throw new BadRequestException(
        `Solo se puede rechazar una empresa PENDIENTE (estado actual: ${empresa.estado})`,
      );
    }
    return this.repository.updateEstado(id, EstadoEmpresa.RECHAZADA);
  }

  /**
   * Gate "la empresa solo opera si fue aprobada" (E3-HU04). Otros módulos
   * (ingresos, tokens, etc.) deben llamarlo antes de operar sobre la empresa.
   */
  async verificarAprobada(id: string) {
    const empresa = await this.findOne(id);
    if (empresa.estado !== EstadoEmpresa.APROBADA) {
      throw new ForbiddenException(
        `La empresa ${id} no está habilitada para operar (estado: ${empresa.estado})`,
      );
    }
    return empresa;
  }

  // ─── Métodos de negocio del diagrama (stubs — completar en próximos sprints) ───

  /** True si la empresa es una cooperativa validadora (categoria = COOPERATIVA). */
  async esCooperativa(id: string): Promise<boolean> {
    const empresa = await this.findOne(id);
    return empresa.categoria === CategoriaEmpresa.COOPERATIVA;
  }

  /** Alta de una nueva empresa (perfil), con billetera custodial (E3-HU02). */
  crearConBilletera(dto: CreateEmpresaDto) {
    const tipoRolOnChain =
      dto.categoria === CategoriaEmpresa.COOPERATIVA
        ? 'COOPERATIVA'
        : 'EMPRESA';
    const billetera =
      this.billeterasService.generarBilleteraCustodial(tipoRolOnChain);

    return this.repository.create(dto, billetera);
  }

  /** Actualiza el perfil de la empresa. */
  async actualizarPerfil(id: string, dto: UpdateEmpresaDto) {
    // TODO: reglas de actualización de perfil.
    return this.update(id, dto);
  }

  async obtenerTokens(id: string): Promise<number> {
    await this.findOne(id);
    // TODO: sumar tokensAcumulados de los ingresos o consultar saldo on-chain.
    return 0;
  }

  async obtenerHistorialAportes(id: string) {
    await this.findOne(id);
    // TODO: devolver los IngresoMaterial de la empresa.
    return [];
  }

  async obtenerPosicionRanking(id: string, mes: number, anio: number) {
    await this.findOne(id);
    // TODO: calcular la posición en el ranking del período.
    return { empresaId: id, mes, anio, posicion: null };
  }

  async obtenerCertificados(id: string) {
    await this.findOne(id);
    // TODO: devolver los CertificadoDigital de la empresa.
    return [];
  }

  async exportarHistorial(id: string): Promise<string> {
    await this.findOne(id);
    // TODO: generar el CSV del historial de aportes.
    return '';
  }
}
