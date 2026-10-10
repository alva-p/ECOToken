import { api } from '@/lib/api';

import type { Aporte } from './dashboard/data';

/** Aportes planos para el Panel de Gestión Ambiental (las métricas se derivan en dashboard/data.ts). */
export const obtenerAportes = () => api<Aporte[]>('/reportes/ingresos');

export type TipoBeneficio = 'WEB' | 'PANTALLAS' | 'OTRO';

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
