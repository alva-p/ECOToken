import { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LoadingState } from '@/components/ui/States';
import type { Empresa } from '@/types';
import {
  listarEmpresasPendientes,
  aprobarEmpresa,
  rechazarEmpresa,
} from '../api';

interface AccionPendiente {
  empresa: Empresa;
  accion: 'aprobar' | 'rechazar';
}

interface Credenciales {
  razonSocial: string;
  email: string;
  passwordTemporal: string;
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}

// Empresas pendientes de alta (E3-HU04): backend ya existía desde Sprint 3
// (registro, aprobar, rechazar) pero nunca se conectó a esta pantalla.
export function AdminDashboardPage() {
  const [pendientes, setPendientes] = useState<Empresa[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState<AccionPendiente | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [credenciales, setCredenciales] = useState<Credenciales | null>(null);

  async function cargar() {
    setError(null);
    try {
      setPendientes(await listarEmpresasPendientes());
    } catch {
      setError('No se pudieron cargar las empresas pendientes.');
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function confirmar() {
    if (!pendiente) return;
    setEnviando(true);
    setError(null);
    try {
      const { empresa, accion } = pendiente;
      if (accion === 'aprobar') {
        const res = await aprobarEmpresa(empresa.id);
        setCredenciales({
          razonSocial: empresa.razonSocial,
          email: res.credencialesTemporales.email,
          passwordTemporal: res.credencialesTemporales.passwordTemporal,
        });
      } else {
        await rechazarEmpresa(empresa.id);
      }
      setPendiente(null);
      await cargar();
    } catch {
      setError(
        `No se pudo ${pendiente.accion} a ${pendiente.empresa.razonSocial}. Intentá de nuevo.`,
      );
    } finally {
      setEnviando(false);
    }
  }

  if (!pendientes && !error) {
    return <LoadingState label="Cargando empresas pendientes…" />;
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-eco-ink">
        Empresas pendientes de alta
      </h2>
      {error && <p className="text-xs text-eco-danger">{error}</p>}

      {credenciales && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-eco-org bg-eco-org-soft px-4 py-3 text-sm">
          <div>
            <div className="font-semibold text-eco-ink">
              {credenciales.razonSocial} aprobada
            </div>
            <p className="mt-1 text-eco-ink2">
              Credenciales temporales (comunicárselas a la empresa):
            </p>
            <p className="mt-0.5 text-eco-ink">
              {credenciales.email} /{' '}
              <span className="font-mono">{credenciales.passwordTemporal}</span>
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setCredenciales(null)}
            className="text-eco-ink2 hover:text-eco-ink"
          >
            ✕
          </button>
        </div>
      )}

      <Table
        columns={[
          { label: 'Empresa' },
          { label: 'CUIT' },
          { label: 'Solicitud' },
          { label: 'Acciones', align: 'right' },
        ]}
        rows={(pendientes ?? []).map((empresa) => ({
          cells: [
            empresa.razonSocial,
            empresa.cuit,
            new Date(empresa.fechaRegistro).toLocaleDateString('es-AR'),
            <div key="acciones" className="flex justify-end gap-2">
              <Button
                variant="outline"
                color="danger"
                className="px-2.5 py-1 text-xs"
                onClick={() => setPendiente({ empresa, accion: 'rechazar' })}
              >
                Rechazar
              </Button>
              <Button
                color="org"
                className="px-2.5 py-1 text-xs"
                onClick={() => setPendiente({ empresa, accion: 'aprobar' })}
              >
                Aprobar
              </Button>
            </div>,
          ],
        }))}
        emptyLabel="No hay solicitudes pendientes."
      />

      <ConfirmModal
        open={pendiente !== null}
        title={
          pendiente
            ? `${pendiente.accion === 'aprobar' ? 'Aprobar' : 'Rechazar'} empresa`
            : ''
        }
        description={
          pendiente && (
            <>
              Esto {pendiente.accion === 'aprobar' ? 'aprueba' : 'rechaza'} el
              alta de <strong>{pendiente.empresa.razonSocial}</strong> (CUIT{' '}
              {pendiente.empresa.cuit}).{' '}
              {pendiente.accion === 'aprobar' &&
                'Se le crea su usuario y contraseña temporal de acceso.'}
            </>
          )
        }
        confirmLabel={
          enviando ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> Enviando…
            </span>
          ) : (
            'Confirmar'
          )
        }
        confirmDisabled={enviando}
        danger={pendiente?.accion === 'rechazar'}
        onConfirm={confirmar}
        onClose={() => !enviando && setPendiente(null)}
      />
    </div>
  );
}
