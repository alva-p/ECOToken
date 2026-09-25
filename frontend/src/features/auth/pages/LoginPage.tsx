import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { mailtoAltaCooperativa } from '@/lib/contacto';
import { useAuth } from '@/providers/AuthContext';
import type { UserRole } from '@/types';

const ROLE_HOME: Record<UserRole, string> = {
  EMPRESA: '/empresa',
  COOPERATIVA: '/cooperativa',
  MUNICIPALIDAD: '/municipio',
  ADMIN: '/admin',
};

// E3-HU06: se quitó el selector de rol del login. La cuenta ingresa con el rol
// que ya tiene asignado; el backend lo determina a partir de las credenciales y
// acá solo se usa para redirigir al portal correcto (ROLE_HOME).
export function LoginPage() {
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

        {/* E3-HU06: las cooperativas no se registran solas; solicitan el alta
            por mail y el administrador las da de alta (E4-HU01). */}
        <div className="mt-3 text-center text-xs text-eco-ink2">
          ¿Sos una cooperativa de reciclaje?{' '}
          <a
            href={mailtoAltaCooperativa()}
            className="font-semibold text-eco-org"
          >
            Solicitá el alta por mail
          </a>
        </div>
      </div>
    </div>
  );
}
