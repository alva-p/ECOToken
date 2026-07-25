// EcoToken — Landing pública: Ranking de Organizaciones
// Página web institucional (no app). Desktop 1440.
// Paleta: verde institucional + azul suave + grises. Estética sustentable, no cripto.

const { useState } = React;

function RankingLanding() {
  const W = 1440;

  // Paleta local (alineada con ECO de shared.jsx)
  const C = {
    green: '#0F6E56',
    greenSoft: '#E6F1EC',
    greenInk: '#0A4D3C',
    blue: '#3D6FB3',
    blueSoft: '#EAF0F8',
    amber: '#BA7517',
    amberSoft: '#FAF1E4',
    bg: '#F6F7F4',
    surface: '#FFFFFF',
    ink: '#101417',
    ink2: '#5E646B',
    ink3: '#A8ACB1',
    border: '#E4E6E3',
    borderStrong: '#D2D5D1',
  };

  // ── Datos ficticios ──
  const summary = [
    { label: 'Organizaciones', value: '47', sub: 'participantes activas' },
    { label: 'Total reciclado', value: '8.412 kg', sub: '+12% vs marzo' },
    { label: 'Puntos ECO generados', value: '24.860', sub: 'distribuidos este mes' },
    { label: 'Certificados emitidos', value: '47', sub: 'verificados on-chain' },
    { label: 'Material más reciclado', value: 'Cartón', sub: '3.124 kg · 37% del total' },
  ];

  const podiumCats = [
    { key: 'A', title: 'Categoría A · Grandes generadores', desc: 'Organizaciones con más de 250 kg reciclados por mes', items: [
      { rank: 1, name: 'Hospital Pasteur', cat: 'A', type: 'Salud pública', kg: 489, eco: 1250, badge: 'Líder ambiental', color: '#C9A227' },
      { rank: 2, name: 'Supermercado Top', cat: 'A', type: 'Comercio', kg: 412, eco: 1050, badge: 'Compromiso sostenido', color: '#9AA3AA' },
      { rank: 3, name: 'Coop. Puente Verde', cat: 'A', type: 'Cooperativa', kg: 376, eco: 980, badge: 'Volumen destacado', color: '#B8742E' },
    ]},
    { key: 'B', title: 'Categoría B · Generadores medianos', desc: 'Organizaciones con entre 100 y 250 kg reciclados por mes', items: [
      { rank: 1, name: 'Escuela Técnica N°34', cat: 'B', type: 'Educativa', kg: 198, eco: 820, badge: 'Impacto educativo', color: '#C9A227' },
      { rank: 2, name: 'Club Atlético V. María', cat: 'B', type: 'Deportiva', kg: 176, eco: 740, badge: 'Comunidad activa', color: '#9AA3AA' },
      { rank: 3, name: 'ONG Reciclar Más', cat: 'B', type: 'ONG', kg: 164, eco: 690, badge: 'Constancia', color: '#B8742E' },
    ]},
    { key: 'C', title: 'Categoría C · Pequeños generadores', desc: 'Comercios y organizaciones con hasta 100 kg por mes', items: [
      { rank: 1, name: 'Panadería El Trigal', cat: 'C', type: 'Comercio', kg: 92, eco: 380, badge: 'Pequeño gigante', color: '#C9A227' },
      { rank: 2, name: 'Verdulería Don Pedro', cat: 'C', type: 'Comercio', kg: 81, eco: 340, badge: 'Barrio activo', color: '#9AA3AA' },
      { rank: 3, name: 'Peluquería Corte Libre', cat: 'C', type: 'Servicios', kg: 54, eco: 220, badge: 'Nuevo destacado', color: '#B8742E' },
    ]},
  ];

  const table = [
    { rank: 1, name: 'Hospital Pasteur', cat: 'A', type: 'Salud pública', kg: 489, eco: 1250, certs: 4, badges: ['Líder', 'Verificado'], trend: 'up', delta: '+1' },
    { rank: 2, name: 'Supermercado Top', cat: 'A', type: 'Comercio', kg: 412, eco: 1050, certs: 4, badges: ['Verificado'], trend: 'flat', delta: '—' },
    { rank: 3, name: 'Escuela Técnica N°34', cat: 'B', type: 'Educativa', kg: 198, eco: 820, certs: 3, badges: ['Educativo'], trend: 'up', delta: '+2' },
    { rank: 4, name: 'Club Atlético Villa María', cat: 'B', type: 'Deportiva', kg: 176, eco: 740, certs: 3, badges: [], trend: 'down', delta: '−1' },
    { rank: 5, name: 'ONG Reciclar Más', cat: 'B', type: 'ONG', kg: 164, eco: 690, certs: 3, badges: ['Verificado'], trend: 'up', delta: '+3' },
    { rank: 6, name: 'Panadería El Trigal', cat: 'C', type: 'Comercio', kg: 92, eco: 380, certs: 2, badges: [], trend: 'flat', delta: '—' },
    { rank: 7, name: 'Verdulería Don Pedro', cat: 'C', type: 'Comercio', kg: 81, eco: 340, certs: 2, badges: [], trend: 'up', delta: '+1' },
    { rank: 8, name: 'Peluquería Corte Libre', cat: 'C', type: 'Servicios', kg: 54, eco: 220, certs: 1, badges: ['Nuevo'], trend: 'up', delta: 'nuevo' },
  ];

  return (
    <div style={{ width: W, fontFamily: `'Inter', system-ui, sans-serif`, color: C.ink, background: C.bg }}>
      {/* ── NAV ───────────────────────────────────── */}
      <Nav C={C} />

      {/* ── HERO + FILTROS ────────────────────────── */}
      <Hero C={C} />

      {/* ── RESUMEN ───────────────────────────────── */}
      <Section C={C}>
        <SectionTitle C={C} eyebrow="Abril 2026 · Villa María" title="Resumen del período" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginTop: 20 }}>
          {summary.map((s, i) => <SummaryCard key={i} C={C} {...s} accent={i === 4 ? C.amber : C.green} />)}
        </div>
      </Section>

      {/* ── TOP 3 PODIUM ──────────────────────────── */}
      <Section C={C} bg={C.surface} bordered>
        <SectionTitle C={C} eyebrow="Reconocimiento mensual" title="Top 3 por categoría" right={<TrustChip C={C} />} />
        <PodiumSlider C={C} groups={podiumCats} />
      </Section>

      {/* ── TABLA RANKING ─────────────────────────── */}
      <Section C={C}>
        <SectionTitle
          C={C}
          eyebrow="Ranking completo"
          title="47 organizaciones participantes"
          right={<TableLegend C={C} />}
        />
        <RankingTable C={C} rows={table} />
      </Section>

      {/* ── GRÁFICOS ──────────────────────────────── */}
      <Section C={C} bg={C.surface} bordered>
        <SectionTitle C={C} eyebrow="Estadísticas visuales" title="Cómo recicló la ciudad este mes" />
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginTop: 24 }}>
          <ChartCard C={C} title="Top 8 — kg reciclados" sub="Organizaciones con mayor volumen">
            <BarChart C={C} data={table.map(r => ({ name: r.name, value: r.kg, cat: r.cat }))} />
          </ChartCard>
          <ChartCard C={C} title="Distribución por material" sub="8.412 kg recolectados en abril">
            <Donut C={C} />
          </ChartCard>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginTop: 20 }}>
          <ChartCard C={C} title="Evolución mensual" sub="kg reciclados — últimos 12 meses">
            <LineChart C={C} />
          </ChartCard>
          <ChartCard C={C} title="Comparativa por categoría" sub="Promedio kg reciclados por organización">
            <CatCompare C={C} />
          </ChartCard>
        </div>
      </Section>

      {/* ── PERFIL ORGANIZACIÓN ───────────────────── */}
      <Section C={C}>
        <SectionTitle C={C} eyebrow="Perfil destacado" title="Hospital Pasteur · Líder del mes" />
        <OrgProfile C={C} />
      </Section>

      {/* ── TRANSPARENCIA + FOOTER ────────────────── */}
      <Transparency C={C} />
      <Footer C={C} />
    </div>
  );
}

