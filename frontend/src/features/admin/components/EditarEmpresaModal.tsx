import { useEffect, useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Field } from '@/components/ui/Field';
import type { Empresa } from '@/types';
import type { EditarEmpresaInput } from '../api';

interface Props {
  empresa: Empresa | null;
  onClose: () => void;
  onSave: (dto: EditarEmpresaInput) => Promise<void>;
}

const EMPTY_FORM = {
  razonSocial: '',
  cuit: '',
  emailContacto: '',
  domicilio: '',
  representanteLegal: '',
};

const soloDigitos = (cuit: string) => cuit.replace(/\D/g, '');

export function EditarEmpresaModal({ empresa, onClose, onSave }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!empresa) return;
    setForm({
      razonSocial: empresa.razonSocial,
      cuit: empresa.cuit,
      emailContacto: empresa.emailContacto ?? '',
      domicilio: empresa.domicilio ?? '',
      representanteLegal: empresa.representanteLegal ?? '',
    });
    setErrores({});
  }, [empresa]);

  function setField(field: keyof typeof EMPTY_FORM) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((actual) => ({ ...actual, [field]: event.target.value }));
  }

  async function guardar() {
    const nuevosErrores: Record<string, string> = {};
    if (!form.razonSocial.trim()) {
      nuevosErrores.razonSocial = 'La razón social es obligatoria.';
    }
    if (soloDigitos(form.cuit).length !== 11) {
      nuevosErrores.cuit = 'El CUIT debe tener 11 dígitos.';
    }
    if (!/^\S+@\S+\.\S+$/.test(form.emailContacto)) {
      nuevosErrores.emailContacto = 'Ingresá un email válido.';
    }
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length) return;

    setGuardando(true);
    try {
      await onSave({
        razonSocial: form.razonSocial.trim(),
        cuit: soloDigitos(form.cuit),
        emailContacto: form.emailContacto.trim(),
        domicilio: form.domicilio.trim(),
        representanteLegal: form.representanteLegal.trim(),
      });
    } catch {
      setErrores({ envio: 'No se pudo guardar. Revisá el CUIT y el email.' });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ConfirmModal
      open={empresa !== null}
      title={`Editar ${empresa?.categoria === 'COOPERATIVA' ? 'cooperativa' : 'empresa'}`}
      description={
        <div className="mt-4 flex flex-col gap-3">
          <Field
            label="Razón social"
            required
            value={form.razonSocial}
            onChange={setField('razonSocial')}
            error={errores.razonSocial}
          />
          <Field
            label="CUIT"
            required
            value={form.cuit}
            onChange={setField('cuit')}
            error={errores.cuit}
          />
          <Field
            label="Email de contacto y acceso"
            type="email"
            required
            value={form.emailContacto}
            onChange={setField('emailContacto')}
            error={errores.emailContacto}
          />
          <Field
            label="Domicilio"
            value={form.domicilio}
            onChange={setField('domicilio')}
          />
          <Field
            label="Representante legal"
            value={form.representanteLegal}
            onChange={setField('representanteLegal')}
          />
          {errores.envio && (
            <p className="text-xs text-eco-danger">{errores.envio}</p>
          )}
        </div>
      }
      confirmLabel={guardando ? 'Guardando…' : 'Guardar'}
      confirmDisabled={guardando}
      onConfirm={guardar}
      onClose={() => !guardando && onClose()}
    />
  );
}
