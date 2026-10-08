import { useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthContext';

/** Mismas reglas que el backend (CambiarPasswordDto). */
function errorDePassword(nueva: string, actual: string): string | null {
  if (nueva.length < 10) return 'Tiene que tener al menos 10 caracteres.';
  if (!/[A-Za-z]/.test(nueva)) return 'Tiene que incluir al menos una letra.';
  if (!/\d/.test(nueva)) return 'Tiene que incluir al menos un número.';
  if (nueva === actual) return 'Tiene que ser distinta de la actual.';
  return null;
}

// Se muestra sobre toda la app, sin poder cerrarla, mientras la cuenta siga con
// la contraseña temporal que generó el sistema (aprobación de la empresa o alta
// de la cooperativa). Al cambiarla, el backend baja la marca y no vuelve a salir.
export function CambiarPasswordModal() {
  const { user, logout, cambiarPassword } = useAuth();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetida, setRepetida] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!user?.debeCambiarPassword) return null;

  const errorNueva = nueva ? errorDePassword(nueva, actual) : null;
  const errorRepetida =
    repetida && repetida !== nueva ? 'Las contraseñas no coinciden.' : null;
  const valido =
    actual !== '' && nueva !== '' && !errorNueva && repetida === nueva;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!valido) return;
    setError(null);
    setEnviando(true);
    try {
      await cambiarPassword(actual, nueva);
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes('401')
          ? 'La contraseña temporal es incorrecta.'
          : 'No se pudo cambiar la contraseña. Probá de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cambiar-password-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
    >
      <Card className="w-full max-w-md p-6">
        <h2
          id="cambiar-password-titulo"
          className="text-lg font-bold tracking-tight text-eco-ink"
        >
          Elegí tu contraseña
        </h2>
        <p className="mt-1 text-sm text-eco-ink2">
          Ingresaste con una contraseña temporal. Por seguridad, tenés que
          reemplazarla por una propia antes de continuar.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <Field
            label="Contraseña temporal (la actual)"
            type="password"
            autoComplete="current-password"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
          />
          <Field
            label="Contraseña nueva"
            type="password"
            autoComplete="new-password"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            error={errorNueva ?? undefined}
          />
          <Field
            label="Repetí la contraseña nueva"
            type="password"
            autoComplete="new-password"
            value={repetida}
            onChange={(e) => setRepetida(e.target.value)}
            error={errorRepetida ?? undefined}
          />
          <p className="text-xs text-eco-ink2">
            Mínimo 10 caracteres, con al menos una letra y un número.
          </p>

          {error && (
            <p role="alert" className="text-xs text-eco-danger">
              {error}
            </p>
          )}

          <Button type="submit" color="org" disabled={!valido || enviando}>
            {enviando ? 'Guardando…' : 'Guardar contraseña'}
          </Button>
          <button
            type="button"
            onClick={logout}
            className="text-xs font-semibold text-eco-ink2 hover:text-eco-ink"
          >
            Cerrar sesión
          </button>
        </form>
      </Card>
    </div>
  );
}
