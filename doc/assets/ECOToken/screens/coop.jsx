// Grupo 2 — Cooperativa 7 de Febrero (ámbar)
// 1. Registrar pesaje  2. Historial de retiros  3. Cierre de mes

const COOP_TABS = [
  { label: 'Registrar', icon: I.scale },
  { label: 'Historial', icon: I.list },
  { label: 'Cierre', icon: I.calendar },
];

// ── 1. Registrar pesaje ──────────────────────────────────────────
function CoopRegister() {
  const items = [
    { label: 'Plástico', kg: 24, rate: 1.5 },
    { label: 'Vidrio', kg: 18, rate: 0.8 },
    { label: 'Cartón', kg: 41, rate: 1.0 },
  ];
  const totalKg = items.reduce((s, x) => s + x.kg, 0);
  const totalEco = items.reduce((s, x) => s + x.kg * x.rate, 0);

  return (
    <Screen>
      <TopBar actor="coop" subtitle="Coop. 7 de Febrero" title="Registrar entrega" />
      <Body>
        {/* Org selector */}
        <div>
          <Label>Organización</Label>
          <Card pad={0}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: ECO.orgSoft, color: ECO.org, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>BP</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Organización X</div>
                  <div style={{ fontSize: 12, color: ECO.ink2 }}>CUIT 30-XXXXXXXX-X · Dirección a definir</div>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ECO.ink2} strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </Card>
        </div>

        {/* Material inputs */}
        <div>
          <Label>Material recibido</Label>
          <Card pad={0}>
            {items.map((it, i, arr) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 14px',
                borderBottom: i < arr.length - 1 ? `1px solid ${ECO.border}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <MaterialDot type={it.label} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{it.label}</div>
                    <div style={{ fontSize: 11, color: ECO.ink2, marginTop: 1 }}>{it.rate} ECO / kg</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, padding: '6px 10px', background: ECO.bg, border: `1px solid ${ECO.border}`, borderRadius: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 600, fontFamily: MONO, letterSpacing: -0.5 }}>{it.kg.toString().padStart(2, '0')}</div>
                  <div style={{ fontSize: 11, color: ECO.ink2, fontWeight: 500 }}>kg</div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Estimation */}
        <Card style={{ background: ECO.coopSoft, borderColor: ECO.coopSoft }}>
          <Row>
            <div>
              <div style={{ fontSize: 11, color: ECO.coop, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Total a registrar</div>
              <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, letterSpacing: -0.5 }}>{totalKg} kg</div>
            </div>
            <div style={{ width: 1, height: 40, background: ECO.coop, opacity: 0.2 }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: ECO.coop, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Tokens a entregar</div>
              <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, letterSpacing: -0.5 }}>+{totalEco.toFixed(0)} <span style={{ fontSize: 12, color: ECO.ink2, fontWeight: 500 }}>ECO</span></div>
            </div>
          </Row>
        </Card>

        <div style={{ fontSize: 11, color: ECO.ink2, lineHeight: 1.5, padding: '0 4px' }}>
          Al confirmar, los tokens se registran en la billetera de Organización X y queda asentado en el libro público del programa.
        </div>

        <Btn color={ECO.coop}>Confirmar entrega</Btn>
      </Body>
      <TabBar actor="coop" tabs={COOP_TABS} active={0} />
    </Screen>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: ECO.ink2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, padding: '0 4px' }}>{children}</div>;
}

function MaterialDot({ type }) {
  const map = {
    'Plástico': { c: '#3B7BD9', l: 'PL' },
    'Vidrio': { c: '#3F9C7F', l: 'VI' },
    'Cartón': { c: '#A86A2E', l: 'CA' },
    'Mixto': { c: '#7A7A7A', l: 'MX' },
  };
  const m = map[type] || map['Mixto'];
  return (
    <div style={{ width: 30, height: 30, borderRadius: 4, background: m.c + '18', color: m.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, letterSpacing: 0.3 }}>{m.l}</div>
  );
}

// ── 2. Historial de retiros ─────────────────────────────────────
function CoopHistory() {
  const groups = [
    { d: '22 Abr', items: [
      { org: 'Organización X', kg: 64, eco: 48, hash: '0x8f2a…b41c' },
      { org: 'ONG Reciclar Más', kg: 28, eco: 21, hash: '0x4a99…cd02' },
    ]},
    { d: '21 Abr', items: [
      { org: 'Almacén Don Hugo', kg: 12, eco: 9, hash: '0xb721…aaee' },
      { org: 'Hospital Pasteur', kg: 87, eco: 65, hash: '0x90c4…1244' },
    ]},
    { d: '18 Abr', items: [
      { org: 'Organización X', kg: 41, eco: 62, hash: '0x71e9…2d08' },
      { org: 'Escuela N°34', kg: 18, eco: 14, hash: '0xf210…0091' },
      { org: 'Cooperativa Puente', kg: 53, eco: 40, hash: '0xc551…7782' },
    ]},
  ];

  const totalKg = 1248;
  const totalEco = 936;
  const totalOrgs = 14;

  return (
    <Screen>
      <TopBar
        actor="coop"
        subtitle="Abril 2026"
        title="Historial de retiros"
        right={<div style={{ fontSize: 12, color: ECO.coop, fontWeight: 600 }}>Filtrar</div>}
      />
      <Body>
        <Card>
          <Row>
            <Stat label="Entregas" value={totalOrgs.toString()} sub="organizaciones" />
            <div style={{ width: 1, alignSelf: 'stretch', background: ECO.border }} />
            <Stat label="Total" value={`${totalKg} kg`} sub="abril a la fecha" />
            <div style={{ width: 1, alignSelf: 'stretch', background: ECO.border }} />
            <Stat label="Tokens" value={totalEco.toString()} sub="ECO emitidos" accent={ECO.coop} />
          </Row>
        </Card>

        {groups.map((g, gi) => (
          <div key={gi}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px 6px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: ECO.ink }}>{g.d}</div>
              <div style={{ flex: 1, height: 1, background: ECO.border }} />
              <div style={{ fontSize: 11, color: ECO.ink2 }}>{g.items.length} entregas</div>
            </div>
            <Card pad={0}>
              {g.items.map((it, i, arr) => (
                <div key={i} style={{
                  padding: '12px 14px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${ECO.border}` : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2 }}>{it.org}</div>
                    <Hash style={{ marginTop: 4, display: 'inline-block' }}>{it.hash}</Hash>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: ECO.ink }}>{it.kg} kg</div>
                    <div style={{ fontSize: 12, color: ECO.coop, fontWeight: 600, marginTop: 2 }}>+{it.eco} ECO</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        ))}
      </Body>
      <TabBar actor="coop" tabs={COOP_TABS} active={1} />
    </Screen>
  );
}

