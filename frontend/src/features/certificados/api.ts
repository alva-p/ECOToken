import { api, apiBlob } from '@/lib/api';

/** Certificado propio, tal como lo emitió el cierre mensual (E8-HU01/E8-HU02). */
export interface MiCertificado {
  id: string;
  fechaEmision: string;
  mes: number;
  anio: number;
  posicion: number;
  kgReciclados: number;
  co2Evitado: number;
  hashVerificacion: string;
  txHashOnChain: string | null;
}

/** Certificados de la empresa logueada (E8-HU02). */
export function misCertificados(): Promise<MiCertificado[]> {
  return api<MiCertificado[]>('/certificados/mios');
}

/** PDF del certificado (E8-HU02), listo para descargar. */
export function descargarCertificadoPdf(id: string): Promise<Blob> {
  return apiBlob(`/certificados/${id}/pdf`);
}