// ── NAV ─────────────────────────────────────────
function Nav({ C }) {
  const links = ['Cómo funciona', 'Organizaciones', 'Ranking', 'Beneficios', 'Transparencia', 'Contacto'];
  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '18px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="assets/logo-ecotoken.png" alt="EcoToken" style={{ height: 36, width: 'auto', display: 'block' }} />
          <div style={{ height: 28, width: 1, background: C.border }} />
          <img src="assets/logo-villa-maria.png" alt="Villa María" style={{ height: 30, display: 'block' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {links.map((l, i) => (
            <a key={i} style={{ fontSize: 13, fontWeight: i === 2 ? 600 : 500, color: i === 2 ? C.green : C.ink, letterSpacing: -0.1, textDecoration: 'none', cursor: 'pointer' }}>{l}</a>
          ))}
          <button style={{ background: C.green, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 6, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: -0.1 }}>
            Acceder
          </button>
        </div>
      </div>
    </div>
  );
}

// ── HERO ───────────────────────────────────────
function Hero({ C }) {
  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
      {/* Detalle decorativo */}
      <div style={{ position: 'absolute', right: -120, top: -120, width: 520, height: 520, borderRadius: '50%', background: C.greenSoft, opacity: 0.6 }} />
      <div style={{ position: 'absolute', right: 80, bottom: -160, width: 320, height: 320, borderRadius: '50%', background: C.blueSoft, opacity: 0.7 }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 48px 48px', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: C.greenSoft, color: C.greenInk, borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: 0.2 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: C.green }} />
          Datos verificados · Actualizado 30 abr 2026
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.05, margin: '20px 0 0', maxWidth: 820, color: C.ink }}>
          Ranking público de<br />organizaciones que reciclan
        </h1>
        <p style={{ fontSize: 18, color: C.ink2, lineHeight: 1.5, margin: '20px 0 0', maxWidth: 720, textWrap: 'pretty' }}>
          Conocé qué organizaciones están reciclando y generando impacto ambiental positivo en Villa María. Datos certificados por la Municipalidad y la Cooperativa 7 de Febrero.
        </p>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', marginTop: 36, flexWrap: 'wrap' }}>
          <FilterGroup C={C} label="Período" options={['Mensual', 'Trimestral', 'Anual']} active={0} segmented />
          <FilterGroup C={C} label="Categoría" options={['Todas', 'A · Grandes', 'B · Medianos', 'C · Pequeños']} active={0} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <SearchBox C={C} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ C, label, options, active, segmented }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'inline-flex', background: segmented ? C.bg : 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, padding: segmented ? 3 : 0, gap: segmented ? 0 : 6 }}>
        {options.map((o, i) => {
          const on = i === active;
          return (
            <div key={i} style={{
              padding: '8px 14px', fontSize: 13, fontWeight: on ? 600 : 500,
              color: on ? (segmented ? C.ink : '#fff') : C.ink2,
              background: on ? (segmented ? C.surface : C.green) : (segmented ? 'transparent' : C.surface),
              border: segmented ? 'none' : `1px solid ${on ? C.green : C.border}`,
              borderRadius: segmented ? 6 : 999,
              cursor: 'pointer',
              boxShadow: on && segmented ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
              letterSpacing: -0.1,
            }}>{o}</div>
          );
        })}
      </div>
    </div>
  );
}

