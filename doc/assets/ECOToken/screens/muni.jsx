// Grupo 3 — Municipalidad (violeta)
// 1. Ranking mensual  2. Gestión de beneficios  3. Reporte ciudad

const MUNI_TABS = [
  { label: 'Ranking', icon: I.trophy },
  { label: 'Beneficios', icon: I.gift },
  { label: 'Reporte', icon: I.chart },
];

// ── 1. Ranking mensual ──────────────────────────────────────────
function MuniRanking() {
  const list = [
    { rank: 1, org: 'Hospital Pasteur', kg: 489, co2: 548, change: '↑ 1' },
    { rank: 2, org: 'Coop. Puente Verde', kg: 421, co2: 472, change: '↓ 1' },
    { rank: 3, org: 'Organización X', kg: 412, co2: 461, change: '—' },
    { rank: 4, org: 'ONG Reciclar Más', kg: 376, co2: 421, change: '↑ 2' },
    { rank: 5, org: 'Escuela Técnica N°34', kg: 318, co2: 356, change: '↓ 1' },
    { rank: 6, org: 'Almacén Don Hugo', kg: 287, co2: 321, change: '↑ 4' },
    { rank: 7, org: 'Club Atlético Villa María', kg: 244, co2: 273, change: '↓ 1' },
  ];
  const totalCity = '8.412';

  return (
    <Screen>
      <TopBar
        actor="muni"
        subtitle="Verificado · Abril 2026"
        title="Ranking mensual"
        right={<Pill color={ECO.muni}>Público</Pill>}
      />
      <Body>
        <Card style={{ background: ECO.muniSoft, borderColor: ECO.muniSoft }}>
          <Row>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: ECO.muni, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total ciudad</div>
              <div style={{ fontSize: 26, fontWeight: 600, marginTop: 4, letterSpacing: -0.7 }}>{totalCity} kg</div>
              <div style={{ fontSize: 11, color: ECO.ink2, marginTop: 2 }}>9.421 kg CO₂ evitado · 47 organizaciones</div>
            </div>
            <div style={{ fontSize: 11, color: ECO.muni, fontWeight: 600 }}>Ver detalle</div>
          </Row>
        </Card>

        {/* Top 1 — call to action */}
        <Card style={{ borderColor: ECO.muni }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: ECO.muni, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600 }}>1</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Hospital Pasteur</div>
              <div style={{ fontSize: 12, color: ECO.ink2, marginTop: 2 }}>489 kg · 548 kg CO₂ · 367 ECO</div>
            </div>
            <Pill color={ECO.org}>↑ 1 puesto</Pill>
          </div>
          <Btn color={ECO.muni}>Otorgar beneficio al 1° puesto</Btn>
        </Card>

        <Card pad={0}>
          {list.slice(1).map((r, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              borderBottom: i < arr.length - 1 ? `1px solid ${ECO.border}` : 'none',
            }}>
              <div style={{ width: 26, fontSize: 14, fontWeight: 600, color: ECO.ink2, textAlign: 'center' }}>{r.rank}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2 }}>{r.org}</div>
                <div style={{ fontSize: 11, color: ECO.ink2, marginTop: 2 }}>{r.kg} kg · {r.co2} kg CO₂</div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: r.change.includes('↑') ? ECO.org : r.change.includes('↓') ? ECO.coop : ECO.ink3,
                minWidth: 28, textAlign: 'right',
              }}>{r.change}</div>
            </div>
          ))}
        </Card>
      </Body>
      <TabBar actor="muni" tabs={MUNI_TABS} active={0} />
    </Screen>
  );
}

