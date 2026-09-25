import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mailtoAltaCooperativa } from '@/lib/contacto';
import GradientWaves from '@/components/GradientWaves';
import { Navbar } from '@/components/Navbar';
import { ImpactoChart } from '@/components/ImpactoChart';
import { useRankingActual } from '@/features/ranking/hooks/useRankingActual';
import {
  cantidadEmpresas,
  etiquetaPeriodo,
  variacionVsMesAnterior,
} from '@/features/ranking/periodo';
import {
  ArrowUpRight,
  ChevronRight,
  CircleDot,
  Leaf,
  Link2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Waves,
} from 'lucide-react';

const steps = [
  [
    '01',
    'Entregás el material',
    'La empresa lleva sus residuos reciclables a una cooperativa adherida.',
  ],
  [
    '02',
    'Se valida y pesa',
    'La cooperativa registra el ingreso, tipo de material y peso exacto.',
  ],
  [
    '03',
    'Se acuñan tokens ECO',
    'El sistema convierte el peso en reconocimiento digital de forma trazable.',
  ],
  [
    '04',
    'Subís en el ranking',
    'Acumulás reconocimiento público y un certificado verificable cada mes.',
  ],
];

// Logos para la franja animada continua
const partnerLogos = [
  {
    name: 'Municipalidad de Villa María',
    src: '/logos/logo-villa-maria.png',
    label: 'Respaldo Institucional',
  },
  {
    name: 'Coop. de Trabajo 7 de Febrero',
    src: '/logos/logo-cooperativa.jpg',
    isRound: true,
    label: 'Cooperativa Validadora',
  },
  {
    name: 'GreenPack',
    src: '/logos/logo-greenpack.png',
    isRound: true,
    label: 'Empresa Adherida',
  },
  {
    name: 'ECOToken',
    src: '/logos/logo-ecotoken.png',
    label: 'Plataforma Web3',
  },
];

// Duplicamos el array para lograr un scroll infinito continuo de 360 grados sin cortes
const tickerItems = [...partnerLogos, ...partnerLogos, ...partnerLogos];

type LandingTheme = 'light' | 'dark';
const THEME_KEY = 'ecotoken-landing-theme';