function SearchBox({ C }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 280 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink2} strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
      <div style={{ fontSize: 13, color: C.ink3 }}>Buscar organización…</div>
    </div>
  );
}

// ── SECTION SCAFFOLDS ─────────────────────────
function Section({ children, C, bg, bordered }) {
  return (
    <div style={{ background: bg || 'transparent', borderTop: bordered ? `1px solid ${C.border}` : 'none', borderBottom: bordered ? `1px solid ${C.border}` : 'none' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 48px' }}>{children}</div>
    </div>
  );
}

function SectionTitle({ C, eyebrow, title, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.green, textTransform: 'uppercase', letterSpacing: 1 }}>{eyebrow}</div>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.8, marginTop: 6, color: C.ink, lineHeight: 1.15 }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

function TrustChip({ C }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: C.greenSoft, color: C.greenInk, borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 3 4 1 1 4 3 3-3 3-1 4-4 1-3 3-3-3-4-1-1-4-3-3 3-3 1-4 4-1z" /><path d="M9 12l2 2 4-4" /></svg>
      Verificado on-chain
    </div>
  );
}

function TableLegend({ C }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: C.ink2 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CatBadge C={C} cat="A" /> Grandes</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CatBadge C={C} cat="B" /> Medianos</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CatBadge C={C} cat="C" /> Pequeños</span>
    </div>
  );
}

