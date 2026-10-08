import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { CertificadoDigitalRepository } from './repository/certificado-digital.repository';
import { CreateCertificadoDigitalDto } from './dto/create-certificado-digital.dto';
import { UpdateCertificadoDigitalDto } from './dto/update-certificado-digital.dto';
import { EmpresasService } from '../empresas/empresas.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import type { FilaRankingMes } from '../ranking/interfaces/ranking-resultado.interface';
import type { DesgloseMaterial } from './desglose-material';
import { generarCertificadoPdf } from './pdf/certificado-pdf';
import { generarReportePdf } from './pdf/reporte-pdf';

/** Agrupa kg por nombre de material (E8-HU02, desglose del PDF). */
function sumarPorMaterial(
  ingresos: { peso: number; tipoMaterial: { nombre: string } }[],
): DesgloseMaterial[] {
  const porMaterial = new Map<string, number>();
  for (const ingreso of ingresos) {
    const nombre = ingreso.tipoMaterial.nombre;
    porMaterial.set(nombre, (porMaterial.get(nombre) ?? 0) + ingreso.peso);
  }
  return [...porMaterial.entries()].map(([material, kg]) => ({
    material,
    kg,
  }));
}

/** Lógica de negocio de CertificadoDigital. */
@Injectable()
export class CertificadosService {
  private readonly logger = new Logger(CertificadosService.name);

