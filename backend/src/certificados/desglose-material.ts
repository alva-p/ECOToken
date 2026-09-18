/** Desglose de kg reciclados por tipo de material al emitir un certificado
 * (E8-HU01) — lo consume también el PDF (E8-HU02). */
export interface DesgloseMaterial {
  material: string;
  kg: number;
}