function CatBadge({ C, cat }) {
  const map = { A: C.green, B: C.blue, C: C.amber };
  return (
    <span style={{ width: 22, height: 22, borderRadius: 5, background: map[cat] + '1A', color: map[cat], fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{cat}</span>
  );
}

// ── SUMMARY ───────────────────────────────────
function SummaryCard({ C, label, value, sub, accent }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '22px 22px 20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent }} />
      <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: 'uppercase', letterSpacing: 0.7 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.8, marginTop: 10, color: C.ink, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.ink2, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

// ── PODIUM SLIDER ──────────────────────────────
function PodiumSlider({ C, groups }) {
  const [idx, setIdx] = useState(0);
  const g = groups[idx];
  const catColor = { A: C.green, B: C.blue, C: C.amber };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 28, gap: 20 }}>
        <div style={{ display: 'inline-flex', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, gap: 4 }}>
          {groups.map((gr, i) => {
            const on = i === idx;
            return (
              <button key={gr.key} onClick={() => setIdx(i)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '9px 18px', borderRadius: 7, fontSize: 13, fontWeight: on ? 600 : 500, background: on ? C.surface : 'transparent', color: on ? catColor[gr.key] : C.ink2, boxShadow: on ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: -0.1 }}>
                <span style={{ width: 20, height: 20, borderRadius: 5, background: catColor[gr.key] + '1A', color: catColor[gr.key], fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{gr.key}</span>
                Categoría {gr.key}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SliderArrow C={C} dir="prev" disabled={idx === 0} onClick={() => setIdx(Math.max(0, idx - 1))} />
          <SliderArrow C={C} dir="next" disabled={idx === groups.length - 1} onClick={() => setIdx(Math.min(groups.length - 1, idx + 1))} />
        </div>
      </div>
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>{g.title}</div>
        <div style={{ fontSize: 13, color: C.ink2, marginTop: 4 }}>{g.desc}</div>
      </div>
      <Podium C={C} items={g.items} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
        {groups.map((gr, i) => (
          <span key={gr.key} onClick={() => setIdx(i)} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 4, background: i === idx ? catColor[gr.key] : C.borderStrong, cursor: 'pointer', transition: 'all 0.2s' }} />
        ))}
      </div>
    </div>
  );
}

function SliderArrow({ C, dir, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: 40, height: 40, borderRadius: '50%', border: `1px solid ${disabled ? C.border : C.borderStrong}`, background: C.surface, cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : 1 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {dir === 'prev' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  );
}

// ── PODIUM ─────────────────────────────────────
function Podium({ C, items }) {
  // Orden visual: 2 · 1 · 3
  const ordered = [items[1], items[0], items[2]];
  const heights = [240, 300, 200];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 32, alignItems: 'end' }}>
      {ordered.map((it, i) => {
        const isFirst = it.rank === 1;
        return (
          <div key={it.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Tarjeta */}
            <div style={{
              background: C.surface,
              border: `1px solid ${isFirst ? C.green : C.border}`,
              borderRadius: 14,
              padding: '24px 22px',
              width: '100%',
              position: 'relative',
              transform: isFirst ? 'scale(1.02)' : 'none',
            }}>
              {/* Medalla */}
              <div style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', width: 56, height: 56, borderRadius: '50%', background: it.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, border: `4px solid ${C.surface}`, fontFamily: `'Inter'` }}>
                {it.rank}
              </div>

              <div style={{ marginTop: 26, textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <CatBadge C={C} cat={it.cat} />
                  <span style={{ fontSize: 11, color: C.ink2, fontWeight: 500 }}>{it.type}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4, color: C.ink }}>{it.name}</div>

                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.green, letterSpacing: -0.5 }}>{it.kg}<span style={{ fontSize: 13, fontWeight: 500, color: C.ink2, marginLeft: 3 }}>kg</span></div>
                    <div style={{ fontSize: 10, color: C.ink2, fontWeight: 500, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 2 }}>Reciclado</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: -0.5 }}>{it.eco.toLocaleString('es-AR')}</div>
                    <div style={{ fontSize: 10, color: C.ink2, fontWeight: 500, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 2 }}>Puntos ECO</div>
                  </div>
                </div>

                <div style={{ display: 'inline-flex', marginTop: 16, padding: '6px 12px', background: C.greenSoft, color: C.greenInk, borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                  <span style={{ marginRight: 6 }}>✦</span>{it.badge}
                </div>
              </div>
            </div>

            {/* Base del podio */}
            <div style={{
              width: '70%', height: heights[i],
              background: `linear-gradient(180deg, ${isFirst ? C.greenSoft : C.bg} 0%, ${C.bg} 100%)`,
              border: `1px solid ${C.border}`, borderBottom: 'none',
              marginTop: 12,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 18,
              fontSize: 56, fontWeight: 700, color: isFirst ? C.green : C.ink3, letterSpacing: -2,
              borderRadius: '8px 8px 0 0',
            }}>
              {it.rank}°
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── RANKING TABLE ─────────────────────────────
function RankingTable({ C, rows }) {
  const cols = [
    { k: 'rank', label: 'Pos.', w: 60 },
    { k: 'name', label: 'Organización', w: 280 },
    { k: 'cat', label: 'Cat.', w: 60 },
    { k: 'type', label: 'Tipo', w: 140 },
    { k: 'kg', label: 'Reciclado', w: 110, num: true },
    { k: 'eco', label: 'Puntos ECO', w: 120, num: true },
    { k: 'certs', label: 'Cert.', w: 70, num: true },
    { k: 'badges', label: 'Insignias', w: 170 },
    { k: 'trend', label: 'Tendencia', w: 110 },
  ];

  return (
    <div style={{ marginTop: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', padding: '14px 20px', background: C.bg, borderBottom: `1px solid ${C.border}` }}>
        {cols.map(c => (
          <div key={c.k} style={{ width: c.w, fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: c.num ? 'right' : 'left' }}>{c.label}</div>
        ))}
      </div>

      {rows.map((r, i) => (
        <div key={r.rank} style={{
          display: 'flex', padding: '16px 20px', alignItems: 'center',
          borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : 'none',
          background: r.rank <= 3 ? '#FCFCFA' : C.surface,
        }}>
          <div style={{ width: 60, display: 'flex', alignItems: 'center', gap: 6 }}>
            {r.rank <= 3 ? (
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: ['#C9A227', '#9AA3AA', '#B8742E'][r.rank - 1], color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.rank}</div>
            ) : (
              <div style={{ fontSize: 15, fontWeight: 600, color: C.ink2, paddingLeft: 4 }}>{r.rank}</div>
            )}
          </div>
          <div style={{ width: 280, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: C.greenSoft, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, letterSpacing: -0.3 }}>
              {r.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: -0.2 }}>{r.name}</div>
          </div>
          <div style={{ width: 60 }}><CatBadge C={C} cat={r.cat} /></div>
          <div style={{ width: 140, fontSize: 13, color: C.ink2 }}>{r.type}</div>
          <div style={{ width: 110, textAlign: 'right', fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: -0.2 }}>
            {r.kg} <span style={{ fontSize: 11, color: C.ink2, fontWeight: 500 }}>kg</span>
          </div>
          <div style={{ width: 120, textAlign: 'right', fontSize: 14, fontWeight: 600, color: C.green, letterSpacing: -0.2 }}>
            {r.eco.toLocaleString('es-AR')}
          </div>
          <div style={{ width: 70, textAlign: 'right', fontSize: 13, color: C.ink2 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="14" rx="1" /><path d="M8 9h8M8 13h5" /></svg>
              {r.certs}
            </span>
          </div>
          <div style={{ width: 170, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {r.badges.length > 0 ? r.badges.map((b, j) => (
              <span key={j} style={{ fontSize: 10, fontWeight: 600, padding: '4px 8px', borderRadius: 4, background: C.greenSoft, color: C.greenInk, letterSpacing: 0.2 }}>{b}</span>
            )) : <span style={{ fontSize: 11, color: C.ink3 }}>—</span>}
          </div>
          <div style={{ width: 110 }}>
            <TrendChip C={C} trend={r.trend} delta={r.delta} />
          </div>
        </div>
      ))}

      {/* Footer */}
      <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.bg, borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 12, color: C.ink2 }}>Mostrando 8 de 47 organizaciones</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ background: C.surface, border: `1px solid ${C.border}`, padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, color: C.ink2, cursor: 'pointer', fontFamily: 'inherit' }}>Anterior</button>
          <button style={{ background: C.green, border: 'none', padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Ver todas</button>
        </div>
      </div>
    </div>
  );
}

function TrendChip({ C, trend, delta }) {
  const map = {
    up: { color: C.green, bg: C.greenSoft, icon: '↑' },
    down: { color: C.amber, bg: C.amberSoft, icon: '↓' },
    flat: { color: C.ink2, bg: C.bg, icon: '—' },
  }[trend];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: map.bg, color: map.color, fontSize: 11, fontWeight: 600 }}>
      <span>{map.icon}</span>{delta}
    </span>
  );
}

// ── CHARTS ────────────────────────────────────
function ChartCard({ C, title, sub, children }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>{title}</div>
      <div style={{ fontSize: 12, color: C.ink2, marginTop: 4 }}>{sub}</div>
      <div style={{ marginTop: 20 }}>{children}</div>
    </div>
  );
}

function BarChart({ C, data }) {
  const max = Math.max(...data.map(d => d.value));
  const catColor = { A: C.green, B: C.blue, C: C.amber };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 180, fontSize: 12, color: C.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
          <div style={{ flex: 1, height: 18, background: C.bg, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '100%', width: `${(d.value / max) * 100}%`, background: catColor[d.cat], borderRadius: 3 }} />
          </div>
          <div style={{ width: 70, textAlign: 'right', fontSize: 12, fontWeight: 600, color: C.ink, letterSpacing: -0.2 }}>{d.value} kg</div>
        </div>
      ))}
    </div>
  );
}

