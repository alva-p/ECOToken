import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { cx } from '@/lib/cx';
import { useAuth } from '@/providers/AuthContext';
import type { UserRole } from '@/types';

const ROLE_TABS: { key: UserRole; label: string }[] = [
  { key: 'EMPRESA', label: 'Empresa' },
  { key: 'COOPERATIVA', label: 'Cooperativa' },
  { key: 'MUNICIPALIDAD', label: 'Municipalidad' },
];

const ROLE_HOME: Record<UserRole, string> = {
  EMPRESA: '/empresa',
  COOPERATIVA: '/cooperativa',
  MUNICIPALIDAD: '/municipio',
  ADMIN: '/admin',
};

export function LoginPage() {
  // El selector de rol es solo una guía visual (a qué portal accede); el rol real
  // que decide la redirección lo determina el backend a partir de las credenciales.
  const [selectedRole, setSelectedRole] = useState<UserRole>('EMPRESA');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const usuario = await login(email, password);
      navigate(ROLE_HOME[usuario.rol], { replace: true });
    } catch {
      setError('Email o contraseña incorrectos.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-eco-bg px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-eco-ink">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-eco-ink2">
            Accedé con la cuenta de tu organización
          </p>
        </div>

        <Card className="p-7">
          <div className="mb-5 flex gap-1 rounded-lg border border-eco-border bg-eco-bg p-1">
            {ROLE_TABS.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setSelectedRole(r.key)}
                className={cx(
                  'flex-1 rounded-md px-2 py-2 text-xs font-semibold transition-colors',
                  selectedRole === r.key
                    ? 'bg-white text-eco-ink shadow-sm'
                    : 'text-eco-ink2',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            <Field
              label="Email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Field
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error ?? undefined}
            />
            <Button type="submit" color="org" disabled={submitting}>
              {submitting ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
        </Card>

        <div className="mt-5 text-center text-sm text-eco-ink2">
          ¿Tu empresa todavía no participa?{' '}
          <Link to="/registro" className="font-semibold text-eco-org">
            Registrala acá
          </Link>
        </div>
      </div>
    </div>
  );
}
