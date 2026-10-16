import { useEffect, useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { subirDocumentoVerificacion, type TipoDocumento } from '../api';

const TIPOS_DOCUMENTO: { value: TipoDocumento; label: string }[] = [
  { value: 'ACTA_CONSTITUCION', label: 'Acta de constitución' },
  { value: 'LICENCIA_COMERCIAL', label: 'Licencia comercial' },
  { value: 'DOCUMENTO_IMPOSITIVO', label: 'Documento impositivo' },
  { value: 'FACTURA_SERVICIOS', label: 'Factura de servicios' },
];

interface Props {
  open: boolean;
  empresaId: string;
  onClose: () => void;
  onEnviado: () => void;
}

/**
 * Modal para validar la empresa (E3-HU05): la empresa adjunta documentación
 * oficial y queda EN_REVISION. Se abre desde el botón de "Mi Perfil".
 */
export function VerificarEmpresaModal({
  open,
  empresaId,
  onClose,
  onEnviado,
}: Props) {
  const [tipo, setTipo] = useState<TipoDocumento>('ACTA_CONSTITUCION');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resetear cada vez que se abre.
  useEffect(() => {
    if (open) {
      setTipo('ACTA_CONSTITUCION');
      setArchivo(null);
      setError(null);
    }
  }, [open]);

  async function enviar() {
    setError(null);
    if (!archivo) {
      setError('Seleccioná un archivo (PDF o imagen).');
      return;
    }
    setEnviando(true);
    try {
      await subirDocumentoVerificacion(empresaId, tipo, archivo);
      onEnviado();
    } catch {
      setError(
        'No se pudo subir el documento. Verificá que sea PDF/imagen y menor a 5 MB.',
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ConfirmModal
      open={open}
      title="Verificar empresa"
      description={
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-sm text-eco-ink2">
            Adjuntá documentación oficial para validar la identidad de tu
            empresa. Al enviarla, tu verificación queda en revisión.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-eco-ink2">Tipo de documento</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoDocumento)}
              className="rounded-lg border border-eco-border bg-eco-surface px-3 py-2 text-sm text-eco-ink"
            >
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-eco-ink2">
              Archivo (PDF o imagen, máx. 5 MB)
            </label>
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              className="text-sm text-eco-ink2 file:mr-3 file:rounded-md file:border-0 file:bg-eco-bg file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-eco-ink"
            />
          </div>
          {error && <p className="text-xs text-eco-danger">{error}</p>}
        </div>
      }
      confirmLabel={enviando ? 'Enviando…' : 'Enviar documento'}
      confirmDisabled={enviando}
      onConfirm={enviar}
      onClose={() => !enviando && onClose()}
    />
  );
}
