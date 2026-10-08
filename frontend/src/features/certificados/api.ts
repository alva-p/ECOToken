import { api, apiBlob } from '@/lib/api';

/** Aporte (entrega) del mes que respalda los kg de un certificado. */
export interface AporteCertificado {
  fecha: string;
  material: string;
  kg: number;
  tokens: number;
  txHash: string | null;
}

export interface CertificadoVerificado {
  id: string;
  fechaEmision: string;
  mes: number;
  anio: number;
  posicion: number;
  kgReciclados: number;
  co2Evitado: number;
  hashVerificacion: string;
  urlPDF: string | null;
  txHashOnChain: string | null;
  empresa: { razonSocial: string };
  aportes: AporteCertificado[];
}

export interface ResultadoVerificacion {
  valido: boolean;
  certificado?: CertificadoVerificado;
}

/** Validación pública de un certificado por hash/QR (E8-HU03). */
export function verificarCertificado(
  hash: string,
): Promise<ResultadoVerificacion> {
  return api<ResultadoVerificacion>(
    `/certificados/verificar/${encodeURIComponent(hash)}`,
  );
}

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

/** Reporte mensual de actividad (PDF) del mes de un certificado propio. */
export function descargarReportePdf(id: string): Promise<Blob> {
  return apiBlob(`/certificados/${id}/reporte`);
}
