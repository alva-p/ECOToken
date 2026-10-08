import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException } from '@nestjs/common';
import { CertificadosService } from './certificados.service';
import { CertificadoDigitalRepository } from './repository/certificado-digital.repository';
import { EmpresasService } from '../empresas/empresas.service';
import { BlockchainService } from '../blockchain/blockchain.service';

describe('CertificadosService', () => {
  let service: CertificadosService;
  let repository: {
    findByHash: jest.Mock;
    findIngresosDelPeriodo: jest.Mock;
    emitir: jest.Mock;
    findByEmpresaId: jest.Mock;
    findByIdConEmpresa: jest.Mock;
    findEntregasDelPeriodo: jest.Mock;
    sumarTokensAntesDe: jest.Mock;
    sumarCo2AnioPrevio: jest.Mock;
  };
  let empresas: { findOne: jest.Mock };
  let blockchain: { emitirCertificado: jest.Mock };
  let jwt: { sign: jest.Mock };
  let config: { get: jest.Mock };

  beforeEach(async () => {
    repository = {
      findByHash: jest.fn(),
      findIngresosDelPeriodo: jest.fn().mockResolvedValue([]),
      emitir: jest.fn().mockResolvedValue({ id: 'cert1' }),
      findByEmpresaId: jest.fn(),
      findByIdConEmpresa: jest.fn(),
      findEntregasDelPeriodo: jest.fn().mockResolvedValue([]),
      sumarTokensAntesDe: jest.fn().mockResolvedValue(0),
      sumarCo2AnioPrevio: jest.fn().mockResolvedValue(0),
    };
    empresas = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'emp1', walletAddress: '0xabc' }),
    };
    blockchain = { emitirCertificado: jest.fn().mockResolvedValue(null) };
    jwt = { sign: jest.fn().mockReturnValue('jwt-firmado') };
    config = {
      get: jest.fn((key: string) => {
        const valores: Record<string, unknown> = {
          'certificados.topX': 0,
          'certificados.factoresCo2': {
            PLASTICO: 1.5,
            CARTON: 1.5,
            VIDRIO: 1.5,
          },
          corsOrigin: 'http://localhost:5173',
        };
        return valores[key];
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CertificadosService,
        { provide: CertificadoDigitalRepository, useValue: repository },
        { provide: EmpresasService, useValue: empresas },
        { provide: BlockchainService, useValue: blockchain },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = moduleRef.get(CertificadosService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('verificar (E8-HU03)', () => {
    it('normaliza mayúsculas, espacios y prefijo 0x', async () => {
      await service.verificar(' 0xAB12CD ');
      expect(repository.findByHash).toHaveBeenCalledWith('ab12cd');
    });

    it('hash existente devuelve valido true con el certificado', async () => {
      const fecha = new Date('2026-04-03T12:00:00Z');
      repository.findByHash.mockResolvedValue({
        id: '1',
        empresaId: 'emp1',
        mes: 4,
        anio: 2026,
        hashVerificacion: 'abc',
      });
      repository.findEntregasDelPeriodo.mockResolvedValue([
        {
          fechaIngreso: fecha,
          peso: 120,
          tokensAcumulados: 1800,
          tipoMaterial: { nombre: 'Plástico PET' },
          movimientoToken: { txHash: '0xtx' },
        },
        {
          fechaIngreso: fecha,
          peso: 5,
          tokensAcumulados: 40,
          tipoMaterial: { nombre: 'Vidrio' },
          movimientoToken: null,
        },
      ]);

      const r = await service.verificar('abc');

      expect(repository.findEntregasDelPeriodo).toHaveBeenCalledWith(
        'emp1',
        4,
        2026,
      );
      // No filtra el id interno de la empresa y lista los aportes del mes.
      expect(r).toEqual({
        valido: true,
        certificado: {
          id: '1',
          mes: 4,
          anio: 2026,
          hashVerificacion: 'abc',
          aportes: [
            {
              fecha,
              material: 'Plástico PET',
              kg: 120,
              tokens: 1800,
              txHash: '0xtx',
            },
            { fecha, material: 'Vidrio', kg: 5, tokens: 40, txHash: null },
          ],
        },
      });
    });

    it('hash inexistente devuelve valido false', async () => {
      repository.findByHash.mockResolvedValue(null);

      expect(await service.verificar('no-existe')).toEqual({ valido: false });
    });
  });

  describe('emitirCertificadosDelMes (E8-HU01)', () => {
    const grilla = [
      {
        empresaId: 'emp1',
        razonSocial: 'Eco SRL',
        tokens: 50,
        totalKg: 25,
        cantidadAportes: 1,
        posicion: 1,
      },
      {
        empresaId: 'emp2',
        razonSocial: 'Otra SA',
        tokens: 10,
        totalKg: 5,
        cantidadAportes: 1,
        posicion: 2,
      },
    ];

    it('emite un certificado por cada empresa de la grilla cuando topX es 0 (todas)', async () => {
      const resultado = await service.emitirCertificadosDelMes(3, 2026, grilla);

      expect(repository.emitir).toHaveBeenCalledTimes(2);
      expect(resultado).toEqual({ intentados: 2, emitidos: 2, fallidos: 0 });
    });

    it('congela el reporte mensual junto con el certificado (mismo cierre)', async () => {
      repository.findEntregasDelPeriodo.mockResolvedValue([
        {
          fechaIngreso: new Date('2026-03-05T12:00:00Z'),
          peso: 25,
          tokensAcumulados: 50,
          tipoMaterial: { nombre: 'Vidrio' },
          movimientoToken: { txHash: '0xtx' },
        },
      ]);
      repository.sumarTokensAntesDe.mockResolvedValue(1000);
      repository.sumarCo2AnioPrevio.mockResolvedValue(10);

      await service.emitirCertificadosDelMes(3, 2026, [grilla[0]]);

      expect(repository.emitir).toHaveBeenCalledWith(
        expect.objectContaining({
          reporteSnapshot: expect.objectContaining({
            saldoAnterior: 1000,
            canjes: 0,
            entregas: [
              expect.objectContaining({ material: 'Vidrio', txHash: '0xtx' }),
            ],
          }),
        }),
      );
    });

    it('si falla una empresa, sigue con las demás y lo refleja en el resumen', async () => {
      empresas.findOne
        .mockRejectedValueOnce(new Error('empresa dada de baja'))
        .mockResolvedValue({ id: 'emp2', walletAddress: '0xdef' });

      const resultado = await service.emitirCertificadosDelMes(3, 2026, grilla);

      expect(repository.emitir).toHaveBeenCalledTimes(1);
      expect(repository.emitir).toHaveBeenCalledWith(
        expect.objectContaining({ empresaId: 'emp2' }),
      );
      expect(resultado).toEqual({ intentados: 2, emitidos: 1, fallidos: 1 });
    });

    it('recorta a las primeras X empresas cuando topX > 0', async () => {
      config.get.mockImplementation((key: string) =>
        key === 'certificados.topX' ? 1 : 1.5,
      );

      await service.emitirCertificadosDelMes(3, 2026, grilla);

      expect(repository.emitir).toHaveBeenCalledTimes(1);
      expect(repository.emitir).toHaveBeenCalledWith(
        expect.objectContaining({ empresaId: 'emp1' }),
      );
    });

    it('calcula co2Evitado a partir de los kg reciclados y el factor configurado', async () => {
      repository.findIngresosDelPeriodo.mockResolvedValue([
        { peso: 100, tipoMaterial: { nombre: 'PLASTICO' } },
      ]);

      await service.emitirCertificadosDelMes(3, 2026, [grilla[0]]);

      expect(repository.emitir).toHaveBeenCalledWith(
        expect.objectContaining({ kgReciclados: 100, co2Evitado: 150 }),
      );
    });

    it('guarda el txHashOnChain cuando el anclaje on-chain responde', async () => {
      blockchain.emitirCertificado.mockResolvedValue({
        txHash: '0xdeadbeef',
        bloque: 42,
      });

      await service.emitirCertificadosDelMes(3, 2026, [grilla[0]]);

      expect(repository.emitir).toHaveBeenCalledWith(
        expect.objectContaining({ txHashOnChain: '0xdeadbeef' }),
      );
    });

    it('sigue emitiendo el certificado si el anclaje on-chain no está disponible', async () => {
      blockchain.emitirCertificado.mockResolvedValue(null);

      await service.emitirCertificadosDelMes(3, 2026, [grilla[0]]);

      const dto = repository.emitir.mock.calls[0][0];
      expect(dto.txHashOnChain).toBeUndefined();
    });
  });

  describe('misCertificados / obtenerPdf (E8-HU02)', () => {
    it('misCertificados rechaza si el usuario no tiene empresa asociada', () => {
      expect(() => service.misCertificados(null)).toThrow(ForbiddenException);
    });

    it('obtenerPdf rechaza si el certificado no pertenece a la empresa', async () => {
      repository.findByIdConEmpresa.mockResolvedValue({
        id: 'cert1',
        empresaId: 'emp1',
        empresa: { razonSocial: 'Eco SRL' },
      });

      await expect(
        service.obtenerPdf('cert1', 'otra-empresa'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('obtenerReportePdf rechaza si el certificado no pertenece a la empresa', async () => {
      repository.findByIdConEmpresa.mockResolvedValue({
        id: 'cert1',
        empresaId: 'emp1',
      });

      await expect(
        service.obtenerReportePdf('cert1', 'otra-empresa'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('obtenerReportePdf usa el snapshot guardado sin consultar los ingresos', async () => {
      repository.findByIdConEmpresa.mockResolvedValue({
        id: 'abcd-1',
        empresaId: 'emp1',
        mes: 4,
        anio: 2026,
        posicion: 2,
        totalEmpresas: 12,
        co2Evitado: 398,
        fechaEmision: new Date('2026-05-01T03:00:00Z'),
        hashVerificacion: 'h'.repeat(64),
        reporteSnapshot: {
          entregas: [
            {
              fecha: '2026-04-03T12:00:00.000Z',
              material: 'Cartón',
              kg: 85,
              tokens: 850,
              txHash: null,
            },
          ],
          saldoAnterior: 45130,
          canjes: 0,
          co2Anio: 1121,
        },
        empresa: {
          razonSocial: 'Eco SRL',
          cuit: '30-71204185-3',
          domicilio: null,
          walletAddress: '0x' + 'a'.repeat(40),
        },
      });

      const pdf = await service.obtenerReportePdf('abcd-1', 'emp1');

      expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
      expect(repository.findEntregasDelPeriodo).not.toHaveBeenCalled();
    });

    it('obtenerReportePdf genera un PDF con las entregas del mes', async () => {
      repository.findByIdConEmpresa.mockResolvedValue({
        id: 'abcd-1',
        empresaId: 'emp1',
        mes: 4,
        anio: 2026,
        posicion: 2,
        totalEmpresas: 12,
        co2Evitado: 398,
        hashVerificacion: 'h'.repeat(64),
        empresa: {
          razonSocial: 'Eco SRL',
          cuit: '30-71204185-3',
          domicilio: null,
          walletAddress: '0x' + 'a'.repeat(40),
        },
      });
      repository.findEntregasDelPeriodo.mockResolvedValue([
        {
          fechaIngreso: new Date('2026-04-03T12:00:00Z'),
          peso: 120,
          tokensAcumulados: 1800,
          tipoMaterial: { nombre: 'Plástico PET' },
          movimientoToken: { txHash: '0x' + 'b'.repeat(64) },
        },
      ]);
      repository.sumarTokensAntesDe.mockResolvedValue(45130);
      repository.sumarCo2AnioPrevio.mockResolvedValue(1121);

      const pdf = await service.obtenerReportePdf('abcd-1', 'emp1');

      expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
      expect(repository.sumarTokensAntesDe).toHaveBeenCalledWith(
        'emp1',
        4,
        2026,
      );
    });
  });
});
