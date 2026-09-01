import { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Field } from '@/components/ui/Field';
import { LoadingState } from '@/components/ui/States';
import type { Empresa } from '@/types';
import { EditarEmpresaModal } from '../components/EditarEmpresaModal';
import {
  aprobarEmpresa,
  darDeBajaEmpresa,
  editarEmpresa,
  filtrarEmpresas,
  listarEmpresas,
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

  const empresasVisibles = filtrarEmpresas(empresas ?? [], busqueda);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-semibold text-eco-ink">Empresas</h2>
        <p className="mt-1 text-xs text-eco-ink2">
          Las altas se originan en el registro público y se habilitan al
          aprobarlas.
        </p>
      </div>
      {error && <p className="text-xs text-eco-danger">{error}</p>}

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
          { label: 'Actividad' },
          { label: 'Acciones', align: 'right' },
        ]}
        rows={empresasVisibles.map((empresa) => ({
          cells: [
            <div key="empresa">
              <div>{empresa.razonSocial}</div>
              <div className="text-xs text-eco-ink2">
                {empresa.emailContacto}
              </div>
            </div>,
            empresa.cuit,
            empresa.estado,
            empresa.activa ? 'Activa' : 'Baja',
            <div key="acciones" className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                color="ink"
                className="px-2.5 py-1 text-xs"
                onClick={() => setEditando(empresa)}
              >
                Editar
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
                  className="px-2.5 py-1 text-xs"
                  onClick={() => setPendiente({ empresa, accion: 'baja' })}
                >
                  Dar de baja
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
