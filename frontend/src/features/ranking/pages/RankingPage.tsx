import { Link } from 'react-router-dom';

// Sección pública sin login (E11-HU03). El contenido real (tabla + selector de
// mes conectado a datos) lo construyen E11-HU04 y E7-HU03.
export function RankingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-eco-bg px-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-eco-ink">
        Ranking público
      </h1>
      <p className="max-w-md text-eco-ink2">
        El ranking mensual de empresas reconocidas se publica próximamente.
      </p>
      <Link to="/" className="text-sm font-semibold text-eco-org">
        Volver al inicio
      </Link>
    </div>
  );
}
