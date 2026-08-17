import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

// Placeholder de la raíz pública. La landing real (propuesta de valor, preview del
// ranking) la construye E11-HU04; acá solo se activan los accesos base.
function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-eco-bg px-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-eco-ink">
        EcoToken
      </h1>
      <p className="max-w-md text-eco-ink2">
        Plataforma de incentivos al reciclaje empresarial de Villa María.
      </p>
      <div className="flex gap-3">
        <Link to="/login">
          <Button color="org">Iniciar sesión</Button>
        </Link>
        <Link to="/ranking">
          <Button variant="outline" color="ink">
            Ver ranking
          </Button>
        </Link>
      </div>
    </main>
  );
}

export default App;
