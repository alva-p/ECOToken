import { api } from '@/lib/api';

export interface VolumenPorEmpresa {
  empresaId: string;
  razonSocial: string;
  kgReciclados: number;
  tokensAcumulados: number;
  aportes: number;
}

export interface VolumenReciclado {
  data: VolumenPorEmpresa[];
  porMaterial: { material: string; kg: number }[];
  porMes: { mes: string; kgPorMaterial: Record<string, number> }[];
  totalKg: number;
  totalTokens: number;
  empresasActivas: number;
  desde: string | null;
  hasta: string | null;
}

export interface VolumenFiltros {
  desde?: string;
  hasta?: string;
}

/** Volumen reciclado por canal empresarial en un período (E9-HU02). */
export function obtenerVolumen(
  filtros: VolumenFiltros = {},
): Promise<VolumenReciclado> {
  const params = new URLSearchParams();
  if (filtros.desde) params.set('desde', filtros.desde);
  if (filtros.hasta) params.set('hasta', filtros.hasta);
  const qs = params.toString();
  return api<VolumenReciclado>(`/reportes/volumen${qs ? `?${qs}` : ''}`);
}

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