// ── 3. Cierre de mes ────────────────────────────────────────────
function CoopMonthClose() {
  const top = [
    { rank: 1, org: 'Hospital Pasteur', kg: 489 },
    { rank: 2, org: 'Cooperativa Puente', kg: 421 },
    { rank: 3, org: 'Organización X', kg: 412 },
  ];

  return (
    <Screen>
      <TopBar actor="coop" subtitle="Periodo cerrado" title="Cierre · Abril 2026" />
      <Body>
        {/* Status */}
        <Card>
          <Row>
            <div>
              <Pill color={ECO.coop}>Listo para emitir</Pill>
              <div style={{ fontSize: 13, color: ECO.ink, marginTop: 8, lineHeight: 1.4 }}>
                Todos los pesajes del mes están registrados y verificados.
              </div>
            </div>
            <div style={{ width: 56, height: 56, borderRadius: 28, border: `2px solid ${ECO.coop}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ECO.coop, flexShrink: 0 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
            </div>
          </Row>
        </Card>

        {/* Resumen */}
        <Card>
          <div style={{ fontSize: 11, fontWeight: 600, color: ECO.ink2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Resumen del mes</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 16, columnGap: 12 }}>
            <Stat label="Organizaciones" value="47" sub="adheridas activas" />
            <Stat label="Total reciclado" value="8.412 kg" sub="todos los materiales" />
            <Stat label="CO₂ evitado" value="9.421 kg" sub="equivalente" accent={ECO.coop} />
            <Stat label="Tokens emitidos" value="6.309" sub="ECO en abril" accent={ECO.coop} />
          </div>
        </Card>

        {/* Top 3 */}
        <div>
          <Label>Top 3 del mes</Label>
          <Card pad={0}>
            {top.map((t, i, arr) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px',
                borderBottom: i < arr.length - 1 ? `1px solid ${ECO.border}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 13, background: t.rank === 1 ? ECO.coop : ECO.bg, color: t.rank === 1 ? '#fff' : ECO.ink, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.rank}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{t.org}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.kg} kg</div>
              </div>
            ))}
          </Card>
        </div>

        <div style={{ fontSize: 11, color: ECO.ink2, lineHeight: 1.5, padding: '4px' }}>
          Esta acción genera 47 certificados digitales firmados, uno por cada organización adherida. La operación es irreversible.
        </div>

        <Btn color={ECO.coop}>Emitir certificados del mes</Btn>
      </Body>
      <TabBar actor="coop" tabs={COOP_TABS} active={2} />
    </Screen>
  );
}

Object.assign(window, { CoopRegister, CoopHistory, CoopMonthClose });
