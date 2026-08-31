import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { registrarEmpresa } from '../api';
import { TerminosModal, VERSION_TERMINOS } from '../components/TerminosModal';

const EMPTY_FORM = {
  razonSocial: '',
  cuit: '',
  emailContacto: '',
  domicilio: '',
  representanteLegal: '',
};

function soloDigitos(cuit: string): string {
  return cuit.replace(/\D/g, '');
}

// Registro público de empresa (E3-HU01): la HU vive desde Sprint 3 en el
// backend (validación de CUIT, unicidad de email, términos y condiciones)
// pero nunca tuvo pantalla — "Registrala acá" en el login era un texto sin
// acción. El registro queda PENDIENTE hasta que un admin lo aprueba o
// rechaza (E3-HU04).
export function RegistroPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);

  function setField(field: keyof typeof EMPTY_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validar(): boolean {
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
    if (!aceptaTerminos) {
      nuevosErrores.aceptaTerminos =
        'Tenés que aceptar los términos y condiciones.';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorEnvio(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      await registrarEmpresa({
        razonSocial: form.razonSocial.trim(),
        cuit: soloDigitos(form.cuit),
        emailContacto: form.emailContacto.trim(),
        domicilio: form.domicilio.trim() || undefined,
        representanteLegal: form.representanteLegal.trim() || undefined,
        aceptaTerminos: true,
        versionTerminos: VERSION_TERMINOS,
      });
      setEnviado(true);
    } catch (err) {
      setErrorEnvio(
        err instanceof Error && err.message.includes('409')
          ? 'Ya hay una empresa registrada con ese CUIT o email.'
          : 'No se pudo enviar el registro. Verificá los datos e intentá de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-eco-bg px-6 py-12">
        <Card className="w-full max-w-md p-7 text-center">
          <h1 className="text-xl font-bold tracking-tight text-eco-ink">
            ¡Listo! Tu registro quedó enviado
          </h1>
          <p className="mt-3 text-sm text-eco-ink2">
            Tu solicitud está <strong>pendiente de aprobación</strong>. Vamos a
            revisar los datos y te contactamos a{' '}
            <strong>{form.emailContacto}</strong> cuando tu cuenta esté
            habilitada.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block text-sm font-semibold text-eco-org"
          >
            ← Volver al inicio
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-eco-bg px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-eco-ink">
            Registrá tu empresa
          </h1>
          <p className="mt-2 text-sm text-eco-ink2">
            Sumate al ecosistema ECOToken. Tu solicitud queda pendiente hasta
            que la aprobemos.
          </p>
        </div>

        <Card className="p-7">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
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
              label="Email de contacto (será tu email de acceso)"
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

            <label className="flex items-start gap-2 text-xs text-eco-ink2">
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="mt-0.5 bg-eco-surface"
              />
              Acepto los{' '}
              <button
                type="button"
                onClick={() => setMostrarTerminos(true)}
                className="font-bold text-eco-org underline-offset-2 hover:underline"
              >
                términos y condiciones
              </button>{' '}
              de uso de ECOToken.
            </label>
            {errores.aceptaTerminos && (
              <p className="-mt-3 text-xs text-eco-danger">
                {errores.aceptaTerminos}
              </p>
            )}

            {errorEnvio && (
              <p className="text-xs text-eco-danger">{errorEnvio}</p>
            )}

            <Button type="submit" color="org" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar registro'}
            </Button>
          </form>
        </Card>

        <div className="mt-5 text-center text-sm text-eco-ink2">
          <Link to="/login" className="font-semibold text-eco-org">
            ← Ya tengo una cuenta
          </Link>
        </div>
      </div>

      <TerminosModal
        open={mostrarTerminos}
        onClose={() => setMostrarTerminos(false)}
      />
    </div>
  );
}
