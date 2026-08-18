import { useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { altaCooperativa, type AltaCooperativaResponse } from '../api';

const EMPTY_FORM = {
  razonSocial: '',
  cuit: '',
  emailContacto: '',
  domicilio: '',
  representanteLegal: '',
};

// Formulario de alta de cooperativa (E4-HU01): da de alta la Empresa
// (categoria COOPERATIVA), genera su cuenta operadora on-chain (VALIDATOR_ROLE)
// y las credenciales con las que va a iniciar sesión (E4-HU02).
export function CooperativasPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<AltaCooperativaResponse | null>(
    null,
  );

  function setField(field: keyof typeof EMPTY_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setResultado(null);
    setSubmitting(true);
    try {
      const res = await altaCooperativa({
        razonSocial: form.razonSocial,
        cuit: form.cuit,
        emailContacto: form.emailContacto,
        domicilio: form.domicilio || undefined,
        representanteLegal: form.representanteLegal || undefined,
      });
      setResultado(res);
      setForm(EMPTY_FORM);
    } catch {
      setError(
        'No se pudo dar de alta la cooperativa. Verificá los datos e intentá de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="max-w-lg p-6">
        <h2 className="mb-4 text-sm font-semibold text-eco-ink">
          Dar de alta una cooperativa
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Field
            label="Razón social"
            required
            value={form.razonSocial}
            onChange={setField('razonSocial')}
          />
          <Field
            label="CUIT"
            required
            value={form.cuit}
            onChange={setField('cuit')}
            placeholder="20-12345678-6"
          />
          <Field
            label="Email de contacto (también es el email de acceso)"
            type="email"
            required
            value={form.emailContacto}
            onChange={setField('emailContacto')}
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
          {error && <p className="text-xs text-eco-danger">{error}</p>}
          <Button type="submit" color="muni" disabled={submitting}>
            {submitting ? 'Dando de alta…' : 'Dar de alta'}
          </Button>
        </form>
      </Card>

      {resultado && (
        <Card className="max-w-lg border-eco-org p-6">
          <h2 className="mb-3 text-sm font-semibold text-eco-ink">
            Cooperativa dada de alta
          </h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-eco-ink2">
                Cuenta operadora (VALIDATOR_ROLE)
              </dt>
              <dd className="break-all font-mono text-eco-ink">
                {resultado.direccionEVM}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-eco-ink2">
                Transacción on-chain
              </dt>
              <dd className="break-all font-mono text-eco-ink">
                {resultado.txHash}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-eco-ink2">
                Credenciales temporales (comunicárselas a la cooperativa)
              </dt>
              <dd className="text-eco-ink">
                {resultado.credencialesTemporales.email} /{' '}
                <span className="font-mono">
                  {resultado.credencialesTemporales.passwordTemporal}
                </span>
              </dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}
