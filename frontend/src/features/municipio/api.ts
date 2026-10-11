import { api } from '@/lib/api';
import { aHoraArgentina } from '@/lib/fecha';

import type { Aporte } from './dashboard/data';

/**
 * Aportes planos para el Panel de Gestión Ambiental (las métricas se derivan
 * en dashboard/data.ts). Las fechas se pasan a hora argentina al recibirlas.
 */
export const obtenerAportes = () =>
  api<Aporte[]>('/reportes/ingresos').then((a) =>
    a.map((x) => ({ ...x, fecha: aHoraArgentina(x.fecha) })),
  );

export type TipoBeneficio = 'WEB' | 'PANTALLAS' | 'OTRO';

export const TIPOS_BENEFICIO: Record<TipoBeneficio, string> = {
  WEB: 'Publicidad web',
  PANTALLAS: 'Pantallas digitales',
  OTRO: 'Otro',
};

export interface Beneficio {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoBeneficio;
  costoTokens: number;
  cupos: number | null;
  vigenteHasta: string | null;
  activo: boolean;
}

export type BeneficioInput = Omit<Beneficio, 'id' | 'activo'>;

export const listarBeneficios = () => api<Beneficio[]>('/beneficios');

export const crearBeneficio = (dto: BeneficioInput) =>
  api<Beneficio>('/beneficios', { method: 'POST', body: JSON.stringify(dto) });

export const actualizarBeneficio = (id: string, dto: Partial<Beneficio>) =>
  api<Beneficio>(`/beneficios/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });

export const eliminarBeneficio = (id: string) =>
  api<Beneficio>(`/beneficios/${id}`, { method: 'DELETE' });

// ─── Solicitudes de canje ───

export type EstadoCanje = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

export interface Canje {
  id: string;
  costoTokens: number;
  estado: EstadoCanje;
  beneficioId: string;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
  beneficio: { titulo: string; tipo: TipoBeneficio };
}

export interface CanjeConEmpresa extends Canje {
  empresa: { razonSocial: string };
}

export const listarCanjes = () => api<CanjeConEmpresa[]>('/beneficios/canjes');

export const resolverCanje = (id: string, estado: 'APROBADO' | 'RECHAZADO') =>
  api<Canje>(`/beneficios/canjes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