function App() {
  const [theme, setTheme] = useState<LandingTheme>(() =>
    localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark',
  );
  const isDark = theme === 'dark';

  // Ranking real del último mes cerrado (E7-HU03); sin datos, la landing
  // muestra guiones y estados vacíos en lugar de cifras de ejemplo.
  const { cargando, periodos, ranking } = useRankingActual();
  const variacion = ranking ? variacionVsMesAnterior(ranking, periodos) : null;
  const historico = [...periodos].reverse().map((p) => ({
    label: etiquetaPeriodo(p),
    kg: p.totalKg,
  }));
  const kgDelMes = ranking ? ranking.totalKg.toLocaleString('es-AR') : '—';
  const linkRanking = ranking
    ? `/ranking?mes=${ranking.mes}&anio=${ranking.anio}`
    : '/ranking';

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark ? '#07110f' : '#f3f7f1');
  }, [isDark, theme]);

  return (
    <main className={`site-shell ${theme}`}>
      {/* ═══ NAVBAR FLOTANTE ESTILO MINI-NAVBAR ═══ */}
      <Navbar
        isDark={isDark}
        onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
      />

      {/* ═══ HERO RESPONSIVO CON GRADIENT WAVES ═══ */}
      <section className="hero" id="inicio">
        <GradientWaves
          horizonColor={isDark ? '#07110f' : '#dbeadb'}
          waveColor={isDark ? '#0d2d24' : '#2f7650'}
          crestColor={isDark ? '#baff3c' : '#5f9f43'}
          speed={0.35}
          amplitude={2.8}
          waveScale={0.65}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={1.1}
          zoom={1.0}
          height={5.5}
          fogDepth={16}
          brightness={1.05}
          opacity={isDark ? 0.8 : 0.92}
        />
        <div className="hero-grid" />

        <div className="hero-content container">
          <div className="eyebrow">
            <span className="status-dot" />
            Villa María, Córdoba <span className="eyebrow-line" /> Proyecto
            final UTN
          </div>
          <h1>
            Reciclar deja
            <br />
            <em>huella.</em>
          </h1>
          <p className="hero-copy">
            La plataforma que convierte acciones reales de reciclaje empresarial
            en <strong>reconocimiento ambiental verificable</strong> y
            transparente.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#ranking">
              Ver el ranking <ArrowUpRight size={17} />
            </a>
            <a className="button button-ghost" href="#como-funciona">
              Conocé el proceso <ChevronRight size={17} />
            </a>
          </div>
          <div className="hero-note">
            <Link2 size={14} /> El token ECO representa reputación ambiental, no
            dinero.
          </div>
        </div>

        <div className="hero-metrics container">
          <div>
            <span>{ranking ? ranking.empresas : '—'}</span>
            <small>empresas en el último ranking</small>
          </div>
          <div>
            <span>
              {kgDelMes}
              <span className="metric-unit"> kg</span>
            </span>
            <small>
              reciclados en{' '}
              {ranking ? etiquetaPeriodo(ranking) : 'el último mes'}
            </small>
          </div>
          <div>
            <span>
              100<span className="metric-unit">%</span>
            </span>
            <small>trazabilidad registrada</small>
          </div>
        </div>
        <div className="scroll-cue">
          <span /> desplazate para explorar
        </div>
      </section>

      {/* ═══ CÓMO FUNCIONA ═══ */}
      <section className="section process-section" id="como-funciona">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="kicker">
                <CircleDot size={13} /> El circuito
              </p>
              <h2>
                Del residuo al
                <br />
                <span>reconocimiento.</span>
              </h2>
            </div>
            <p className="section-intro">
              Una forma simple de hacer visible el impacto que ya estás
              generando. Sin intermediarios, sin promesas: datos claros y
              acciones concretas.
            </p>
          </div>
          <div className="steps">
            {steps.map(([n, title, body]) => (
              <article className="step" key={n}>
                <span className="step-number">{n}</span>
                <div className="step-icon">
                  {n === '01' ? (
                    <Waves />
                  ) : n === '02' ? (
                    <ShieldCheck />
                  ) : n === '03' ? (
                    <Sparkles />
                  ) : (
                    <Trophy />
                  )}
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
                <span className="step-arrow">
                  <ArrowUpRight size={17} />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RANKING / IMPACTO ═══ */}
      <section className="section impact-section" id="ranking">
        <div className="container">
          <div className="impact-head">
            <div>
              <p className="kicker">
                <span className="kicker-bar" /> Impacto local /{' '}
                {ranking ? etiquetaPeriodo(ranking) : 'Ranking mensual'}
              </p>
              <h2>
                Así recicla
                <br />
                <span>Villa María.</span>
              </h2>
            </div>
            {variacion !== null && (
              <div className="impact-total">
                <span>
                  {variacion > 0 ? '+' : ''}
                  {variacion}%
                </span>
                <small>vs. mes anterior</small>
              </div>
            )}
          </div>
          <div className="impact-layout">
            <div className="impact-card">
              <div className="card-top">
                <span>Material recuperado</span>
                <span className="live-pill">
                  <i /> mes cerrado
                </span>
              </div>
              <div className="big-number">
                {kgDelMes} <b>kg</b>
              </div>
              <div className="chart">
                {historico.length >= 2 ? (
                  <ImpactoChart data={historico} />
                ) : (
                  <p className="chart-empty">
                    {cargando
                      ? 'Cargando ranking…'
                      : 'El histórico aparece a partir del segundo mes cerrado.'}
                  </p>
                )}
              </div>
              <div className="impact-footer">
                <span>
                  <Leaf size={15} />{' '}
                  {ranking
                    ? `${cantidadEmpresas(ranking.empresas)} en el ranking`
                    : 'Sin ranking cerrado todavía'}
                </span>
                <span>
                  Puntos ECO{' '}
                  <b>
                    {ranking
                      ? ranking.totalTokens.toLocaleString('es-AR')
                      : '—'}
                  </b>
                </span>
              </div>
            </div>
            <div className="leaderboard">
              <div className="leaderboard-title">
                <span>Ranking del mes</span>
                <Link to={linkRanking}>
                  Ver ranking completo <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="leaderboard-list">
                {ranking && ranking.data.length > 0 ? (
                  ranking.data.slice(0, 10).map((fila) => {
                    const rank = String(fila.posicion).padStart(2, '0');
                    return (
                      <div className="leader" key={fila.posicion}>
                        <span className={`rank rank-${rank}`}>{rank}</span>
                        <div className="leader-info">
                          <strong>{fila.razonSocial}</strong>
                        </div>
                        <div className="leader-weight">
                          <strong>
                            {fila.kgReciclados.toLocaleString('es-AR')} kg
                          </strong>
                          <small>reciclado</small>
                        </div>
                        <div className="leader-points">
                          <strong>{fila.tokens.toLocaleString('es-AR')}</strong>
                          <small>puntos ECO</small>
                        </div>
                        <ChevronRight className="leader-chevron" size={17} />
                      </div>
                    );
                  })
                ) : (
                  <p className="leaderboard-empty">
                    {cargando
                      ? 'Cargando ranking…'
                      : 'Todavía no hay un ranking cerrado. El primero se publica al terminar el mes.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONFIANZA / RESPALDO ═══ */}
      <section className="section trust-section" id="respaldo">
        <div className="container trust-wrap">
          <div>
            <p className="kicker">
              <ShieldCheck size={13} /> Red de confianza
            </p>
            <h2>
              Impacto que se
              <br />
              <span>puede comprobar.</span>
            </h2>
            <p className="trust-copy">
              Cada aporte queda registrado, validado y disponible para construir
              una cultura de reciclaje con evidencia.
            </p>
          </div>
          <div className="trust-orbit">
            <div className="orbit-ring ring-one" />
            <div className="orbit-ring ring-two" />
            <div className="orbit-core">
              <Leaf size={22} />
              <span>
                registro
                <br />
                verificable
              </span>
            </div>
            <span className="orbit-label label-top">Municipalidad</span>
            <span className="orbit-label label-right">Cooperativas</span>
            <span className="orbit-label label-bottom">Empresas</span>
          </div>
        </div>

        {/* ═══ FRANJA CONTINUA TECH DE LOGOS EN MOVIMIENTO ═══ */}
        <div className="partners-ticker-section">
          <div className="partners-ticker-title">
            <span /> Red de alianza e impacto institucional <span />
          </div>
          <div className="partners-ticker-track-wrapper">
            <div className="partners-ticker-track">
              {tickerItems.map((item, index) => (
                <div
                  className="partner-logo-card"
                  key={`${item.name}-${index}`}
                >
                  <img
                    src={item.src}
                    alt={item.name}
                    className={`partner-logo-img ${item.isRound ? 'rounded-full' : ''}`}
                  />
                  <span className="partner-logo-text">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="cta-section" id="acceso">
        <div className="container cta-box">
          <div>
            <p className="kicker">
              <span className="kicker-bar" /> Tu próximo paso
            </p>
            <h2>
              ¿Tu empresa ya
              <br />
              <em>recicla?</em>
            </h2>
            <p>
              Sumala al ranking y hacé visible el impacto que generan juntos.
            </p>
          </div>
          <div className="cta-side">
            <div className="cta-actions">
              <Link className="button button-primary" to="/registro">
                Registrar mi empresa <ArrowUpRight size={17} />
              </Link>
              <Link className="button button-light" to="/login">
                Iniciar sesión <ArrowUpRight size={17} />
              </Link>
            </div>
            {/* E3-HU06: las cooperativas no se registran solas; solicitan el
                alta por mail y el administrador las da de alta (E4-HU01). */}
            <p className="cta-coop">
              ¿Sos una cooperativa de reciclaje?{' '}
              <a href={mailtoAltaCooperativa()}>Solicitá el alta por mail</a>
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="footer">
        <div className="container footer-inner">
          <a href="#inicio" className="flex items-center">
            <img
              src="/logos/logo-ecotoken.png"
              alt="ECOToken"
              className="h-6 w-auto object-contain"
            />
          </a>
          <span>© 2026 EcoToken · Municipalidad de Villa María</span>
          <span>Proyecto final · UTN</span>
        </div>
      </footer>
    </main>
  );
}

export default App;
