import type { TipoDocumento } from '@prisma/client';
import type { Empresa } from './empresa.entity';

/**
 * Documento adjuntado por una Empresa para su verificación (E3-HU05).
 * El archivo se almacena en el servidor; acá viven su metadata y la ruta.
 */
export class DocumentoVerificacion {
  id: string;
  tipo: TipoDocumento;
  archivoUrl: string;
  nombreArchivo: string | null;
  mimeType: string | null;
  tamanioBytes: number | null;
  fechaCarga: Date;

  empresa?: Empresa;
  empresaId: string;
}
