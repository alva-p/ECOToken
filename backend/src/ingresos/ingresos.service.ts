import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CategoriaEmpresa } from '@prisma/client';
import { EmpresasService } from '../empresas/empresas.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { IngresoMaterialRepository } from './repository/ingreso-material.repository';
import { CreateIngresoMaterialDto } from './dto/create-ingreso-material.dto';
import { UpdateIngresoMaterialDto } from './dto/update-ingreso-material.dto';
import { RegistrarIngresoDto } from './dto/registrar-ingreso.dto';

const ESTADO_REGISTRADO = 'REGISTRADO';
const ESTADO_ACUNADO = 'ACUNADO';

/** Lógica de negocio de IngresoMaterial. */
@Injectable()
export class IngresosService {
  private readonly logger = new Logger(IngresosService.name);

  constructor(
    private readonly repository: IngresoMaterialRepository,
    private readonly empresas: EmpresasService,
    private readonly blockchain: BlockchainService,
  ) {}

  create(dto: CreateIngresoMaterialDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const ingreso = await this.repository.findById(id);
    if (!ingreso)
      throw new NotFoundException(`IngresoMaterial ${id} no encontrado`);
    return ingreso;
  }

  async update(id: string, dto: UpdateIngresoMaterialDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }

  // ─── E5-HU01: registro de ingreso de material ───

  /**
   * Registra un ingreso de material aportado por una empresa y validado por una
   * cooperativa, y dispara la acuñación de tokens. El ingreso se persiste SIEMPRE
   * (estado REGISTRADO); si la acuñación on-chain está disponible y sale bien, el
   * ingreso pasa a ACUÑADO con su MovimientoToken; si no, queda pendiente y
   * reintentable (ver `reintentarAcunacion`).
   */
  async registrar(dto: RegistrarIngresoDto, cooperativaId: string | null) {
    if (!cooperativaId) {
      throw new ForbiddenException(
        'El usuario no está asociado a ninguna cooperativa',
      );
    }

    // 1) La cooperativa que registra debe estar aprobada y ser COOPERATIVA.
    const cooperativa = await this.empresas.verificarAprobada(cooperativaId);
    if (cooperativa.categoria !== CategoriaEmpresa.COOPERATIVA) {
      throw new ForbiddenException(
        'Solo una cooperativa puede registrar ingresos de material',
      );
    }
    // Validación on-chain del rol validador (solo si la cadena está configurada).
    if (this.blockchain.configurada) {
      const habilitada = await this.blockchain.tieneValidatorRole(
        cooperativa.walletAddress,
      );
      if (!habilitada) {
        throw new ForbiddenException(
          'La cooperativa no tiene VALIDATOR_ROLE activo on-chain',
        );
      }
    }

    // 2) La empresa destino debe estar aprobada.
    const empresa = await this.empresas.verificarAprobada(dto.empresaId);

    // 3) Material + puntaje vigente → cálculo de tokens.
    const material = await this.repository.findTipoMaterialById(
      dto.tipoMaterialId,
    );
    if (!material) {
      throw new NotFoundException(
        `TipoMaterial ${dto.tipoMaterialId} no encontrado`,
      );
    }
    const puntaje = await this.repository.findPuntajeVigente(
      dto.tipoMaterialId,
    );
    if (!puntaje) {
      throw new BadRequestException(
        `No hay un puntaje vigente para el material ${material.nombre}`,
      );
    }
    const tokens = this.calcularTokens(dto.peso, puntaje.cantidadPorKilo);

    // 4) Estado inicial REGISTRADO y alta del ingreso off-chain.
    const registrado =
      await this.repository.findEstadoByNombre(ESTADO_REGISTRADO);
    if (!registrado) {
      throw new InternalServerErrorException(
        `Falta el estado ${ESTADO_REGISTRADO} (ejecutar el seed)`,
      );
    }
    const ingreso = await this.repository.registrar({
      empresaId: dto.empresaId,
      cooperativaId,
      tipoMaterialId: dto.tipoMaterialId,
      estadoId: registrado.id,
      peso: dto.peso,
      tokensAcumulados: tokens,
    });

    // 5) Acuñación on-chain (best-effort; si falla, queda reintentable).
    const acunado = await this.acunarSiPosible(
      ingreso.id,
      empresa.walletAddress,
      material.nombre,
      dto.peso,
      tokens,
    );

    return acunado ?? this.repository.findByIdFull(ingreso.id);
  }

  /**
   * Reintenta la acuñación de un ingreso que quedó en REGISTRADO (sin
   * MovimientoToken). A diferencia del alta, acá los errores se propagan: es una
   * acción explícita del usuario que quiere ver el resultado.
   */
  async reintentarAcunacion(id: string) {
    const ingreso = await this.repository.findByIdFull(id);
    if (!ingreso) {
      throw new NotFoundException(`IngresoMaterial ${id} no encontrado`);
    }
    if (ingreso.movimientoToken) {
      throw new BadRequestException('El ingreso ya fue acuñado');
    }
    const acunado = await this.repository.findEstadoByNombre(ESTADO_ACUNADO);
    if (!acunado) {
      throw new InternalServerErrorException(
        `Falta el estado ${ESTADO_ACUNADO} (ejecutar el seed)`,
      );
    }

    const { txHash, bloque } = await this.blockchain.mint(
      ingreso.empresa.walletAddress,
      ingreso.tokensAcumulados,
      ingreso.tipoMaterial.nombre,
      ingreso.peso,
    );
    return this.repository.acunar(
      id,
      ingreso.tokensAcumulados,
      txHash,
      bloque,
      acunado.id,
    );
  }