  constructor(
    private readonly repository: CertificadoDigitalRepository,
    private readonly empresas: EmpresasService,
    private readonly blockchain: BlockchainService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  create(dto: CreateCertificadoDigitalDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const certificado = await this.repository.findById(id);
    if (!certificado)
      throw new NotFoundException(`CertificadoDigital ${id} no encontrado`);
    return certificado;
  }

  async update(id: string, dto: UpdateCertificadoDigitalDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }

  // ─── E8-HU03: validación pública por hash/QR ───
  async verificar(hash: string) {
    // Se guarda en minúsculas sin prefijo; el explorador muestra el bytes32 en
    // mayúsculas y/o con 0x, así que se normaliza antes de buscar.
    const normalizado = hash.trim().replace(/^0x/i, '').toLowerCase();
    const certificado = await this.repository.findByHash(normalizado);
    return certificado ? { valido: true, certificado } : { valido: false };
  }

  // ─── E8-HU01: emisión al cierre del ranking mensual ───

  /**
   * Emite certificado a cada fila de la grilla cerrada (Top X configurable;
   * `certificados.topX` = 0 significa "todas las empresas con aportes ese
   * mes", que es el default). La grilla ya viene ordenada por posición.
   *
   * Cada empresa se emite en su propio try/catch: que falle una (ej. un
   * problema puntual de red al anclar on-chain) no debe cortar la emisión de
   * las demás. El resumen devuelto ({emitidos, fallidos}) es la auditoría —
   * "0 fallidos" confirma que se emitieron todos; si hay fallidos, se puede
   * reintentar ese mes con `reemitirCertificados` sin volver a cerrar el
   * ranking (es idempotente, `emitir` hace upsert).
   */
  async emitirCertificadosDelMes(
    mes: number,
    anio: number,
    grilla: FilaRankingMes[],
  ): Promise<{ intentados: number; emitidos: number; fallidos: number }> {
    const topX = this.config.get<number>('certificados.topX') ?? 0;
    const destinatarios = topX > 0 ? grilla.slice(0, topX) : grilla;

    let emitidos = 0;
    let fallidos = 0;
    for (const fila of destinatarios) {
      try {
        await this.emitirCertificado(fila, mes, anio, grilla.length);
        emitidos++;
      } catch (err) {
        fallidos++;
        this.logger.error(
          `No se pudo emitir el certificado de ${fila.empresaId} (${mes}/${anio}): ${(err as Error).message}`,
        );
      }
    }
    return { intentados: destinatarios.length, emitidos, fallidos };
  }

  private async emitirCertificado(
    fila: FilaRankingMes,
    mes: number,
    anio: number,
    totalEmpresas: number,
  ): Promise<void> {
    const empresa = await this.empresas.findOne(fila.empresaId);
    const ingresos = await this.repository.findIngresosDelPeriodo(
      fila.empresaId,
      mes,
      anio,
    );
    const kgReciclados = ingresos.reduce((sum, i) => sum + i.peso, 0);
    const desglosePorMaterial = sumarPorMaterial(ingresos);
    const factoresCo2 =
      this.config.get<Record<string, number>>('certificados.factoresCo2') ?? {};
    // Un material sin factor conocido no suma CO2 evitado (no hay dato para
    // asumir uno).
    const co2Evitado = desglosePorMaterial.reduce(
      (sum, d) => sum + d.kg * (factoresCo2[d.material] ?? 0),
      0,
    );

    const hashVerificacion = createHash('sha256')
      .update(
        JSON.stringify({
          empresaId: fila.empresaId,
          mes,
          anio,
          posicion: fila.posicion,
          kgReciclados,
          co2Evitado,
        }),
      )
      .digest('hex');

    // Credencial verificable firmada: JWT propio (no la sesión de login de 1
    // día) porque un certificado tiene que seguir siendo verificable durante
    // años, no solo mientras dura la sesión.
    const credencialFirmada = this.jwt.sign(
      {
        mes,
        anio,
        posicion: fila.posicion,
        kgReciclados,
        co2Evitado,
        hash: hashVerificacion,
      },
      { subject: fila.empresaId, expiresIn: '3650d' },
    );

    const onchain = await this.blockchain.emitirCertificado(
      empresa.walletAddress,
      mes,
      anio,
      hashVerificacion,
    );

    await this.repository.emitir({
      empresaId: fila.empresaId,
      mes,
      anio,
      posicion: fila.posicion,
      totalEmpresas,
      kgReciclados,
      co2Evitado,
      desglosePorMaterial:
        desglosePorMaterial as unknown as Prisma.InputJsonValue,
      hashVerificacion,
      credencialFirmada,
      ...(onchain ? { txHashOnChain: onchain.txHash } : {}),
    });
  }

  // ─── E8-HU02: visualizar y descargar el certificado propio ───

  /** Certificados de la empresa logueada, más reciente primero. */
  misCertificados(empresaId: string | null) {
    if (!empresaId) {
      throw new ForbiddenException(
        'El usuario no está asociado a ninguna empresa',
      );
    }
    return this.repository.findByEmpresaId(empresaId);
  }

  /** PDF del certificado, solo para la empresa dueña. */
  async obtenerPdf(id: string, empresaId: string | null): Promise<Buffer> {
    const certificado = await this.certificadoPropio(id, empresaId);

    const frontendUrl = this.config.get<string>('corsOrigin') ?? '';
    return generarCertificadoPdf({
      razonSocial: certificado.empresa.razonSocial,
      mes: certificado.mes,
      anio: certificado.anio,
      posicion: certificado.posicion,
      totalEmpresas: certificado.totalEmpresas,
      kgReciclados: certificado.kgReciclados,
      co2Evitado: certificado.co2Evitado,
      desglosePorMaterial:
        certificado.desglosePorMaterial as unknown as DesgloseMaterial[],
      hashVerificacion: certificado.hashVerificacion,
      urlVerificacion: `${frontendUrl}/verificar/${certificado.hashVerificacion}`,
    });
  }

  /**
   * Reporte mensual de actividad (PDF) del período de un certificado propio.
   * Solo hay reporte de meses cerrados: cuelga del certificado del mes.
   */
  async obtenerReportePdf(
    id: string,
    empresaId: string | null,
  ): Promise<Buffer> {
    const cert = await this.certificadoPropio(id, empresaId);
    const [entregas, saldoAnterior, co2Anio] = await Promise.all([
      this.repository.findEntregasDelPeriodo(
        cert.empresaId,
        cert.mes,
        cert.anio,
      ),
      this.repository.sumarTokensAntesDe(cert.empresaId, cert.mes, cert.anio),
      this.repository.sumarCo2Anio(cert.empresaId, cert.mes, cert.anio),
    ]);
    const frontendUrl = this.config.get<string>('corsOrigin') ?? '';
    return generarReportePdf({
      numero: `REP-${cert.anio}-${String(cert.mes).padStart(2, '0')}-${cert.id.slice(0, 4).toUpperCase()}`,
      mes: cert.mes,
      anio: cert.anio,
      razonSocial: cert.empresa.razonSocial,
      cuit: cert.empresa.cuit,
      domicilio: cert.empresa.domicilio,
      walletAddress: cert.empresa.walletAddress,
      entregas: entregas.map((e) => ({
        fecha: e.fechaIngreso,
        material: e.tipoMaterial.nombre,
        kg: e.peso,
        tokens: e.tokensAcumulados,
        txHash: e.movimientoToken?.txHash ?? null,
      })),
      saldoAnterior,
      // ponytail: el sistema aún no registra canjes; sale 0 hasta que exista ese flujo
      canjes: 0,
      co2Mes: cert.co2Evitado,
      co2Anio,
      posicion: cert.posicion,
      totalEmpresas: cert.totalEmpresas,
      hashVerificacion: cert.hashVerificacion,
      urlVerificacion: `${frontendUrl}/verificar/${cert.hashVerificacion}`,
      explorerUrl: this.config.get<string>('explorerUrl') ?? '',
      emitidoEn: new Date(),
    });
  }

  /** Certificado con datos de empresa; exige que pertenezca a la empresa logueada. */
  private async certificadoPropio(id: string, empresaId: string | null) {
    if (!empresaId) {
      throw new ForbiddenException(
        'El usuario no está asociado a ninguna empresa',
      );
    }
    const certificado = await this.repository.findByIdConEmpresa(id);
    if (!certificado) {
      throw new NotFoundException(`CertificadoDigital ${id} no encontrado`);
    }
    if (certificado.empresaId !== empresaId) {
      throw new ForbiddenException(
        'Este certificado no pertenece a tu empresa',
      );
    }
    return certificado;
  }
}