function Donut({ C }) {
  const data = [
    { label: 'Cartón', value: 37, color: C.green },
    { label: 'Plástico PET', value: 24, color: C.blue },
    { label: 'Vidrio', value: 18, color: C.amber },
    { label: 'Papel', value: 12, color: '#6FA889' },
    { label: 'Metal', value: 6, color: '#8499B5' },
    { label: 'Otros', value: 3, color: C.ink3 },
  ];
  let acc = 0;
  const R = 70, CX = 90, CY = 90, STROKE = 28;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={C.bg} strokeWidth={STROKE} />
        {data.map((d, i) => {
          const dash = (d.value / 100) * circ;
          const off = -((acc / 100) * circ);
          acc += d.value;
          return <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={d.color} strokeWidth={STROKE} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={off} transform={`rotate(-90 ${CX} ${CY})`} />;
        })}
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize="22" fontWeight="700" fill={C.ink} fontFamily="Inter" letterSpacing="-0.5">8.412</text>
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize="11" fill={C.ink2} fontFamily="Inter" letterSpacing="0.5">KG TOTAL</text>
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
            <span style={{ flex: 1, fontSize: 12, color: C.ink }}>{d.label}</span>
            <span style={{ fontSize: 12, color: C.ink2, fontWeight: 600 }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ C }) {
  const months = ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'];
  const values = [3200, 3600, 4100, 4800, 5200, 5800, 6100, 5600, 6400, 7100, 7500, 8412];
  const W = 600, H = 220, P = 32;
  const max = 9000, min = 2800;
  const x = i => P + (i / (values.length - 1)) * (W - P * 2);
  const y = v => H - P - ((v - min) / (max - min)) * (H - P * 2);
  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const area = `M ${x(0)},${H - P} L ${points.split(' ').join(' L ')} L ${x(values.length - 1)},${H - P} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* grid */}
      {[0, 1, 2, 3].map(i => {
        const yy = P + (i / 3) * (H - P * 2);
        return <line key={i} x1={P} y1={yy} x2={W - P} y2={yy} stroke={C.border} strokeWidth="1" />;
      })}
      {/* y labels */}
      {[9000, 7000, 5000, 3000].map((v, i) => (
        <text key={v} x={P - 8} y={P + (i / 3) * (H - P * 2) + 4} textAnchor="end" fontSize="10" fill={C.ink2} fontFamily="Inter">{v / 1000}k</text>
      ))}
      {/* area */}
      <path d={area} fill={C.green} opacity="0.08" />
      {/* line */}
      <polyline points={points} fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* dots */}
      {values.map((v, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(v)} r={i === values.length - 1 ? 6 : 3} fill={i === values.length - 1 ? C.green : C.surface} stroke={C.green} strokeWidth="2" />
          {i === values.length - 1 && (
            <g>
              <rect x={x(i) - 30} y={y(v) - 38} width="60" height="24" rx="4" fill={C.green} />
              <text x={x(i)} y={y(v) - 22} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="Inter">8.412 kg</text>
            </g>
          )}
        </g>
      ))}
      {/* x labels */}
      {months.map((m, i) => (
        <text key={m} x={x(i)} y={H - P + 18} textAnchor="middle" fontSize="10" fill={C.ink2} fontFamily="Inter">{m}</text>
      ))}
    </svg>
  );
}

function CatCompare({ C }) {
  const cats = [
    { cat: 'A', label: 'Grandes generadores', orgs: 8, avg: 387, color: C.green },
    { cat: 'B', label: 'Generadores medianos', orgs: 19, avg: 162, color: C.blue },
    { cat: 'C', label: 'Pequeños generadores', orgs: 20, avg: 68, color: C.amber },
  ];
  const max = Math.max(...cats.map(c => c.avg));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {cats.map(c => (
        <div key={c.cat}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CatBadge C={C} cat={c.cat} />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{c.label}</span>
            </div>
            <span style={{ fontSize: 11, color: C.ink2 }}>{c.orgs} orgs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 10, background: C.bg, borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${(c.avg / max) * 100}%`, height: '100%', background: c.color, borderRadius: 5 }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, width: 80, textAlign: 'right' }}>{c.avg} kg <span style={{ fontSize: 10, color: C.ink2, fontWeight: 500 }}>prom.</span></span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ORG PROFILE ───────────────────────────────
