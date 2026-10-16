import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { Empresa } from '@/types';
import { EditarEmpresaModal } from '../components/EditarEmpresaModal';
import { AltaCooperativaModal } from '../components/AltaCooperativaModal';
import {
  darDeBajaEmpresa,
  editarEmpresa,
  filtrarEmpresas,
  listarEmpresas,
  type AltaCooperativaResponse,
} from '../api';

export function CooperativasPage() {
  const [cooperativas, setCooperativas] = useState<Empresa[]>([]);
  const [editando, setEditando] = useState<Empresa | null>(null);
  const [dandoBaja, setDandoBaja] = useState<Empresa | null>(null);
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
      <div className="flex items-end justify-between gap-4">
        <div className="w-full max-w-sm">
          <Field
            label="Buscar cooperativa"
            type="search"
            placeholder="Razón social, CUIT o email"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>
        <Button
          color="muni"
          onClick={() => {
            setResultado(null);
            setMostrarAlta(true);
          }}
        >
          Dar de alta cooperativa
        </Button>
      </div>

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

      <AltaCooperativaModal
        open={mostrarAlta}
        onClose={() => setMostrarAlta(false)}
        onCreated={(res) => {
          setResultado(res);
          setMostrarAlta(false);
          cargar();
        }}
      />

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
