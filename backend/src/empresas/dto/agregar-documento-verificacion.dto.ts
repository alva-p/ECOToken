import { IsEnum } from 'class-validator';
import { TipoDocumento } from '@prisma/client';

/**
 * Metadata que acompaña la subida de un documento de verificación (E3-HU05).
 * El archivo en sí viaja como multipart (campo `archivo`); acá solo se valida
 * el tipo de documento presentado.
 */
export class AgregarDocumentoVerificacionDto {
  @IsEnum(TipoDocumento)
  tipo: TipoDocumento;
}
