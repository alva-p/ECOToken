import { useEffect, useState } from 'react';
import { Ban, ChevronRight, Pencil } from 'lucide-react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Field } from '@/components/ui/Field';
import { LoadingState } from '@/components/ui/States';
import { urlLogoEmpresa } from '@/features/empresa/api';
import { cx } from '@/lib/cx';
import type { Empresa, EstadoEmpresa, EstadoVerificacion } from '@/types';

const ESTADO_LABEL: Record<EstadoEmpresa, string> = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
};
const ESTADO_COLOR: Record<EstadoEmpresa, 'ink' | 'muni' | 'org' | 'danger'> = {
  PENDIENTE: 'muni',
  APROBADA: 'org',
  RECHAZADA: 'danger',
};

const VERIF_LABEL: Record<EstadoVerificacion, string> = {
  SIN_VERIFICAR: 'Sin verificar',
  EN_REVISION: 'En revisión',
  VERIFICADA: 'Verificada',
  RECHAZADA: 'Rechazada',
};
const VERIF_COLOR: Record<
  EstadoVerificacion,
  'ink' | 'muni' | 'org' | 'danger'
> = {
  SIN_VERIFICAR: 'ink',
  EN_REVISION: 'muni',
  VERIFICADA: 'org',
  RECHAZADA: 'danger',
};
import { EditarEmpresaModal } from '../components/EditarEmpresaModal';
import { EmpresaDetalleModal } from '../components/EmpresaDetalleModal';
import {
  aprobarEmpresa,
  darDeBajaEmpresa,
  editarEmpresa,
  filtrarEmpresas,
  listarEmpresas,
  pendientesPrimero,
  rechazarEmpresa,
} from '../api';

interface AccionPendiente {
  empresa: Empresa;
  accion: 'aprobar' | 'rechazar' | 'baja';
}

interface Credenciales {
  razonSocial: string;
  email: string;
  passwordTemporal: string;
}

