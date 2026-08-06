import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  RankingPreview,
  type RankingPodiumItem,
  type RankingSummaryItem,
} from '@/features/ranking/components/RankingPreview';

// Datos de ejemplo (E11-HU04): E7-HU03 reemplaza esto por datos reales del backend
// sin tocar RankingPreview, que ya recibe todo por props.
const EXAMPLE_SUMMARY: RankingSummaryItem[] = [
  { label: 'Organizaciones', value: '47', sub: 'participantes activas' },
  {
    label: 'Total reciclado',
    value: '8.412 kg',
    sub: '+12% vs el mes anterior',
  },
  { label: 'Certificados emitidos', value: '47', sub: 'verificados on-chain' },
];

const EXAMPLE_PODIUM: RankingPodiumItem[] = [
  {
    rank: 1,
    name: 'Hospital Pasteur',
    categoria: 'Salud pública',
    kg: 489,
    eco: 1250,
  },
  {
    rank: 2,
    name: 'Supermercado Top',
    categoria: 'Comercio',
    kg: 412,
    eco: 1050,
  },
  {
    rank: 3,
    name: 'Coop. Puente Verde',
    categoria: 'Cooperativa',
    kg: 376,
    eco: 980,
  },
];

const STEPS = [
  {
    t: 'Entregás el material',
    d: 'La empresa lleva sus residuos reciclables a la cooperativa adherida.',
  },
  {
    t: 'Se valida y pesa',
    d: 'La cooperativa registra el ingreso: tipo de material y peso exacto.',
  },
  {
    t: 'Se acuñan tokens ECO',
    d: 'El sistema convierte el peso en tokens ECO de forma automática y trazable.',
  },
  {
    t: 'Subís en el ranking',
    d: 'Acumulás reconocimiento público y un certificado digital verificable cada mes.',
  },
];

// Landing pública (E11-HU04): puerta de entrada del proyecto antes de tener todos
// los paneles terminados. Diseño de referencia: doc/assets/ECOToken/screens/
// ranking-landing.jsx (Nav/Hero) — reutiliza la paleta eco.org ya definida en vez
// de sumar la paleta institucional separada del mockup.
function App() {
  return (
    <div className="bg-eco-bg">
      <header className="border-b border-eco-border bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight text-eco-ink">
            EcoToken
          </span>
          <nav className="flex items-center gap-6">
            <a
              href="#como-funciona"
              className="hidden text-sm font-medium text-eco-ink2 hover:text-eco-ink sm:block"
            >
              Cómo funciona
            </a>
            <a
              href="#ranking-preview"
              className="hidden text-sm font-medium text-eco-ink2 hover:text-eco-ink sm:block"
            >
              Ranking
            </a>
            <Link to="/login">
              <Button color="org">Iniciar sesión</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-24">
        <div className="inline-flex items-center gap-2 rounded-full bg-eco-org-soft px-3 py-1 text-xs font-semibold text-eco-org">
          Villa María, Córdoba
        </div>
        <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-bold tracking-tight text-eco-ink sm:text-5xl">
          Reconocimiento público para las empresas que reciclan
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-eco-ink2">
          EcoToken registra el material que entregan las empresas adheridas, lo
          valida junto a las cooperativas de reciclaje y reconoce el esfuerzo
          ambiental con un ranking mensual y un certificado digital verificable
          — respaldado por la Municipalidad.
        </p>
      </section>

      <section
        id="como-funciona"
        className="border-y border-eco-border bg-white px-6 py-16"
      >
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-wide text-eco-org">
              Cómo funciona
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-eco-ink sm:text-3xl">
              De la entrega al reconocimiento, en cuatro pasos
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.t}>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-eco-org-soft text-sm font-bold text-eco-org">
                  {i + 1}
                </div>
                <div className="mt-3 text-sm font-semibold text-eco-ink">
                  {s.t}
                </div>
                <p className="mt-1.5 text-sm text-eco-ink2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ranking-preview" className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <RankingPreview
            periodo="Abril 2026 · Villa María"
            summary={EXAMPLE_SUMMARY}
            podium={EXAMPLE_PODIUM}
          />
        </div>
      </section>

      <section className="border-t border-eco-border bg-eco-ink px-6 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          ¿Tu empresa ya recicla? Sumala al ranking.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/60">
          Accedé con la cuenta de tu organización para ver tu saldo, tus
          certificados y tu posición.
        </p>
        <div className="mt-6">
          <Link to="/login">
            <Button color="org">Iniciar sesión</Button>
          </Link>
        </div>
      </section>

      <footer className="bg-white px-6 py-6 text-center text-xs text-eco-ink2">
        © 2026 EcoToken · Municipalidad de Villa María
      </footer>
    </div>
  );
}

export default App;
