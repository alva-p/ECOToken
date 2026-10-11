import { partesArt } from '../common/helpers/fecha-art.helper';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoCanje } from '@prisma/client';
import { TokensService } from '../tokens/tokens.service';
import { BeneficioRepository } from './repository/beneficio.repository';
import { CreateBeneficioDto } from './dto/create-beneficio.dto';
import { UpdateBeneficioDto } from './dto/update-beneficio.dto';

/**
 * Hoy (hora argentina) como fecha a medianoche UTC, el mismo formato en que
 * se guarda `vigenteHasta` (día elegido en el formulario): un beneficio vale
 * hasta el final de ese día en Buenos Aires.
 */
function inicioDeHoy() {
  const { anio, mes, dia } = partesArt();
  return new Date(Date.UTC(anio, mes - 1, dia));
}

/** Lógica de negocio de Beneficio (premios canjeables con tokens ECO) y sus canjes. */
@Injectable()
export class BeneficiosService {
  constructor(
    private readonly repository: BeneficioRepository,
    private readonly tokens: TokensService,
  ) {}

  create(dto: CreateBeneficioDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async update(id: string, dto: UpdateBeneficioDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    if (await this.repository.contarCanjes(id)) {
      throw new ConflictException(
        'El beneficio ya tiene solicitudes de canje: pausalo en lugar de eliminarlo.',
      );
    }
    return this.repository.remove(id);
  }

  private async findOne(id: string) {
    const beneficio = await this.repository.findById(id);
    if (!beneficio)
      throw new NotFoundException(`Beneficio ${id} no encontrado`);
    return beneficio;
  }

  // ─── Vista de la organización ───

  /**
   * Catálogo vigente con cupos libres, saldo ECO y canjes propios. Los ECO de
   * canjes no rechazados quedan reservados: el disponible es saldo − reservado.
   * ponytail: la reserva vive en la base; la quema on-chain al aprobar queda
   * para cuando el contrato tenga un flujo de burn custodial.
   */
  async paraOrganizacion(empresaId: string | null) {
    const id = this.exigirEmpresa(empresaId);
    const [{ saldo }, reservado, vigentes, ocupados, canjes] =
      await Promise.all([
        this.tokens.miSaldo(id),
        this.repository.reservado(id),
        this.repository.findVigentes(inicioDeHoy()),
        this.repository.cuposOcupados(),
        this.repository.canjesDeEmpresa(id),
      ]);
    return {
      saldo,
      reservado,
      disponible: Math.max(0, saldo - reservado),
      beneficios: vigentes.map((b) => ({
        ...b,
        cuposDisponibles:
          b.cupos === null
            ? null
            : Math.max(0, b.cupos - (ocupados.get(b.id) ?? 0)),
      })),
      canjes,
    };
  }

  /** Solicitud de canje: valida vigencia, cupos y saldo disponible. */
  async canjear(empresaId: string | null, beneficioId: string) {
    const id = this.exigirEmpresa(empresaId);
    const { saldo } = await this.tokens.miSaldo(id);
    return this.repository.transaccion(async (tx) => {
      const b = await tx.beneficio.findUnique({ where: { id: beneficioId } });
      if (!b)
        throw new NotFoundException(`Beneficio ${beneficioId} no encontrado`);
      if (!b.activo || (b.vigenteHasta && b.vigenteHasta < inicioDeHoy())) {
        throw new BadRequestException('El beneficio no está disponible.');
      }
      if (b.cupos !== null) {
        const ocupados =
          (await this.repository.cuposOcupados(tx)).get(b.id) ?? 0;
        if (ocupados >= b.cupos) {
          throw new ConflictException('No quedan cupos para este beneficio.');
        }
      }
      const reservado = await this.repository.reservado(id, tx);
      if (saldo - reservado < b.costoTokens) {
        throw new BadRequestException(
          'Saldo ECO insuficiente para este beneficio.',
        );
      }
      return tx.canje.create({
        data: { beneficioId: b.id, empresaId: id, costoTokens: b.costoTokens },
      });
    });
  }

  // ─── Gestión municipal de solicitudes ───

  listarCanjes() {
    return this.repository.findAllCanjes();
  }

  async resolverCanje(id: string, estado: 'APROBADO' | 'RECHAZADO') {
    const canje = await this.repository.findCanje(id);
    if (!canje) throw new NotFoundException(`Canje ${id} no encontrado`);
    if (canje.estado !== EstadoCanje.PENDIENTE) {
      throw new ConflictException('La solicitud ya fue resuelta.');
    }
    return this.repository.actualizarEstadoCanje(id, EstadoCanje[estado]);
  }

  private exigirEmpresa(empresaId: string | null): string {
    if (!empresaId) {
      throw new ForbiddenException(
        'El usuario no está asociado a ninguna empresa',
      );
    }
    return empresaId;
  }
}
