import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { fechaAR } from '@/lib/fecha';
import type { EstadoVerificacion, Empresa } from '@/types';
import {
  aprobarVerificacion,
  descargarDocumento,
  listarDocumentosVerificacion,
  rechazarVerificacion,
  type DocumentoVerificacion,
  type TipoDocumentoVerif,
} from '../api';

const ETIQUETA_TIPO: Record<TipoDocumentoVerif, string> = {
  ACTA_CONSTITUCION: 'Acta de constitución',
  LICENCIA_COMERCIAL: 'Licencia comercial',
  DOCUMENTO_IMPOSITIVO: 'Documento impositivo',
  FACTURA_SERVICIOS: 'Factura de servicios',
};

const VERIF_LABEL: Record<EstadoVerificacion, string> = {
  SIN_VERIFICAR: 'Sin verificar',
  EN_REVISION: 'En revisión',
  VERIFICADA: 'Verificada',
  RECHAZADA: 'Rechazada',
};

const VERIF_COLOR: Record<
  EstadoVerificacion,
  'ink' | 'muni' | 'org' | 'danger'
> = {
  SIN_VERIFICAR: 'ink',
  EN_REVISION: 'muni',
  VERIFICADA: 'org',
  RECHAZADA: 'danger',
};

interface Props {
  empresa: Empresa | null; // null → cerrado
  onClose: () => void;
  onResolved: () => void;
}

/**
 * Revisión KYB de una organización puntual: muestra el estado de verificación
 * y sus documentos (con descarga) y permite aprobar o rechazar. Se abre desde
 * la fila del usuario de empresa/cooperativa en la gestión de usuarios.
 */
export function RevisarVerificacionModal({
  empresa,
  onClose,
  onResolved,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = empresa !== null;
  const [docs, setDocs] = useState<DocumentoVerificacion[] | null>(null);
  const [descargando, setDescargando] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!empresa) return;
    setDocs(null);
    setError(null);
    listarDocumentosVerificacion(empresa.id)
      .then(setDocs)
      .catch(() => {
        setDocs([]);
        setError('No se pudieron cargar los documentos.');
      });
  }, [empresa]);

  async function descargar(doc: DocumentoVerificacion) {
    setDescargando(doc.id);
    try {
      const blob = await descargarDocumento(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nombreArchivo ?? 'documento';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('No se pudo descargar el documento.');
    } finally {
      setDescargando(null);
    }
  }

  async function resolver(tipo: 'aprobar' | 'rechazar') {
    if (!empresa) return;
    setProcesando(true);
    setError(null);
    try {
      if (tipo === 'aprobar') await aprobarVerificacion(empresa.id);
      else await rechazarVerificacion(empresa.id);
      onResolved();
    } catch {
      setError('No se pudo procesar la verificación.');
    } finally {
      setProcesando(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="w-[min(92vw,560px)] rounded-xl border border-eco-border bg-eco-surface p-0 backdrop:bg-black/45"
    >
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight text-eco-ink">
            Verificación de empresa
          </h2>
          {empresa && (
            <Badge color={VERIF_COLOR[empresa.estadoVerificacion]}>
              {VERIF_LABEL[empresa.estadoVerificacion]}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-sm text-eco-ink2">{empresa?.razonSocial}</p>

        <div className="mt-4 flex flex-col gap-2">
          {docs === null ? (
            <p className="text-xs text-eco-ink2">Cargando documentos…</p>
          ) : docs.length === 0 ? (
            <p className="text-xs text-eco-ink2">
              Esta organización todavía no cargó documentación.
            </p>
          ) : (
            docs.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-eco-border bg-eco-bg px-3 py-2"
              >
                <div className="text-xs">
                  <span className="font-medium text-eco-ink">
                    {ETIQUETA_TIPO[doc.tipo]}
                  </span>
                  <span className="text-eco-ink2">
                    {' · '}
                    {doc.nombreArchivo ?? '—'} · {fechaAR(doc.fechaCarga)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  color="muni"
                  className="px-2.5 py-1 text-xs"
                  disabled={descargando === doc.id}
                  onClick={() => descargar(doc)}
                >
                  {descargando === doc.id ? 'Descargando…' : 'Descargar'}
                </Button>
              </div>
            ))
          )}
        </div>

        {error && <p className="mt-3 text-xs text-eco-danger">{error}</p>}

        <div className="mt-5 flex justify-end gap-2.5">
          <Button variant="outline" color="ink" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            variant="ghost"
            color="danger"
            disabled={procesando}
            onClick={() => resolver('rechazar')}
          >
            Rechazar
          </Button>
          <Button
            color="org"
            disabled={procesando}
            onClick={() => resolver('aprobar')}
          >
            {procesando ? 'Procesando…' : 'Aprobar'}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
