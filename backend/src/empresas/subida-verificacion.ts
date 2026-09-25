/**
 * Configuración de la subida de documentos de verificación de empresas (E3-HU05).
 *
 * Se usa la opción `dest` de Multer (a través de `FileInterceptor`), que crea el
 * directorio y guarda el archivo con un nombre aleatorio. La validación de tipo
 * y tamaño se hace con `ParseFilePipe` en el controller.
 */

/** Directorio donde se almacenan los documentos (relativo al cwd del backend). */
export const DIRECTORIO_VERIFICACION =
  process.env.UPLOADS_DIR ?? 'uploads/verificacion';

/** Tamaño máximo por documento: 5 MB. */
export const TAMANIO_MAXIMO_DOCUMENTO = 5 * 1024 * 1024;

/** Tipos MIME aceptados: PDF e imágenes (acta, licencia, factura, etc.). */
export const MIME_DOCUMENTO_VERIFICACION =
  /^(application\/pdf|image\/(jpeg|png|webp))$/;

/**
 * Forma mínima del archivo que deja Multer. Se declara acá para no depender de
 * `@types/multer` (no instalado). Con la opción `dest`, Multer completa
 * `path` y `filename`.
 */
export interface ArchivoSubido {
  originalname: string;
  mimetype: string;
  size: number;
  filename: string;
  path: string;
}
