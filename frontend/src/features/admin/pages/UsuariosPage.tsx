import { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LoadingState } from '@/components/ui/States';
import { cx } from '@/lib/cx';
import type {
  EstadoVerificacion,
  Empresa,
  Municipalidad,
  TipoRol,
} from '@/types';
import { UsuarioModal } from '../components/UsuarioModal';
import { MunicipalidadModal } from '../components/MunicipalidadModal';
import { RevisarVerificacionModal } from '../components/RevisarVerificacionModal';
import {
  editarUsuario,
  eliminarMunicipalidad,
  listarEmpresas,
  listarMunicipalidades,
  listarUsuarios,
  type AltaUsuarioResponse,
  type UsuarioAdmin,
} from '../api';

const ROL_LABEL: Record<TipoRol, string> = {
  EMPRESA: 'Empresa',
  COOPERATIVA: 'Cooperativa',
  MUNICIPALIDAD: 'Municipalidad',
  ADMIN: 'Administrador',
};

const ROL_COLOR: Record<TipoRol, 'org' | 'coop' | 'muni' | 'ink'> = {
  EMPRESA: 'org',
  COOPERATIVA: 'coop',
  MUNICIPALIDAD: 'muni',
  ADMIN: 'ink',
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

type Tab = 'usuarios' | 'municipalidades';

// Gestión de usuarios del panel admin: alta administrativa (contraseña temporal),
// edición de rol/asociación y activación/desactivación. Tab secundario para el
// ABM de municipalidades.
export function UsuariosPage() {
  const [tab, setTab] = useState<Tab>('usuarios');
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[] | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [municipalidades, setMunicipalidades] = useState<Municipalidad[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Modales de usuario.
  const [modalUsuario, setModalUsuario] = useState<{
    open: boolean;
    usuario: UsuarioAdmin | null;
  }>({ open: false, usuario: null });
  const [credenciales, setCredenciales] = useState<AltaUsuarioResponse | null>(
    null,
  );
  const [cambioEstado, setCambioEstado] = useState<UsuarioAdmin | null>(null);
  const [revisando, setRevisando] = useState<Empresa | null>(null);
  const [procesando, setProcesando] = useState(false);

  // Modales de municipalidad.
  const [modalMuni, setModalMuni] = useState<{
    open: boolean;
    municipalidad: Municipalidad | null;
  }>({ open: false, municipalidad: null });
  const [borrandoMuni, setBorrandoMuni] = useState<Municipalidad | null>(null);

  async function cargar() {
    setError(null);
    try {
      const [u, e, c, m] = await Promise.all([
        listarUsuarios(),
        listarEmpresas('EMPRESA'),
        listarEmpresas('COOPERATIVA'),
        listarMunicipalidades(),
      ]);
      setUsuarios(u);
      setEmpresas([...e, ...c]);
      setMunicipalidades(m);
    } catch {
      setError('No se pudieron cargar los datos de gestión.');
      setUsuarios([]);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const empresaPorId = useMemo(
    () => new Map(empresas.map((e) => [e.id, e])),
    [empresas],
  );
  const muniPorId = useMemo(
    () => new Map(municipalidades.map((m) => [m.id, m])),
    [municipalidades],
  );

  function organizacion(u: UsuarioAdmin): string {
    if (u.empresaId) return empresaPorId.get(u.empresaId)?.razonSocial ?? '—';
    if (u.municipalidadId)
      return muniPorId.get(u.municipalidadId)?.nombre ?? '—';
    return '—';
  }

  async function confirmarCambioEstado() {
    if (!cambioEstado) return;
    setProcesando(true);
    try {
      await editarUsuario(cambioEstado.id, { activo: !cambioEstado.activo });
      setCambioEstado(null);
      await cargar();
    } catch {
      setError('No se pudo cambiar el estado del usuario.');
    } finally {
      setProcesando(false);
    }
  }

  async function confirmarBorrarMuni() {
    if (!borrandoMuni) return;
    setProcesando(true);
    try {
      await eliminarMunicipalidad(borrandoMuni.id);
      setBorrandoMuni(null);
      await cargar();
    } catch {
      setError(
        'No se pudo eliminar la municipalidad (¿tiene usuarios asociados?).',
      );
    } finally {
      setProcesando(false);
    }
  }

  if (usuarios === null && !error)
    return <LoadingState label="Cargando usuarios…" />;

  return (
    <div className="flex flex-col gap-5">
      {/* Pestañas */}
      <div className="flex gap-1 border-b border-eco-border">
        {(
          [
            ['usuarios', 'Usuarios'],
            ['municipalidades', 'Municipalidades'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cx(
              '-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors',
              tab === key
                ? 'border-eco-muni text-eco-muni'
                : 'border-transparent text-eco-ink2 hover:text-eco-ink',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-eco-danger">{error}</p>}

      {credenciales && tab === 'usuarios' && (
        <Card className="max-w-lg border-eco-org p-6">
          <h2 className="mb-2 text-sm font-semibold text-eco-ink">
            Credenciales temporales
          </h2>
          <p className="text-sm text-eco-ink">
            Entregá estas credenciales al titular. La contraseña se muestra una
            sola vez y deberá cambiarla en su próximo ingreso.
          </p>
          <p className="mt-3 text-sm text-eco-ink">
            {credenciales.usuario.email} /{' '}
            <span className="font-mono">{credenciales.passwordTemporal}</span>
          </p>
          <Button
            variant="ghost"
            color="ink"
            className="mt-3 px-2.5 py-1 text-xs"
            onClick={() => setCredenciales(null)}
          >
            Entendido
          </Button>
        </Card>
      )}

      {tab === 'usuarios' ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-eco-ink2">
              {usuarios?.length ?? 0} usuario(s) en el sistema.
            </p>
            <Button
              color="muni"
              onClick={() => {
                setCredenciales(null);
                setModalUsuario({ open: true, usuario: null });
              }}
            >
              Crear usuario
            </Button>
          </div>

          <Table
            columns={[
              { label: 'Usuario' },
              { label: 'Rol' },
              { label: 'Organización' },
              { label: 'Verificación' },
              { label: 'Estado' },
              { label: 'Acciones', align: 'right' },
            ]}
            rows={(usuarios ?? []).map((u) => {
              const empresa =
                (u.tipoRol === 'EMPRESA' || u.tipoRol === 'COOPERATIVA') &&
                u.empresaId
                  ? empresaPorId.get(u.empresaId)
                  : undefined;
              return {
                cells: [
                  <span key="email" className="text-eco-ink">
                    {u.email}
                  </span>,
                  <Badge key="rol" color={ROL_COLOR[u.tipoRol]}>
                    {ROL_LABEL[u.tipoRol]}
                  </Badge>,
                  organizacion(u),
                  empresa ? (
                    <button
                      key="verif"
                      type="button"
                      title="Revisar verificación"
                      onClick={() => setRevisando(empresa)}
                      className="group inline-flex items-center gap-1 rounded-md py-0.5 pr-1 transition-colors hover:bg-eco-bg"
                    >
                      <Badge color={VERIF_COLOR[empresa.estadoVerificacion]}>
                        {VERIF_LABEL[empresa.estadoVerificacion]}
                      </Badge>
                      <ChevronRight
                        size={14}
                        aria-hidden
                        className="text-eco-ink3 transition-colors group-hover:text-eco-ink2"
                      />
                    </button>
                  ) : (
                    <span key="verif" className="text-eco-ink3">
                      —
                    </span>
                  ),
                  <Badge key="estado" color={u.activo ? 'org' : 'danger'}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </Badge>,
                  <div key="acciones" className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      color="ink"
                      className="px-2.5 py-1 text-xs"
                      onClick={() =>
                        setModalUsuario({ open: true, usuario: u })
                      }
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      color={u.activo ? 'danger' : 'org'}
                      className="px-2.5 py-1 text-xs"
                      onClick={() => setCambioEstado(u)}
                    >
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>,
                ],
              };
            })}
            emptyLabel="No hay usuarios cargados."
          />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-eco-ink2">
              {municipalidades.length} municipalidad(es) registrada(s).
            </p>
            <Button
              color="muni"
              onClick={() => setModalMuni({ open: true, municipalidad: null })}
            >
              Crear municipalidad
            </Button>
          </div>

          <Table
            columns={[
              { label: 'Nombre' },
              { label: 'Ciudad' },
              { label: 'Acciones', align: 'right' },
            ]}
            rows={municipalidades.map((m) => ({
              cells: [
                <span key="nombre" className="text-eco-ink">
                  {m.nombre}
                </span>,
                m.ciudad,
                <div key="acciones" className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    color="ink"
                    className="px-2.5 py-1 text-xs"
                    onClick={() =>
                      setModalMuni({ open: true, municipalidad: m })
                    }
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    color="danger"
                    className="px-2.5 py-1 text-xs"
                    onClick={() => setBorrandoMuni(m)}
                  >
                    Eliminar
                  </Button>
                </div>,
              ],
            }))}
            emptyLabel="No hay municipalidades registradas."
          />
        </>
      )}

      <UsuarioModal
        open={modalUsuario.open}
        usuario={modalUsuario.usuario}
        empresas={empresas}
        municipalidades={municipalidades}
        onClose={() => setModalUsuario({ open: false, usuario: null })}
        onCreated={(res) => {
          setModalUsuario({ open: false, usuario: null });
          setCredenciales(res);
          cargar();
        }}
        onSaved={() => {
          setModalUsuario({ open: false, usuario: null });
          cargar();
        }}
        onReset={(res) => {
          setModalUsuario({ open: false, usuario: null });
          setCredenciales(res);
          cargar();
        }}
      />

      <RevisarVerificacionModal
        empresa={revisando}
        onClose={() => setRevisando(null)}
        onResolved={() => {
          setRevisando(null);
          cargar();
        }}
      />

      <MunicipalidadModal
        open={modalMuni.open}
        municipalidad={modalMuni.municipalidad}
        onClose={() => setModalMuni({ open: false, municipalidad: null })}
        onSaved={() => {
          setModalMuni({ open: false, municipalidad: null });
          cargar();
        }}
      />

      <ConfirmModal
        open={cambioEstado !== null}
        title={cambioEstado?.activo ? 'Desactivar usuario' : 'Activar usuario'}
        description={
          cambioEstado && (
            <>
              Vas a{' '}
              <strong>{cambioEstado.activo ? 'desactivar' : 'activar'}</strong>{' '}
              a <strong>{cambioEstado.email}</strong>.
              {cambioEstado.activo
                ? ' No podrá iniciar sesión hasta reactivarlo.'
                : ' Volverá a tener acceso al sistema.'}
            </>
          )
        }
        confirmLabel={
          procesando
            ? 'Procesando…'
            : cambioEstado?.activo
              ? 'Desactivar'
              : 'Activar'
        }
        confirmDisabled={procesando}
        danger={cambioEstado?.activo}
        onConfirm={confirmarCambioEstado}
        onClose={() => !procesando && setCambioEstado(null)}
      />

      <ConfirmModal
        open={borrandoMuni !== null}
        title="Eliminar municipalidad"
        description={
          borrandoMuni && (
            <>
              Se eliminará <strong>{borrandoMuni.nombre}</strong> (
              {borrandoMuni.ciudad}). Esta acción no se puede deshacer.
            </>
          )
        }
        confirmLabel={procesando ? 'Eliminando…' : 'Eliminar'}
        confirmDisabled={procesando}
        danger
        onConfirm={confirmarBorrarMuni}
        onClose={() => !procesando && setBorrandoMuni(null)}
      />
    </div>
  );
}