export function AdminDashboardPage() {
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState<AccionPendiente | null>(null);
  const [editando, setEditando] = useState<Empresa | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [credenciales, setCredenciales] = useState<Credenciales | null>(null);

  async function cargar() {
    setError(null);
    try {
      setEmpresas(await listarEmpresas('EMPRESA'));
    } catch {
      setError('No se pudieron cargar las empresas.');
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
      } else if (accion === 'rechazar') {
        await rechazarEmpresa(empresa.id);
      } else {
        await darDeBajaEmpresa(empresa.id);
      }
      setPendiente(null);
      await cargar();
    } catch {
      setError(
        `No se pudo completar la operación sobre ${pendiente.empresa.razonSocial}.`,
      );
    } finally {
      setEnviando(false);
    }
  }

  if (!empresas && !error) {
    return <LoadingState label="Cargando empresas…" />;
  }

  const empresasVisibles = pendientesPrimero(
    filtrarEmpresas(empresas ?? [], busqueda),
  );
  const lista = empresas ?? [];
  const cantidadPendientes = lista.filter(
    (e) => e.estado === 'PENDIENTE',
  ).length;
  const cantidadActivas = lista.filter(
    (e) => e.activa && e.estado === 'APROBADA',
  ).length;
  const cantidadVerificadas = lista.filter(
    (e) => e.estadoVerificacion === 'VERIFICADA',
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-eco-ink">Empresas</h2>
          <p className="mt-1 text-xs text-eco-ink2">
            Las altas se originan en el registro público y se habilitan al
            aprobarlas.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="min-w-[72px] rounded-xl border border-eco-border bg-eco-surface px-3 py-1.5 text-center">
            <div className="text-lg font-bold leading-none text-eco-ink">
              {lista.length}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-eco-ink2">
              Total
            </div>
          </div>
          <div className="min-w-[72px] rounded-xl border border-eco-org/30 bg-eco-org-soft px-3 py-1.5 text-center">
            <div className="text-lg font-bold leading-none text-eco-org">
              {cantidadActivas}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-eco-org">
              Activas
            </div>
          </div>
          <div className="min-w-[72px] rounded-xl border border-eco-muni/30 bg-eco-muni-soft px-3 py-1.5 text-center">
            <div className="text-lg font-bold leading-none text-eco-muni">
              {cantidadVerificadas}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-eco-muni">
              Verificadas
            </div>
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-eco-danger">{error}</p>}

      {cantidadPendientes > 0 && (
        <div className="rounded-lg border border-eco-coop bg-eco-coop-soft px-4 py-3 text-sm text-eco-ink">
          <b>
            {cantidadPendientes}{' '}
            {cantidadPendientes === 1
              ? 'empresa pendiente'
              : 'empresas pendientes'}
          </b>{' '}
          de aprobar o rechazar, arriba de todo en la lista.
        </div>
      )}

      <div className="max-w-sm">
        <Field
          label="Buscar empresa"
          type="search"
          placeholder="Razón social, CUIT o email"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
        />
      </div>

      {credenciales && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-eco-org bg-eco-org-soft px-4 py-3 text-sm">
          <div>
            <div className="font-semibold text-eco-ink">
              {credenciales.razonSocial} aprobada
            </div>
            <p className="mt-1 text-eco-ink2">Credenciales temporales:</p>
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
          { label: 'Estado' },
          { label: 'Verificación' },
          { label: 'Actividad' },
          { label: 'Acciones', align: 'right' },
        ]}
        rows={empresasVisibles.map((empresa) => ({
          cells: [
            <button
              key="empresa"
              type="button"
              title="Abrir ficha"
              onClick={() => setDetalleId(empresa.id)}
              className="group flex w-full items-center gap-3 text-left"
            >
              {empresa.logoUrl ? (
                <img
                  src={urlLogoEmpresa(empresa.id)}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-eco-bg text-sm font-bold uppercase text-eco-ink2">
                  {empresa.razonSocial.charAt(0)}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate font-medium text-eco-ink group-hover:text-eco-org group-hover:underline">
                  {empresa.razonSocial}
                </span>
                <span className="block truncate text-xs text-eco-ink2">
                  {empresa.emailContacto}
                </span>
              </span>
              <ChevronRight
                size={16}
                aria-hidden
                className="ml-auto shrink-0 text-eco-ink3 group-hover:text-eco-org"
              />
            </button>,
            empresa.cuit,
            <Badge key="estado" color={ESTADO_COLOR[empresa.estado]}>
              {ESTADO_LABEL[empresa.estado]}
            </Badge>,
            <Badge key="verif" color={VERIF_COLOR[empresa.estadoVerificacion]}>
              {VERIF_LABEL[empresa.estadoVerificacion]}
            </Badge>,
            <span
              key="actividad"
              className="inline-flex items-center gap-1.5 text-sm text-eco-ink"
            >
              <span
                className={cx(
                  'h-2 w-2 rounded-full',
                  empresa.activa ? 'bg-eco-org' : 'bg-eco-ink3',
                )}
              />
              {empresa.activa ? 'Activa' : 'Baja'}
            </span>,
            <div key="acciones" className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                color="ink"
                className="px-2 py-1.5"
                title="Editar"
                aria-label="Editar"
                onClick={() => setEditando(empresa)}
              >
                <Pencil size={15} />
              </Button>
              {empresa.activa && empresa.estado === 'PENDIENTE' && (
                <>
                  <Button
                    variant="outline"
                    color="danger"
                    className="px-2.5 py-1 text-xs"
                    onClick={() =>
                      setPendiente({ empresa, accion: 'rechazar' })
                    }
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
                </>
              )}
              {empresa.activa && (
                <Button
                  variant="ghost"
                  color="danger"
                  className="px-2 py-1.5"
                  title="Dar de baja"
                  aria-label="Dar de baja"
                  onClick={() => setPendiente({ empresa, accion: 'baja' })}
                >
                  <Ban size={15} />
                </Button>
              )}
            </div>,
          ],
        }))}
        emptyLabel={
          busqueda
            ? 'No hay empresas que coincidan con la búsqueda.'
            : 'No hay empresas registradas.'
        }
      />

      <EmpresaDetalleModal
        empresaId={detalleId}
        onClose={() => setDetalleId(null)}
        onChanged={cargar}
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
        open={pendiente !== null}
        title={
          pendiente?.accion === 'baja'
            ? 'Dar de baja empresa'
            : `${pendiente?.accion === 'aprobar' ? 'Aprobar' : 'Rechazar'} empresa`
        }
        description={
          pendiente && (
            <>
              ¿Confirmás la operación sobre{' '}
              <strong>{pendiente.empresa.razonSocial}</strong>?
              {pendiente.accion === 'baja' &&
                ' Se conservará su historial, pero no podrá iniciar sesión ni operar.'}
            </>
          )
        }
        confirmLabel={enviando ? 'Procesando…' : 'Confirmar'}
        confirmDisabled={enviando}
        danger={pendiente?.accion !== 'aprobar'}
        onConfirm={confirmar}
        onClose={() => !enviando && setPendiente(null)}
      />
    </div>
  );
}