// ── 2. Gestión de beneficios ───────────────────────────────────
function MuniBenefits() {
  const active = [
    { t: 'Mención en Instagram o medios oficiales de la municipalidad', cost: 1500, used: 12, cap: 50 },
    { t: 'Beneficio X — a definir con municipalidad', cost: 0, used: 0, cap: '∞' },
    { t: 'Beneficio Z — a definir con municipalidad', cost: 0, used: 0, cap: '∞' },
  ];
  const drafts = [
    { t: 'Beneficio W — a definir con municipalidad', cost: 0 },
    { t: 'Beneficio Y — a definir con municipalidad', cost: 0 },
  ];

  return (
    <Screen>
      <TopBar
        actor="muni"
        subtitle="Catálogo público"
        title="Gestión de beneficios"
        right={<Pill color={ECO.muni}>+ Nuevo</Pill>}
      />
      <Body>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 8 }}>
          <Tab on>Activos · 3</Tab>
          <Tab>Borradores · 2</Tab>
        </div>

        {active.map((b, i) => (
          <Card key={i}>
            <Row align="flex-start">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: ECO.org }} />
                  <div style={{ fontSize: 11, color: ECO.org, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Activo</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{b.t}</div>
                <div style={{ fontSize: 12, color: ECO.ink2, marginTop: 6 }}>
                  {b.used} canjes · cupo {b.cap}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.4 }}>{b.cost > 0 ? b.cost.toLocaleString('es-AR') : '—'}</div>
                <div style={{ fontSize: 10, color: ECO.ink2, fontWeight: 500, letterSpacing: 0.4 }}>ECO</div>
              </div>
            </Row>
            {b.cap !== '∞' && (
              <div style={{ marginTop: 10 }}>
                <div style={{ height: 4, background: ECO.bg, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(b.used / b.cap) * 100}%`, background: ECO.muni }} />
                </div>
              </div>
            )}
          </Card>
        ))}

        <Label>Borradores</Label>
        {drafts.map((b, i) => (
          <Card key={i} style={{ borderStyle: 'dashed' }}>
            <Row align="flex-start">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: ECO.ink3 }} />
                  <div style={{ fontSize: 11, color: ECO.ink2, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Borrador</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: ECO.ink2 }}>{b.t}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: ECO.ink2, letterSpacing: -0.4 }}>{b.cost > 0 ? b.cost.toLocaleString('es-AR') : '—'}</div>
                <div style={{ fontSize: 10, color: ECO.ink3, fontWeight: 500, letterSpacing: 0.4 }}>ECO</div>
              </div>
            </Row>
          </Card>
        ))}
      </Body>
      <TabBar actor="muni" tabs={MUNI_TABS} active={1} />
    </Screen>
  );
}

function Tab({ children, on }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '8px 10px', borderRadius: 6,
      fontSize: 12, fontWeight: 600,
      background: on ? ECO.muniSoft : 'transparent',
      color: on ? ECO.muni : ECO.ink2,
    }}>{children}</div>
  );
}

// ── 3. Reporte ciudad ──────────────────────────────────────────
function MuniReport() {
  const monthly = [42, 51, 47, 63, 58, 72, 81, 76, 84, 92, 98, 105]
    .map((v, i) => ({ m: ['E','F','M','A','M','J','J','A','S','O','N','D'][i], v }));
  const max = Math.max(...monthly.map(x => x.v));

  return (
    <Screen>
      <TopBar
        actor="muni"
        subtitle="2026 · Acumulado anual"
        title="Reporte ciudad"
        right={<Pill color={ECO.muni}>Exportar</Pill>}
      />
      <Body>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <Stat label="Total reciclado" value="32.184 kg" sub="enero – abril" />
            <Stat label="CO₂ evitado" value="36.046 kg" sub="equivalente" accent={ECO.muni} />
            <Stat label="Organizaciones" value="47" sub="adheridas" />
            <Stat label="Tokens emitidos" value="24.138" sub="ECO totales" accent={ECO.muni} />
          </div>
        </Card>

        {/* Bar chart */}
        <Card>
          <Row style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Reciclaje mensual</div>
            <div style={{ fontSize: 11, color: ECO.ink2 }}>Toneladas / mes</div>
          </Row>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110, paddingTop: 4 }}>
            {monthly.map((d, i) => {
              const realized = i < 4;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%',
                    height: `${(d.v / max) * 92}px`,
                    background: realized ? ECO.muni : ECO.muniSoft,
                    border: realized ? 'none' : `1px dashed ${ECO.muni}`,
                    borderRadius: 2,
                  }} />
                  <div style={{ fontSize: 10, fontWeight: 500, color: realized ? ECO.ink : ECO.ink3 }}>{d.m}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 11, color: ECO.ink2 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: ECO.muni, borderRadius: 2 }}/>Realizado</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, border: `1px dashed ${ECO.muni}`, background: ECO.muniSoft, borderRadius: 2 }}/>Proyectado</span>
          </div>
        </Card>

        {/* By material */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Composición por material</div>
          {[
            { l: 'Cartón', pct: 42, c: '#A86A2E' },
            { l: 'Plástico', pct: 28, c: '#3B7BD9' },
            { l: 'Vidrio', pct: 19, c: '#3F9C7F' },
            { l: 'Mixto', pct: 11, c: '#7A7A7A' },
          ].map((m, i) => (
            <div key={i} style={{ marginBottom: i < 3 ? 12 : 0 }}>
              <Row style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{m.l}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{m.pct}%</div>
              </Row>
              <div style={{ height: 4, background: ECO.bg, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${m.pct}%`, height: '100%', background: m.c }} />
              </div>
            </div>
          ))}
        </Card>

        <div style={{ fontSize: 11, color: ECO.ink2, lineHeight: 1.5, padding: '0 4px' }}>
          Datos auditables. Reporte apto para rendición de cuentas ante fondos climáticos nacionales e internacionales.
        </div>
      </Body>
      <TabBar actor="muni" tabs={MUNI_TABS} active={2} />
    </Screen>
  );
}

Object.assign(window, { MuniRanking, MuniBenefits, MuniReport });
