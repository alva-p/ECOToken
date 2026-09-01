import { useEffect, useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { Empresa } from '@/types';
import { EditarEmpresaModal } from '../components/EditarEmpresaModal';
import {
  altaCooperativa,
  darDeBajaEmpresa,
  editarEmpresa,
  filtrarEmpresas,
  listarEmpresas,
  type AltaCooperativaResponse,
} from '../api';

const EMPTY_FORM = {
  razonSocial: '',
  cuit: '',
  emailContacto: '',
  domicilio: '',
  representanteLegal: '',
};

export function CooperativasPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [cooperativas, setCooperativas] = useState<Empresa[]>([]);
  const [editando, setEditando] = useState<Empresa | null>(null);
  const [dandoBaja, setDandoBaja] = useState<Empresa | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<AltaCooperativaResponse | null>(
    null,
  );

  async function cargar() {
    try {
      setCooperativas(await listarEmpresas('COOPERATIVA'));
    } catch {
      setError('No se pudieron cargar las cooperativas.');
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function setField(field: keyof typeof EMPTY_FORM) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((actual) => ({ ...actual, [field]: event.target.value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setResultado(null);
    const nuevosErrores: Record<string, string> = {};
    if (!form.razonSocial.trim()) {
      nuevosErrores.razonSocial = 'La razón social es obligatoria.';
    }
    const cuit = form.cuit.replace(/\D/g, '');
    if (cuit.length !== 11) {
      nuevosErrores.cuit = 'El CUIT debe tener 11 dígitos.';
    }
    if (!/^\S+@\S+\.\S+$/.test(form.emailContacto)) {
      nuevosErrores.emailContacto = 'Ingresá un email válido.';
    }
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length) return;

    setSubmitting(true);
    try {
      const res = await altaCooperativa({
        razonSocial: form.razonSocial.trim(),
        cuit,
        emailContacto: form.emailContacto.trim(),
        domicilio: form.domicilio.trim() || undefined,
        representanteLegal: form.representanteLegal.trim() || undefined,
      });
      setResultado(res);
      setForm(EMPTY_FORM);
      await cargar();
    } catch {
      setError(
        'No se pudo dar de alta la cooperativa. Verificá los datos e intentá de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmarBaja() {
    if (!dandoBaja) return;
    setSubmitting(true);
    setError(null);
    try {
      await darDeBajaEmpresa(dandoBaja.id);
      setDandoBaja(null);
      await cargar();
    } catch {
      setError(
        'No se pudo revocar VALIDATOR_ROLE. La cooperativa continúa activa.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const cooperativasVisibles = filtrarEmpresas(cooperativas, busqueda);

  return (
    <div className="flex flex-col gap-5">
      <Card className="max-w-lg p-6">
        <h2 className="mb-4 text-sm font-semibold text-eco-ink">
          Dar de alta una cooperativa
        </h2>
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
          <Button type="submit" color="muni" disabled={submitting}>
            {submitting ? 'Dando de alta…' : 'Dar de alta'}
          </Button>
        </form>
      </Card>

      {error && <p className="text-xs text-eco-danger">{error}</p>}

      {resultado && (
        <Card className="max-w-lg border-eco-org p-6">
          <h2 className="mb-3 text-sm font-semibold text-eco-ink">
            Cooperativa dada de alta
          </h2>
          <p className="break-all text-sm text-eco-ink">
            VALIDATOR_ROLE:{' '}
            <span className="font-mono">{resultado.direccionEVM}</span>
          </p>
          <p className="mt-2 text-sm text-eco-ink">
            Credenciales: {resultado.credencialesTemporales.email} /{' '}
            <span className="font-mono">
              {resultado.credencialesTemporales.passwordTemporal}
            </span>
          </p>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-eco-ink">
          Cooperativas registradas
        </h2>
        <div className="mb-4 max-w-sm">
          <Field
            label="Buscar cooperativa"
            type="search"
            placeholder="Razón social, CUIT o email"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>
        <Table
          columns={[
            { label: 'Cooperativa' },
            { label: 'CUIT' },
            { label: 'Actividad' },
            { label: 'Acciones', align: 'right' },
          ]}
          rows={cooperativasVisibles.map((cooperativa) => ({
            cells: [
              <div key="cooperativa">
                <div>{cooperativa.razonSocial}</div>
                <div className="text-xs text-eco-ink2">
                  {cooperativa.emailContacto}
                </div>
              </div>,
              cooperativa.cuit,
              cooperativa.activa ? 'Activa' : 'Baja',
              <div key="acciones" className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  color="ink"
                  className="px-2.5 py-1 text-xs"
                  onClick={() => setEditando(cooperativa)}
                >
                  Editar
                </Button>
                {cooperativa.activa && (
                  <Button
                    variant="ghost"
                    color="danger"
                    className="px-2.5 py-1 text-xs"
                    onClick={() => setDandoBaja(cooperativa)}
                  >
                    Dar de baja
                  </Button>
                )}
              </div>,
            ],
          }))}
          emptyLabel={
            busqueda
              ? 'No hay cooperativas que coincidan con la búsqueda.'
              : 'No hay cooperativas registradas.'
          }
        />
      </div>

      <EditarEmpresaModal
        empresa={editando}
        onClose={() => setEditando(null)}
        onSave={async (dto) => {
          if (!editando) return;
          await editarEmpresa(editando.id, dto);
          setEditando(null);
          await cargar();
        }}
      />

      <ConfirmModal
        open={dandoBaja !== null}
        title="Dar de baja cooperativa"
        description={
          dandoBaja && (
            <>
              Se revocará el VALIDATOR_ROLE de{' '}
              <strong>{dandoBaja.razonSocial}</strong> y luego se bloqueará su
              acceso. Su historial se conservará.
            </>
          )
        }
        confirmLabel={submitting ? 'Revocando rol…' : 'Confirmar baja'}
        confirmDisabled={submitting}
        danger
        onConfirm={confirmarBaja}
        onClose={() => !submitting && setDandoBaja(null)}
      />
    </div>
  );
}