function OrgProfile({ C }) {
  return (
    <div style={{ marginTop: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', display: 'grid', gridTemplateColumns: '320px 1fr' }}>
      {/* Sidebar */}
      <div style={{ padding: 28, background: C.greenSoft, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ width: 80, height: 80, borderRadius: 16, background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 22V8h6V4h6v4h6v14" /><path d="M9 22V14h6v8" /><path d="M12 8v3" />
          </svg>
        </div>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CatBadge C={C} cat="A" />
            <span style={{ fontSize: 11, color: C.greenInk, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Salud pública</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.6, color: C.ink, lineHeight: 1.15 }}>Hospital<br />Pasteur</div>
          <div style={{ fontSize: 13, color: C.ink2, marginTop: 8 }}>Av. Sabattini 1234<br />Villa María, Córdoba</div>
        </div>
        <div style={{ height: 1, background: C.border }} />
        <div>
          <div style={{ fontSize: 11, color: C.ink2, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Meses participando</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: C.green, letterSpacing: -0.6 }}>14</span>
            <span style={{ fontSize: 13, color: C.ink2 }}>consecutivos</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          <ProfileStat C={C} label="Total reciclado" value="489 kg" sub="Abril 2026" />
          <ProfileStat C={C} label="Puntos ECO" value="1.250" sub="Acumulados este mes" accent={C.green} />
          <ProfileStat C={C} label="Certificados" value="14" sub="Desde 2025" />
          <ProfileStat C={C} label="CO₂ evitado" value="548 kg" sub="Equivalente" />
        </div>

        {/* Materials */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 12 }}>Materiales entregados · abril</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { m: 'Cartón', kg: 214, c: C.green },
              { m: 'Plástico PET', kg: 142, c: C.blue },
              { m: 'Vidrio', kg: 88, c: C.amber },
              { m: 'Papel', kg: 45, c: '#6FA889' },
            ].map(m => (
              <div key={m.m} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: m.c }} />
                  <span style={{ fontSize: 12, color: C.ink2, fontWeight: 500 }}>{m.m}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, letterSpacing: -0.4, marginTop: 4 }}>{m.kg} kg</div>
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
        <div style={{ background: C.greenSoft, border: `1px solid ${C.green}33`, borderRadius: 10, padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M12 2C7 7 7 12 12 22M12 2c5 5 5 10 0 20" /><path d="M2 12h20" />
          </svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.greenInk, marginBottom: 4 }}>Reconocimiento ambiental</div>
            <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.55 }}>
              Hospital Pasteur lleva 14 meses consecutivos reciclando con EcoToken. Su compromiso evitó la emisión de más de 6.700 kg de CO₂ desde 2025 y lo posiciona como referente de salud sustentable en Villa María.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileStat({ C, label, value, sub, accent }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: C.ink2, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6, marginTop: 6, color: accent || C.ink }}>{value}</div>
      <div style={{ fontSize: 11, color: C.ink2, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

// ── TRANSPARENCIA ─────────────────────────────
function Transparency({ C }) {
  const items = [
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>, t: 'Datos verificados', d: 'Cada pesaje es registrado por la Cooperativa 7 de Febrero y firmado por la Municipalidad.' },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>, t: 'Trazabilidad on-chain', d: 'Cada certificado emitido tiene un hash público verificable en basescan.org.' },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>, t: 'Última actualización', d: '30 de abril 2026 · 18:42 hs. Los datos se actualizan al cierre de cada mes.' },
  ];

  return (
    <div style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 48px' }}>
        <SectionTitle C={C} eyebrow="Transparencia" title="Cómo verificamos cada dato" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 28 }}>
          {items.map((it, i) => (
            <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, background: C.bg }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: C.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginTop: 16, letterSpacing: -0.3 }}>{it.t}</div>
              <div style={{ fontSize: 13, color: C.ink2, marginTop: 8, lineHeight: 1.55 }}>{it.d}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, padding: '20px 24px', background: C.greenSoft, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>✦</div>
          <div style={{ fontSize: 14, color: C.greenInk, lineHeight: 1.5 }}>
            <strong>EcoToken</strong> promueve la visibilidad y reconocimiento del compromiso ambiental de las organizaciones de Villa María. Los puntos ECO son un sistema de reconocimiento, no un activo financiero.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────
