export type UserRole = 'EMPRESA' | 'COOPERATIVA' | 'MUNICIPIO' | 'ADMIN';

export type TipoMaterial = 'PLASTICO' | 'VIDRIO' | 'CARTON';

export interface Usuario {
  id: string;
  email: string;
  rol: UserRole;
}

export interface Empresa {
  id: string;
  razonSocial: string;
  cuit: string;
  walletAddress: string;
}

export interface Certificado {
  id: string;
  periodo: string; // YYYY-MM
  posicion?: number;
  txHash?: string;
}