  // ─── E6-HU02: historial de aportes de la empresa ───

  /**
   * Historial paginado de aportes de la empresa logueada, para auditoría interna.
   * `limit` se acota a 500 para permitir exportar el historial filtrado completo
   * a CSV en una sola página sin abrir un endpoint de exportación aparte.
   */
  async misAportes(
    empresaId: string | null,
    filtros: {
      page?: number;
      limit?: number;
      desde?: string;
      hasta?: string;
      tipoMaterialId?: string;
    },
  ) {
    if (!empresaId) {
      throw new ForbiddenException('El usuario no está asociado a ninguna empresa');
    }
    const page = filtros.page && filtros.page > 0 ? filtros.page : 1;
    const limit =
      filtros.limit && filtros.limit > 0 ? Math.min(filtros.limit, 500) : 20;

    const { data, total } = await this.repository.findAportesEmpresa(
      empresaId,
      {
        desde: filtros.desde ? new Date(filtros.desde) : undefined,
        hasta: filtros.hasta ? new Date(filtros.hasta) : undefined,
        tipoMaterialId: filtros.tipoMaterialId,
      },
      (page - 1) * limit,
      limit,
    );

    return {
      data: data.map((ingreso) => ({
        id: ingreso.id,
        fecha: ingreso.fechaIngreso,
        cooperativa: ingreso.cooperativa?.razonSocial ?? null,
        material: ingreso.tipoMaterial.nombre,
        peso: ingreso.peso,
        tokens: ingreso.tokensAcumulados,
      })),
      total,
      page,
      limit,
    };
  }

  // ─── E5-HU03: comprobante digital de un aporte ───

  /**
   * Comprobante de un aporte puntual, solo para la empresa dueña del ingreso.
   * Se genera al confirmarse el ingreso: existe desde que el ingreso queda
   * REGISTRADO, con `txHash`/`bloque` recién disponibles una vez ACUÑADO.
   */
  async comprobante(id: string, empresaId: string | null) {
    if (!empresaId) {
      throw new ForbiddenException(
        'El usuario no está asociado a ninguna empresa',
      );
    }
    const ingreso = await this.repository.findByIdFull(id);
    if (!ingreso) {
      throw new NotFoundException(`IngresoMaterial ${id} no encontrado`);
    }
    if (ingreso.empresaId !== empresaId) {
      throw new ForbiddenException('Este aporte no pertenece a tu empresa');
    }
    return {
      id: ingreso.id,
      fecha: ingreso.fechaIngreso,
      cooperativa: ingreso.cooperativa?.razonSocial ?? null,
      material: ingreso.tipoMaterial.nombre,
      peso: ingreso.peso,
      tokens: ingreso.tokensAcumulados,
      estado: ingreso.estado.nombre,
      txHash: ingreso.movimientoToken?.txHash ?? null,
    };
  }

  /** tokens = peso × cantidadPorKilo del puntaje vigente, redondeado. */
  private calcularTokens(peso: number, cantidadPorKilo: string): number {
    const factor = Number(cantidadPorKilo);
    if (!Number.isFinite(factor) || factor < 0) {
      throw new BadRequestException(
        `Puntaje inválido (cantidadPorKilo = ${cantidadPorKilo})`,
      );
    }
    return Math.round(peso * factor);
  }

  /**
   * Intenta acuñar. Devuelve el ingreso ACUÑADO si sale bien, o `null` si la
   * acuñación no está disponible o falló (el ingreso permanece REGISTRADO).
   */
  private async acunarSiPosible(
    ingresoId: string,
    walletEmpresa: string,
    material: string,
    peso: number,
    tokens: number,
  ) {
    if (!this.blockchain.mintDisponible) {
      this.logger.warn(
        `Acuñación no disponible; el ingreso ${ingresoId} queda REGISTRADO (pendiente).`,
      );
      return null;
    }
    try {
      const { txHash, bloque } = await this.blockchain.mint(
        walletEmpresa,
        tokens,
        material,
        peso,
      );
      const acunado = await this.repository.findEstadoByNombre(ESTADO_ACUNADO);
      if (!acunado) {
        this.logger.error(
          `Falta el estado ${ESTADO_ACUNADO}; el ingreso ${ingresoId} queda REGISTRADO.`,
        );
        return null;
      }
      return await this.repository.acunar(
        ingresoId,
        tokens,
        txHash,
        bloque,
        acunado.id,
      );
    } catch (err) {
      this.logger.error(
        `La acuñación del ingreso ${ingresoId} falló: ${(err as Error).message}. Queda reintentable.`,
      );
      return null;
    }
  }
}
