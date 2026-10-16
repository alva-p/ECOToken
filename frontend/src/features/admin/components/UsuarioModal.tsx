import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { cx } from '@/lib/cx';
import type { Empresa, Municipalidad, TipoRol } from '@/types';
import {
  altaUsuario,
  editarUsuario,
  restablecerPassword,
  type AltaUsuarioResponse,
  type UsuarioAdmin,
} from '../api';

const ROLES: TipoRol[] = ['EMPRESA', 'COOPERATIVA', 'MUNICIPALIDAD', 'ADMIN'];

const ROL_LABEL: Record<TipoRol, string> = {
  EMPRESA: 'Empresa',
  COOPERATIVA: 'Cooperativa',
  MUNICIPALIDAD: 'Municipalidad',
  ADMIN: 'Administrador',
};

interface Props {
  open: boolean;
  usuario: UsuarioAdmin | null; // null → alta; con valor → edición
  empresas: Empresa[];
  municipalidades: Municipalidad[];
  onClose: () => void;
  onCreated: (res: AltaUsuarioResponse) => void;
  onSaved: () => void;
  onReset: (res: AltaUsuarioResponse) => void;
}

/** Select nativo con el mismo estilo que `Field`. */
function Select({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-eco-ink">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-eco-border-strong bg-eco-surface px-3.5 py-2.5 text-sm text-eco-ink focus:outline-none focus:ring-2 focus:ring-eco-org/30 focus:ring-offset-1 disabled:opacity-60"
      >
        {children}
      </select>
    </label>
  );
}

/**
 * Alta / edición de un usuario del sistema. En alta el backend genera la
 * contraseña temporal (no se pide acá). Según el rol se asocia a una empresa /
 * cooperativa o a una municipalidad; el rol ADMIN no lleva asociación.
 */
export function UsuarioModal({
  open,
  usuario,
  empresas,
  municipalidades,
  onClose,
  onCreated,
  onSaved,
  onReset,
}: Props) {
  const esEdicion = usuario !== null;
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<TipoRol>('EMPRESA');
  const [asociacionId, setAsociacionId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [reseteando, setReseteando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setEmail(usuario?.email ?? '');
    setRol(usuario?.tipoRol ?? 'EMPRESA');
    setAsociacionId(usuario?.empresaId ?? usuario?.municipalidadId ?? '');
  }, [open, usuario]);

  // Empresas elegibles según el rol (la categoría acompaña al rol).
  const empresasDelRol = useMemo(
    () =>
      empresas.filter((e) =>
        rol === 'COOPERATIVA'
          ? e.categoria === 'COOPERATIVA'
          : e.categoria === 'EMPRESA',
      ),
    [empresas, rol],
  );

  const requiereEmpresa = rol === 'EMPRESA' || rol === 'COOPERATIVA';
  const requiereMunicipalidad = rol === 'MUNICIPALIDAD';

  async function guardar() {
    setError(null);
    if (!esEdicion && !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Ingresá un email válido.');
      return;
    }
    if ((requiereEmpresa || requiereMunicipalidad) && !asociacionId) {
      setError(
        requiereEmpresa
          ? 'Elegí la organización a la que pertenece el usuario.'
          : 'Elegí la municipalidad a la que pertenece el usuario.',
      );
      return;
    }

    const empresaId = requiereEmpresa ? asociacionId : undefined;
    const municipalidadId = requiereMunicipalidad ? asociacionId : undefined;

    setGuardando(true);
    try {
      if (esEdicion) {
        await editarUsuario(usuario.id, {
          tipoRol: rol,
          empresaId,
          municipalidadId,
        });
        onSaved();
      } else {
        const res = await altaUsuario({
          email: email.trim(),
          tipoRol: rol,
          empresaId,
          municipalidadId,
        });
        onCreated(res);
      }
    } catch {
      setError(
        esEdicion
          ? 'No se pudo guardar el usuario.'
          : 'No se pudo crear el usuario. ¿El email ya está en uso?',
      );
    } finally {
      setGuardando(false);
    }
  }

  async function resetear() {
    if (!usuario) return;
    setError(null);
    setReseteando(true);
    try {
      onReset(await restablecerPassword(usuario.id));
    } catch {
      setError('No se pudo restablecer la contraseña.');
    } finally {
      setReseteando(false);
    }
  }

  return (
    <ConfirmModal
      open={open}
      title={esEdicion ? 'Editar usuario' : 'Crear usuario'}
      description={
        <div className="mt-4 flex flex-col gap-3">
          <Field
            label="Email"
            type="email"
            required
            value={email}
            disabled={esEdicion}
            onChange={(event) => setEmail(event.target.value)}
          />
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-eco-ink">
              Rol
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRol(r)}
                  className={cx(
                    'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                    rol === r
                      ? 'border-eco-muni bg-eco-muni-soft text-eco-muni'
                      : 'border-eco-border-strong bg-eco-surface text-eco-ink2 hover:bg-eco-bg',
                  )}
                >
                  {ROL_LABEL[r]}
                </button>
              ))}
            </div>
          </div>

          {requiereEmpresa && (
            <Select
              label={rol === 'COOPERATIVA' ? 'Cooperativa' : 'Empresa'}
              value={asociacionId}
              onChange={setAsociacionId}
            >
              <option value="">Seleccionar…</option>
              {empresasDelRol.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.razonSocial}
                </option>
              ))}
            </Select>
          )}

          {requiereMunicipalidad && (
            <Select
              label="Municipalidad"
              value={asociacionId}
              onChange={setAsociacionId}
            >
              <option value="">Seleccionar…</option>
              {municipalidades.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.ciudad})
                </option>
              ))}
            </Select>
          )}

          {!esEdicion && (
            <p className="text-xs text-eco-ink2">
              Se generará una contraseña temporal que el usuario deberá cambiar
              en su primer ingreso.
            </p>
          )}

          {esEdicion && (
            <div className="rounded-lg border border-eco-border bg-eco-bg p-3">
              <p className="text-xs text-eco-ink2">
                ¿No puede ingresar? Generá una nueva contraseña temporal; deberá
                cambiarla en su próximo acceso.
              </p>
              <Button
                variant="outline"
                color="muni"
                className="mt-2 px-2.5 py-1 text-xs"
                disabled={reseteando}
                onClick={resetear}
              >
                {reseteando ? 'Generando…' : 'Restablecer contraseña'}
              </Button>
            </div>
          )}

          {error && <p className="text-xs text-eco-danger">{error}</p>}
        </div>
      }
      confirmLabel={
        guardando
          ? 'Guardando…'
          : esEdicion
            ? 'Guardar cambios'
            : 'Crear usuario'
      }
      confirmDisabled={guardando}
      onConfirm={guardar}
      onClose={() => !guardando && onClose()}
    />
  );
}
