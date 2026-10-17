import { useEffect, useMemo, useRef, useState } from 'react';
import { Coins, Recycle, Scale, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/States';
import { fechaAR } from '@/lib/fecha';
import {
  fmtKg,
  fmtNum,
  nombreMaterial,
  resumir,
} from '@/features/municipio/dashboard/data';
import type { Aporte } from '@/features/municipio/dashboard/data';
import { obtenerAportes } from '@/features/municipio/api';
import { urlLogoEmpresa } from '@/features/empresa/api';
import type {
  Empresa,
  EstadoEmpresa,
  EstadoVerificacion,
  TipoRol,
} from '@/types';
import { EditarEmpresaModal } from './EditarEmpresaModal';
import { RevisarVerificacionModal } from './RevisarVerificacionModal';
import {
  aprobarEmpresa,
  darDeBajaEmpresa,
  editarEmpresa,
  listarUsuarios,
  obtenerEmpresa,
  rechazarEmpresa,
  type UsuarioAdmin,
} from '../api';

const ESTADO_LABEL: Record<EstadoEmpresa, string> = {
  PENDIENTE: 'Pendiente de aprobación',
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

const ROL_LABEL: Record<TipoRol, string> = {
  EMPRESA: 'Empresa',
  COOPERATIVA: 'Cooperativa',
  MUNICIPALIDAD: 'Municipalidad',
  ADMIN: 'Administrador',
};

type Accion = 'aprobar' | 'rechazar' | 'baja';

interface Props {
  empresaId: string | null; // null → cerrado
  onClose: () => void;
  onChanged: () => void; // para recargar la tabla de fondo
}

function Dato({ label, valor }: { label: string; valor?: string | null }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-eco-ink2">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-eco-ink">{valor || '—'}</div>
    </div>
  );
}

// Ficha de una empresa/cooperativa en una ventana (modal): datos, impacto,
// usuarios y, en un mismo lugar, aprobar el alta (EstadoEmpresa) y verificar la
// documentación KYB (EstadoVerificacion).
export function EmpresaDetalleModal({ empresaId, onClose, onChanged }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = empresaId !== null;

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [accion, setAccion] = useState<Accion | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [revisando, setRevisando] = useState(false);
  const [credenciales, setCredenciales] = useState<{
    email: string;
    passwordTemporal: string;
  } | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function cargar(id: string) {
    setError(null);
    try {
      const [emp, aps, us] = await Promise.all([
        obtenerEmpresa(id),
        obtenerAportes().catch(() => [] as Aporte[]),
        listarUsuarios().catch(() => [] as UsuarioAdmin[]),
      ]);
      setEmpresa(emp);
      setAportes(aps.filter((a) => a.organizacionId === id));
      setUsuarios(us.filter((u) => u.empresaId === id));
    } catch {
      setError('No se pudo cargar la ficha de la empresa.');
    }
  }

  useEffect(() => {
    if (!empresaId) {
      setEmpresa(null);
      setCredenciales(null);
      return;
    }
    setEmpresa(null);
    cargar(empresaId);
  }, [empresaId]);

  const impacto = useMemo(() => resumir(aportes), [aportes]);

  async function confirmar() {
    if (!empresa || !accion) return;
    setEnviando(true);
    setError(null);
    try {
      if (accion === 'aprobar') {
        const res = await aprobarEmpresa(empresa.id);
        setCredenciales(res.credencialesTemporales);
      } else if (accion === 'rechazar') {
        await rechazarEmpresa(empresa.id);
      } else {
        await darDeBajaEmpresa(empresa.id);
      }
      setAccion(null);
      await cargar(empresa.id);
      onChanged();
    } catch {
      setError('No se pudo completar la operación.');
    } finally {
      setEnviando(false);
    }
  }

  const esCoop = empresa?.categoria === 'COOPERATIVA';
  const logo = empresa && empresa.logoUrl ? urlLogoEmpresa(empresa.id) : null;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="w-[min(94vw,920px)] max-h-[90vh] overflow-y-auto rounded-xl border border-eco-border bg-eco-surface p-0 backdrop:bg-black/45"
    >
      {/* Barra superior con cierre */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-eco-border bg-eco-surface px-5 py-3">
        <span className="text-sm font-semibold text-eco-ink">
          Ficha de la organización
        </span>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="rounded-md p-1 text-eco-ink2 hover:bg-eco-bg hover:text-eco-ink"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-5 p-5">
        {error && <p className="text-sm text-eco-danger">{error}</p>}

        {!empresa && !error && (
          <p className="text-sm text-eco-ink2">Cargando ficha…</p>
        )}

        {empresa && (
          <>
            {/* Encabezado */}
            <div className="flex flex-wrap items-start gap-4">
              {logo ? (
                <img
                  src={logo}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-eco-bg text-xl font-bold uppercase text-eco-ink2">
                  {empresa.razonSocial.charAt(0)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-eco-ink">
                    {empresa.razonSocial}
                  </h2>
                  <Badge color={esCoop ? 'coop' : 'org'}>
                    {esCoop ? 'Cooperativa' : 'Empresa'}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-eco-ink2">
                  CUIT {empresa.cuit} · alta {fechaAR(empresa.fechaRegistro)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge color={ESTADO_COLOR[empresa.estado]}>
                    {ESTADO_LABEL[empresa.estado]}
                  </Badge>
                  <Badge color={VERIF_COLOR[empresa.estadoVerificacion]}>
                    KYB: {VERIF_LABEL[empresa.estadoVerificacion]}
                  </Badge>
                  {!empresa.activa && (
                    <Badge color="danger">Dada de baja</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones (aprobar alta + verificar KYB en un mismo lugar) */}
            <div className="flex flex-wrap gap-2 border-y border-eco-border py-4">
              {empresa.estado === 'PENDIENTE' && empresa.activa && (
                <>
                  <Button
                    color="org"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => setAccion('aprobar')}
                  >
                    Aprobar alta
                  </Button>
                  <Button
                    variant="outline"
                    color="danger"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => setAccion('rechazar')}
                  >
                    Rechazar alta
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                color="muni"
                className="px-3 py-1.5 text-xs"
                onClick={() => setRevisando(true)}
              >
                Revisar verificación (KYB)
              </Button>
              <Button
                variant="outline"
                color="ink"
                className="px-3 py-1.5 text-xs"
                onClick={() => setEditando(true)}
              >
                Editar datos
              </Button>
              {empresa.activa && (
                <Button
                  variant="ghost"
                  color="danger"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => setAccion('baja')}
                >
                  Dar de baja
                </Button>
              )}
            </div>

            {credenciales && (
              <div className="rounded-lg border border-eco-org bg-eco-org-soft px-4 py-3 text-sm">
                <div className="font-semibold text-eco-ink">
                  Empresa aprobada — credenciales temporales
                </div>
                <p className="mt-0.5 text-eco-ink">
                  {credenciales.email} /{' '}
                  <span className="font-mono">
                    {credenciales.passwordTemporal}
                  </span>
                </p>
              </div>
            )}

            {/* Impacto */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="flex items-center gap-3 p-4">
                <Scale size={18} className="text-eco-org" />
                <div>
                  <div className="text-lg font-bold text-eco-ink">
                    {fmtKg(impacto.kg)}
                  </div>
                  <div className="text-xs text-eco-ink2">Reciclado</div>
                </div>
              </Card>
              <Card className="flex items-center gap-3 p-4">
                <Coins size={18} className="text-eco-org" />
                <div>
                  <div className="text-lg font-bold text-eco-ink">
                    {fmtNum(impacto.puntos)}
                  </div>
                  <div className="text-xs text-eco-ink2">Tokens ECO</div>
                </div>
              </Card>
              <Card className="flex items-center gap-3 p-4">
                <Recycle size={18} className="text-eco-org" />
                <div>
                  <div className="text-lg font-bold text-eco-ink">
                    {fmtNum(aportes.length)}
                  </div>
                  <div className="text-xs text-eco-ink2">Aportes</div>
                </div>
              </Card>
            </div>

            {/* Datos */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-eco-ink">
                Datos de la organización
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Dato label="Email de contacto" valor={empresa.emailContacto} />
                <Dato
                  label="Representante legal"
                  valor={empresa.representanteLegal}
                />
                <Dato label="Teléfono" valor={empresa.telefono} />
                <Dato label="Domicilio" valor={empresa.domicilio} />
                <Dato label="Código postal" valor={empresa.codigoPostal} />
                <Dato label="País" valor={empresa.pais} />
                <Dato label="Sitio web" valor={empresa.sitioWeb} />
                <Dato label="Descripción" valor={empresa.descripcion} />
              </div>
            </div>

            {/* Usuarios asociados */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-eco-ink">
                Usuarios asociados
              </h3>
              {usuarios.length === 0 ? (
                <EmptyState label="Todavía no tiene usuarios (se crean al aprobar el alta)." />
              ) : (
                <Table
                  columns={[
                    { label: 'Email' },
                    { label: 'Rol' },
                    { label: 'Estado' },
                  ]}
                  rows={usuarios.map((u) => ({
                    cells: [
                      u.email,
                      ROL_LABEL[u.tipoRol],
                      <Badge key="e" color={u.activo ? 'org' : 'danger'}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </Badge>,
                    ],
                  }))}
                  emptyLabel="Sin usuarios."
                />
              )}
            </div>

            {/* Aportes recientes */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-eco-ink">
                Aportes recientes
              </h3>
              {aportes.length === 0 ? (
                <EmptyState label="Todavía no registró aportes." />
              ) : (
                <Table
                  columns={[
                    { label: 'Fecha' },
                    { label: 'Material' },
                    { label: 'Kg', align: 'right' },
                    { label: 'Tokens', align: 'right' },
                  ]}
                  rows={[...aportes]
                    .sort((a, b) => b.fecha.localeCompare(a.fecha))
                    .slice(0, 10)
                    .map((a) => ({
                      cells: [
                        fechaAR(a.fecha),
                        nombreMaterial(a.material),
                        fmtKg(a.kg),
                        fmtNum(a.puntos),
                      ],
                    }))}
                  emptyLabel="Sin aportes."
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Modales anidados */}
      <EditarEmpresaModal
        empresa={editando ? empresa : null}
        onClose={() => setEditando(false)}
        onSave={async (dto) => {
          if (!empresa) return;
          await editarEmpresa(empresa.id, dto);
          setEditando(false);
          await cargar(empresa.id);
          onChanged();
        }}
      />

      <RevisarVerificacionModal
        empresa={revisando ? empresa : null}
        onClose={() => setRevisando(false)}
        onResolved={() => {
          setRevisando(false);
          if (empresa) cargar(empresa.id);
          onChanged();
        }}
      />

      <ConfirmModal
        open={accion !== null}
        title={
          accion === 'aprobar'
            ? 'Aprobar alta'
            : accion === 'rechazar'
              ? 'Rechazar alta'
              : 'Dar de baja'
        }
        description={
          empresa && (
            <>
              ¿Confirmás la operación sobre{' '}
              <strong>{empresa.razonSocial}</strong>?
              {accion === 'aprobar' &&
                ' Se habilitará y se crearán sus credenciales de acceso.'}
              {accion === 'baja' &&
                ' Se conservará su historial, pero no podrá operar.'}
            </>
          )
        }
        confirmLabel={enviando ? 'Procesando…' : 'Confirmar'}
        confirmDisabled={enviando}
        danger={accion !== 'aprobar'}
        onConfirm={confirmar}
        onClose={() => !enviando && setAccion(null)}
      />
    </dialog>
  );
}
