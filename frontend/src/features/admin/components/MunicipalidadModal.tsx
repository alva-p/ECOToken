import { useEffect, useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Field } from '@/components/ui/Field';
import type { Municipalidad } from '@/types';
import { crearMunicipalidad, editarMunicipalidad } from '../api';

interface Props {
  open: boolean;
  municipalidad: Municipalidad | null; // null → alta; con valor → edición
  onClose: () => void;
  onSaved: () => void;
}

/** Alta / edición de una municipalidad (nombre + ciudad). */
export function MunicipalidadModal({
  open,
  municipalidad,
  onClose,
  onSaved,
}: Props) {
  const esEdicion = municipalidad !== null;
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setNombre(municipalidad?.nombre ?? '');
    setCiudad(municipalidad?.ciudad ?? '');
  }, [open, municipalidad]);

  async function guardar() {
    setError(null);
    if (!nombre.trim() || !ciudad.trim()) {
      setError('Completá el nombre y la ciudad.');
      return;
    }
    const dto = { nombre: nombre.trim(), ciudad: ciudad.trim() };
    setGuardando(true);
    try {
      if (esEdicion) {
        await editarMunicipalidad(municipalidad.id, dto);
      } else {
        await crearMunicipalidad(dto);
      }
      onSaved();
    } catch {
      setError('No se pudo guardar la municipalidad.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ConfirmModal
      open={open}
      title={esEdicion ? 'Editar municipalidad' : 'Crear municipalidad'}
      description={
        <div className="mt-4 flex flex-col gap-3">
          <Field
            label="Nombre"
            required
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
          />
          <Field
            label="Ciudad"
            required
            value={ciudad}
            onChange={(event) => setCiudad(event.target.value)}
          />
          {error && <p className="text-xs text-eco-danger">{error}</p>}
        </div>
      }
      confirmLabel={
        guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear'
      }
      confirmDisabled={guardando}
      onConfirm={guardar}
      onClose={() => !guardando && onClose()}
    />
  );
}
