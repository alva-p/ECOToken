import { Link } from 'react-router-dom';

// Sección pública sin login (E11-HU03). El formulario de hash/QR y el resultado
// de validación los construye E8-HU03.
export function VerificarPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-eco-bg px-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-eco-ink">
        Verificar certificado
      </h1>
      <p className="max-w-md text-eco-ink2">
        La verificación pública de certificados se publica próximamente.
      </p>
      <Link to="/" className="text-sm font-semibold text-eco-org">
        Volver al inicio
      </Link>
    </div>
  );
}
