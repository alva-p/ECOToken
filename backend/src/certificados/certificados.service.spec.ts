import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CertificadosService } from './certificados.service';
import { CertificadoDigitalRepository } from './repository/certificado-digital.repository';
import { EmpresasService } from '../empresas/empresas.service';
import { BlockchainService } from '../blockchain/blockchain.service';

describe('CertificadosService', () => {
  let service: CertificadosService;
  let repository: {
    findIngresosDelPeriodo: jest.Mock;
    emitir: jest.Mock;
  };
  let empresas: { findOne: jest.Mock };
  let blockchain: { emitirCertificado: jest.Mock };
  let jwt: { sign: jest.Mock };
  let config: { get: jest.Mock };

  beforeEach(async () => {
    repository = {
      findIngresosDelPeriodo: jest.fn().mockResolvedValue([]),
      emitir: jest.fn().mockResolvedValue({ id: 'cert1' }),
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
});
