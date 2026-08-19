/**
 * Tipos del dominio ECOToken alineados al modelo del backend (prisma/schema.prisma).
 * Modelo custodial: el frontend consume REST + WebSocket y NUNCA maneja wallets.
 *
 * Convenciones:
 * - Fechas: el backend serializa DateTime como string ISO (JSON) → acá son `string`.
 * - Campos nullables del backend → `T | null`.
 *
 * Seguridad (§8 custodial): estos tipos OMITEN a propósito los datos sensibles que
 * el backend nunca debe enviar al cliente:
 *   - Usuario.passwordHash
 *   - BilleteraCustodial.clavePrivadaCifrada
 */

// ─── Enums (reflejan los enums de Prisma) ───

/** Rol funcional del usuario (RBAC). Coincide con el enum TipoRol del backend. */
export type TipoRol = 'EMPRESA' | 'COOPERATIVA' | 'MUNICIPALIDAD' | 'ADMIN';

/** Alias del rol usado por routes/ProtectedRoute y AuthContext. */
export type UserRole = TipoRol;

/** Categoría de una Empresa. La cooperativa es una Empresa con categoria = COOPERATIVA. */
export type CategoriaEmpresa = 'EMPRESA' | 'COOPERATIVA';

/** Estado de aprobación de una Empresa (E3-HU04). Solo APROBADA puede operar. */
export type EstadoEmpresa = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

// ─── Entidades ───

/**
 * Usuario de sesión (lado cliente). El campo `rol` corresponde a `tipoRol` en el
 * backend; se mantiene como `rol` porque lo consumen ProtectedRoute y AuthContext.
 */
export interface Usuario {
  id: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  empresaId: string | null;
  municipalidadId: string | null;
}

/** Municipalidad: autoridad institucional (consume reportes y ranking público). */
export interface Municipalidad {
  id: string;
  nombre: string;
  ciudad: string;
}

/** Empresa adherida (o cooperativa validadora si categoria = COOPERATIVA). */
export interface Empresa {
  id: string;
  razonSocial: string;
  cuit: string;
  domicilio: string | null;
  representanteLegal: string | null;
  emailContacto: string | null;
  estado: EstadoEmpresa;
  categoria: CategoriaEmpresa;
  fechaRegistro: string;
  nombre: string | null;
  datosContacto: string | null;
  activa: boolean;
}

/**
 * Billetera custodial (dirección EVM) administrada por el backend para una Empresa.
 * NO incluye la clave privada: es un secreto que jamás se expone al frontend.
 */
export interface BilleteraCustodial {
  id: string;
  direccionEVM: string;
  tipoRolOnChain: string;
  empresaId: string;
}

/** Reporte consolidado por período (empresa / cooperativa / municipio). */
export interface Reporte {
  id: string;
  periodo: string;
  fechaGeneracion: string;
  datosConsolidados: Record<string, unknown>;
  creadorPor: string;
  empresaId: string | null;
}

/** Tipo de material reciclable. Ahora es entidad (antes era enum). */
export interface TipoMaterial {
  id: string;
  nombre: string;
  descripcion: string | null;
}

/** Estado de un IngresoMaterial (p. ej. REGISTRADO, VALIDADO, ACUÑADO). */
export interface Estado {
  id: string;
  nombre: string;
  descripcion: string | null;
}

/** Configuración de puntaje (tokens por kilo) versionada por período para un material. */
export interface Puntaje {
  id: string;
  fechaDesde: string;
  fechaHasta: string | null;
  versionConfig: string;
  cantidadPorKilo: string;
  tipoMaterialId: string;
}

/** Ingreso de material entregado por una Empresa y validado por una cooperativa. */
export interface IngresoMaterial {
  id: string;
  peso: number;
  fechaIngreso: string;
  tokensAcumulados: number;
  empresaId: string;
  tipoMaterialId: string;
  estadoId: string;
}

/** Movimiento de tokens on-chain (mint/burn) asociado a un IngresoMaterial. */
export interface MovimientoToken {
  id: string;
  cantidad: number;
  txHash: string | null;
  bloque: number | null;
  fecha: string;
  ingresoMaterialId: string;
}

/** Certificado digital verificable emitido a una Empresa (con anclaje on-chain). */
export interface CertificadoDigital {
  id: string;
  fechaEmision: string;
  hashVerificacion: string;
  urlPDF: string | null;
  txHashOnChain: string | null;
  empresaId: string;
}

/** Ranking mensual (snapshot auditable) del reconocimiento ambiental. */
export interface Ranking {
  id: string;
  mes: number;
  anio: number;
  fechaCierre: string | null;
  hashSnapshot: string | null;
  bloqueReferencia: number | null;
  estado: string | null;
  empresaId: string | null;
}
