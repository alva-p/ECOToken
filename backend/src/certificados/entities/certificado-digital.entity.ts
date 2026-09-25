import type { Empresa } from '../../empresas/entities/empresa.entity';

/**
 * Certificado digital emitido a una empresa: comprobante verificable
 * (hash + PDF + transacción on-chain) de su aporte ambiental.
 *
 * Sin métodos de negocio: el service expone únicamente CRUD.
 */
export class CertificadoDigital {
  id: string;
  fechaEmision: Date;
  mes: number;
  anio: number;
  posicion: number;
  totalEmpresas: number;
  kgReciclados: number;
  co2Evitado: number;
  desglosePorMaterial: { material: string; kg: number }[];
  hashVerificacion: string;
  credencialFirmada: string;
  urlPDF: string | null;
  txHashOnChain: string | null;
  empresaId: string;

  // Relaciones
  empresa?: Empresa;
}