function Footer({ C }) {
  return (
    <div style={{ background: '#0F1411', color: '#D9DCD7' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 48px 32px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 }}>
        <div>
          <img src="assets/logo-ecotoken.png" alt="EcoToken" style={{ height: 40, width: 'auto', display: 'block', filter: 'brightness(1.1)' }} />
          <div style={{ fontSize: 13, color: '#A8AEA8', marginTop: 16, lineHeight: 1.6, maxWidth: 360 }}>
            Programa público de reconocimiento ambiental para organizaciones de Villa María, Córdoba.
          </div>
        </div>
        {[
          { t: 'Programa', l: ['Cómo funciona', 'Adhesión', 'Beneficios', 'Reglamento'] },
          { t: 'Aliados', l: ['Municipalidad', 'Coop. 7 de Febrero', 'Sec. Ambiente'] },
          { t: 'Contacto', l: ['hola@ecotoken.gob.ar', '+54 353 451-0000', 'Mendoza 850, V. María'] },
        ].map((col, i) => (
          <div key={i}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>{col.t}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.l.map(item => <div key={item} style={{ fontSize: 13, color: '#A8AEA8' }}>{item}</div>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #1F2622', padding: '20px 48px', maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7A8077' }}>
        <div>© 2026 EcoToken · Municipalidad de Villa María</div>
        <div style={{ fontFamily: `'JetBrains Mono', monospace` }}>Versión 1.0 · Datos abiertos</div>
      </div>
    </div>
  );
}

Object.assign(window, { RankingLanding });
