import { api } from '@/lib/api';

/** Saldo actual de tokens ECO de la empresa logueada (E6-HU01). */
export function miSaldo(): Promise<{ saldo: number }> {
  return api<{ saldo: number }>('/tokens/mi-saldo');
}
