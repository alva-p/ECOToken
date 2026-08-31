import { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LoadingState } from '@/components/ui/States';
import { txLink } from '@/lib/explorer';
import {
  listarCuentasConRoles,
  otorgarRol,
  revocarRol,
  ROLES_GOBERNABLES,
  type CuentaConRoles,
  type RolOnChain,
} from '../api';

interface AccionPendiente {
  cuenta: CuentaConRoles;
  rol: RolOnChain;
  accion: 'otorgar' | 'revocar';
}

interface TxConfirmada {
  cuenta: CuentaConRoles;
  rol: RolOnChain;
  accion: 'otorgar' | 'revocar';
  txHash: string;
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}

// Panel de gobernanza de roles on-chain (E10-HU01): lista las cuentas
// custodiales con el estado real de cada rol (leído del contrato via
// hasRole) y permite otorgar/revocar cada uno, con confirmación por modal.
export function RolesPage() {
  const [cuentas, setCuentas] = useState<CuentaConRoles[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState<AccionPendiente | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [ultimaTx, setUltimaTx] = useState<TxConfirmada | null>(null);

  async function cargar() {
    setError(null);
    try {
      setCuentas(await listarCuentasConRoles());
    } catch {
      setError('No se pudieron cargar las cuentas y sus roles.');
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function confirmar() {
    if (!pendiente) return;
    setEnviando(true);
    setError(null);
    setUltimaTx(null);
    try {
      const { cuenta, rol, accion } = pendiente;
      const { txHash } =
        accion === 'otorgar'
          ? await otorgarRol(cuenta.direccionEVM, rol)
          : await revocarRol(cuenta.direccionEVM, rol);
      setPendiente(null);
      setUltimaTx({ cuenta, rol, accion, txHash });
      await cargar();
    } catch {
      setError(
        `No se pudo ${pendiente.accion} ${pendiente.rol} en ${pendiente.cuenta.direccionEVM}. Intentá de nuevo.`,
      );
    } finally {
      setEnviando(false);
    }
  }

  if (!cuentas && !error) return <LoadingState label="Cargando cuentas…" />;

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-eco-ink">
        Roles on-chain por cuenta
      </h2>
      {error && <p className="text-xs text-eco-danger">{error}</p>}

      {ultimaTx && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-eco-org bg-eco-org-soft px-4 py-3 text-sm">
          <div>
            <Badge color="org">
              {ultimaTx.accion === 'otorgar' ? 'Otorgado' : 'Revocado'}
            </Badge>
            <p className="mt-1.5 text-eco-ink">
              <strong>{ultimaTx.rol}</strong>{' '}
              {ultimaTx.accion === 'otorgar' ? 'otorgado a' : 'revocado de'}{' '}
              <strong>{ultimaTx.cuenta.razonSocial ?? 'la cuenta'}</strong>.
            </p>
            <a
              href={txLink(ultimaTx.txHash)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block font-semibold text-eco-org"
            >
              Ver transacción en el explorador ↗
            </a>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setUltimaTx(null)}
            className="text-eco-ink2 hover:text-eco-ink"
          >
            ✕
          </button>
        </div>
      )}

      <Table
        columns={[
          { label: 'Cuenta' },
          ...ROLES_GOBERNABLES.map((rol) => ({ label: rol })),
        ]}
        rows={(cuentas ?? []).map((cuenta) => ({
          cells: [
            <div key="cuenta">
              <div className="font-medium">{cuenta.razonSocial ?? '—'}</div>
              <div className="break-all font-mono text-xs text-eco-ink2">
                {cuenta.direccionEVM}
              </div>
            </div>,
            ...ROLES_GOBERNABLES.map((rol) => {
              const tieneRol = cuenta.roles[rol];
              return (
                <div key={rol} className="flex items-center gap-2">
                  <Badge color={tieneRol ? 'org' : 'ink'}>
                    {tieneRol ? 'Sí' : 'No'}
                  </Badge>
                  <Button
                    variant="outline"
                    color={tieneRol ? 'danger' : 'org'}
                    className="px-2.5 py-1 text-xs"
                    onClick={() =>
                      setPendiente({
                        cuenta,
                        rol,
                        accion: tieneRol ? 'revocar' : 'otorgar',
                      })
                    }
                  >
                    {tieneRol ? 'Revocar' : 'Otorgar'}
                  </Button>
                </div>
              );
            }),
          ],
        }))}
        emptyLabel="No hay cuentas custodiales registradas."
      />

      <ConfirmModal
        open={pendiente !== null}
        title={
          pendiente
            ? `${pendiente.accion === 'otorgar' ? 'Otorgar' : 'Revocar'} ${pendiente.rol}`
            : ''
        }
        description={
          pendiente && (
            <>
              Esto {pendiente.accion === 'otorgar' ? 'otorga' : 'revoca'}{' '}
              <strong>{pendiente.rol}</strong> a{' '}
              <strong>{pendiente.cuenta.razonSocial ?? 'la cuenta'}</strong> (
              <span className="font-mono">{pendiente.cuenta.direccionEVM}</span>
              ) mediante una transacción on-chain.
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
        danger={pendiente?.accion === 'revocar'}
        onConfirm={confirmar}
        onClose={() => !enviando && setPendiente(null)}
      />
    </div>
  );
}
