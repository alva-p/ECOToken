import { useEffect, useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Field } from '@/components/ui/Field';
import { altaCooperativa, type AltaCooperativaResponse } from '../api';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (res: AltaCooperativaResponse) => void;
}

const EMPTY_FORM = {
  razonSocial: '',
  cuit: '',
  emailContacto: '',
  domicilio: '',
  representanteLegal: '',
};

const soloDigitos = (cuit: string) => cuit.replace(/\D/g, '');

/**
 * Formulario de alta de cooperativa (E4-HU01) dentro de un modal. El admin lo
 * abre con un botón desde la página de cooperativas, en vez de tenerlo siempre
 * visible. Al dar de alta con éxito, devuelve la respuesta (VALIDATOR_ROLE +
 * credenciales temporales) al padre para que la muestre.
 */
export function AltaCooperativaModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);

  // Resetear el formulario cada vez que se abre.
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrores({});
    }
  }, [open]);

  function setField(field: keyof typeof EMPTY_FORM) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((actual) => ({ ...actual, [field]: event.target.value }));
  }

  async function guardar() {
    const nuevosErrores: Record<string, string> = {};
    if (!form.razonSocial.trim()) {
      nuevosErrores.razonSocial = 'La razón social es obligatoria.';
    }
    const cuit = soloDigitos(form.cuit);
    if (cuit.length !== 11) {
      nuevosErrores.cuit = 'El CUIT debe tener 11 dígitos.';
    }
    if (!/^\S+@\S+\.\S+$/.test(form.emailContacto)) {
      nuevosErrores.emailContacto = 'Ingresá un email válido.';
    }
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length) return;

    setGuardando(true);
    try {
      const res = await altaCooperativa({
        razonSocial: form.razonSocial.trim(),
        cuit,
        emailContacto: form.emailContacto.trim(),
        domicilio: form.domicilio.trim() || undefined,
        representanteLegal: form.representanteLegal.trim() || undefined,
      });
      onCreated(res);
    } catch {
      setErrores({
        envio:
          'No se pudo dar de alta la cooperativa. Verificá los datos e intentá de nuevo.',
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ConfirmModal
      open={open}
      title="Dar de alta una cooperativa"
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
            placeholder="20-12345678-6"
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
      confirmLabel={guardando ? 'Dando de alta…' : 'Dar de alta'}
      confirmDisabled={guardando}
      onConfirm={guardar}
      onClose={() => !guardando && onClose()}
    />
  );
}
