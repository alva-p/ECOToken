import { api } from '@/lib/api';
import type { Empresa, TipoMaterial, Puntaje } from '@/types';

/** Buscador de empresas adheridas APROBADAS, con autocompletado (E4-HU03). */
export function buscarEmpresas(query: string): Promise<Empresa[]> {
  return api<Empresa[]>(`/empresas/buscar?q=${encodeURIComponent(query)}`);
}

/** Tipos de material, para el selector del formulario de registro (E5-HU01). */
export function listarMateriales(): Promise<TipoMaterial[]> {
  return api<TipoMaterial[]>('/materiales');
}

/** Tabla de conversión vigente (peso → tokens), para estimar el resumen antes de confirmar. */
export function listarPuntajesVigentes(): Promise<Puntaje[]> {
  return api<Puntaje[]>('/puntajes/vigentes');
}

export interface RegistrarIngresoInput {
  empresaId: string;
  tipoMaterialId: string;
  peso: number;
}

/** Ingreso ya persistido (y acuñado si el mint estuvo disponible), tal como lo
 * devuelve el backend con sus relaciones. */
export interface IngresoRegistrado {
  id: string;
  peso: number;
  tokensAcumulados: number;
  estado: { nombre: string };
  tipoMaterial: { nombre: string };
  movimientoToken: { txHash: string | null } | null;
}

/** Registra un ingreso de material y dispara la acuñación (E5-HU01). */
export function registrarIngreso(
  dto: RegistrarIngresoInput,
): Promise<IngresoRegistrado> {
  return api<IngresoRegistrado>('/ingresos/registro', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/** Reintenta la acuñación de un ingreso que quedó pendiente (E5-HU01). */
export function reintentarAcunacion(id: string): Promise<IngresoRegistrado> {
  return api<IngresoRegistrado>(`/ingresos/${id}/acunar`, { method: 'POST' });
}
