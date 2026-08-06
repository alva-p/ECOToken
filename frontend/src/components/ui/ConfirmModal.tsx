import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './Button';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// <dialog> nativo: foco atrapado, cierre con Escape y backdrop ya vienen del
// navegador (Baseline desde 2022) — evita sumar Radix solo para esto.
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="w-[min(90vw,460px)] rounded-xl border border-eco-border p-0 backdrop:bg-black/45"
    >
      <div className="p-6">
        <h2 className="text-lg font-bold tracking-tight text-eco-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-eco-ink2">
            {description}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2.5">
          <Button variant="outline" color="ink" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button color={danger ? 'danger' : 'org'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
