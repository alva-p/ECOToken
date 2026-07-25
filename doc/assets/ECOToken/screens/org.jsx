// Grupo 1 — Organización (verde)
// 1. Dashboard  2. Canjear tokens  3. Mis certificados

const ORG_TABS = [
  { label: 'Inicio', icon: I.home },
  { label: 'Canjear', icon: I.swap },
  { label: 'Certificados', icon: I.cert },
];

// ── 1. Dashboard ──────────────────────────────────────────────────
function OrgDashboard() {
  return (
    <Screen>
      <TopBar
        actor="org"
        subtitle="Organización X"
        title="Inicio"
        right={<div style={{ width: 32, height: 32, borderRadius: 16, background: ECO.orgSoft, color: ECO.org, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>BP</div>}
      />
      <Body>
        {/* Saldo principal */}
        <Card pad={18} style={{ borderColor: ECO.org }}>
          <div style={{ fontSize: 11, color: ECO.org, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>Mis tokens ECO</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
            <div style={{ fontSize: 42, fontWeight: 600, letterSpacing: -1.5, lineHeight: 1, color: ECO.ink }}>2.847</div>
            <div style={{ fontSize: 14, color: ECO.ink2, fontWeight: 500 }}>ECO</div>
          </div>
          <div style={{ fontSize: 12, color: ECO.ink2, marginTop: 6 }}>+ 184 este mes · disponibles para canjear</div>
        </Card>

        {/* Métricas mes */}
        <Card>
          <Row align="flex-start" justify="space-between">
            <Stat label="Reciclado" value="368 kg" sub="Abril 2026" />
            <div style={{ width: 1, alignSelf: 'stretch', background: ECO.border }} />
            <Stat label="CO₂ evitado" value="412 kg" sub="equivalente" />
            <div style={{ width: 1, alignSelf: 'stretch', background: ECO.border }} />
            <Stat label="Ranking" value="#3" sub="de 47 org." />
          </Row>
        </Card>

        {/* Últimas entregas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 4px 0' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Últimas entregas</div>
          <div style={{ fontSize: 12, color: ECO.org, fontWeight: 500 }}>Ver todas</div>
        </div>

        <Card pad={0}>
          {[
            { d: '22 Abr', m: 'Cartón', kg: '64 kg', t: '+48 ECO' },
            { d: '15 Abr', m: 'Plástico', kg: '41 kg', t: '+62 ECO' },
            { d: '08 Abr', m: 'Vidrio', kg: '92 kg', t: '+46 ECO' },
            { d: '01 Abr', m: 'Mixto', kg: '171 kg', t: '+128 ECO' },
          ].map((r, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', borderBottom: i < arr.length - 1 ? `1px solid ${ECO.border}` : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: ECO.ink2, fontWeight: 500, textTransform: 'uppercase' }}>{r.d.split(' ')[1]}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1, color: ECO.ink }}>{r.d.split(' ')[0]}</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{r.m}</div>
                  <div style={{ fontSize: 12, color: ECO.ink2 }}>{r.kg} · Coop. 7 de Febrero</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: ECO.org }}>{r.t}</div>
            </div>
          ))}
        </Card>
      </Body>
      <TabBar actor="org" tabs={ORG_TABS} active={0} />
    </Screen>
  );
}

// ── 2. Canjear tokens ─────────────────────────────────────────────
function OrgRedeem() {
  const balance = 2847;
  const benefits = [
    { t: 'Mención en redes sociales o página de la municipalidad', d: 'Emitido por la Municipalidad · PDF firmado', cost: 500, by: 'Municipalidad' },
    { t: 'Publicidad en las pantallas digitales de la ciudad', d: 'Aplicable al próximo vencimiento', cost: 1500, by: 'Municipalidad' },
    { t: 'Descuento 25% en tasa municipal', d: 'Cupo limitado · vigencia 60 días', cost: 3500, by: 'Municipalidad' },
    { t: 'Mención en boletín ambiental', d: 'Publicación mensual de la ciudad', cost: 800, by: 'Municipalidad' },
    { t: 'Auditoría ambiental gratuita', d: 'Servicio de la Coop. 7 de Febrero', cost: 5000, by: 'Cooperativa' },
  ];

  return (
    <Screen>
      <TopBar actor="org" subtitle="Beneficios disponibles" title="Canjear tokens" />
      <Body>
        <Card style={{ background: ECO.orgSoft, borderColor: ECO.orgSoft }}>
          <Row>
            <div>
              <div style={{ fontSize: 11, color: ECO.org, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Saldo</div>
              <div style={{ fontSize: 24, fontWeight: 600, marginTop: 2, color: ECO.ink }}>2.847 <span style={{ fontSize: 13, color: ECO.ink2, fontWeight: 500 }}>ECO</span></div>
            </div>
            <div style={{ fontSize: 12, color: ECO.ink2, textAlign: 'right' }}>
              Próxima entrega<br/><span style={{ color: ECO.ink, fontWeight: 600 }}>29 Abr</span>
            </div>
          </Row>
        </Card>

        {benefits.map((b, i) => {
          const enabled = balance >= b.cost;
          return (
            <Card key={i} style={{ opacity: enabled ? 1 : 0.55 }}>
              <Row align="flex-start">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <Pill color={ECO.muni}>{b.by}</Pill>
                    {!enabled && <Pill color={ECO.ink3} style={{ background: ECO.bg, color: ECO.ink2 }}>Saldo insuficiente</Pill>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{b.t}</div>
                  <div style={{ fontSize: 12, color: ECO.ink2, marginTop: 3, lineHeight: 1.4 }}>{b.d}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: ECO.ink, letterSpacing: -0.4 }}>{b.cost.toLocaleString('es-AR')}</div>
                  <div style={{ fontSize: 10, color: ECO.ink2, fontWeight: 500, letterSpacing: 0.4 }}>ECO</div>
                </div>
              </Row>
              <div style={{ marginTop: 12 }}>
                <Btn color={ECO.org} variant={enabled ? 'solid' : 'outline'} disabled={!enabled}>
                  {enabled ? `Confirmar canje · ${b.cost} ECO` : `Faltan ${(b.cost - balance).toLocaleString('es-AR')} ECO`}
                </Btn>
              </div>
            </Card>
          );
        })}
      </Body>
      <TabBar actor="org" tabs={ORG_TABS} active={1} />
    </Screen>
  );
}

// ── 3. Mis certificados ──────────────────────────────────────────
function OrgCerts() {
  const certs = [
    { m: 'Marzo 2026', kg: 412, co2: 461, rank: 3, hash: '0x8f2a…b41c', current: false },
    { m: 'Febrero 2026', kg: 388, co2: 435, rank: 4, hash: '0x71e9…2d08', current: false },
    { m: 'Enero 2026', kg: 296, co2: 332, rank: 5, hash: '0x44b1…9aa7', current: false },
    { m: 'Diciembre 2025', kg: 351, co2: 393, rank: 4, hash: '0xd0c2…f51e', current: false },
  ];

  return (
    <Screen>
      <TopBar actor="org" subtitle="Verificados on-chain" title="Mis certificados" />
      <Body>
        {/* Featured certificate */}
        <Card pad={0} style={{ overflow: 'hidden', borderColor: ECO.org }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${ECO.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Pill color={ECO.org}>Más reciente</Pill>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>Marzo 2026</div>
            </div>
            <div style={{ width: 70, height: 70, background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QRGlyph />
            </div>
          </div>
          <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: ECO.ink2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4 }}>Reciclado</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>412 kg</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: ECO.ink2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4 }}>CO₂ evitado</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>461 kg</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: ECO.ink2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4 }}>Ranking</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>#3 <span style={{ fontSize: 12, color: ECO.ink2, fontWeight: 500 }}>de 47</span></div>
            </div>
          </div>
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${ECO.border}`, background: ECO.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10, color: ECO.ink2, textTransform: 'uppercase', fontWeight: 500, letterSpacing: 0.4 }}>Verificación</div>
              <Hash style={{ fontSize: 12 }}>0x8f2a47c3…b41c</Hash>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: ECO.org }}>Compartir</div>
          </div>
        </Card>

        <div style={{ fontSize: 11, fontWeight: 600, color: ECO.ink2, textTransform: 'uppercase', letterSpacing: 0.6, padding: '4px 4px 0' }}>Historial</div>

        {certs.slice(1).map((c, i) => (
          <Card key={i} pad={12}>
            <Row>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{c.m}</div>
                <div style={{ fontSize: 12, color: ECO.ink2, marginTop: 2 }}>
                  {c.kg} kg · {c.co2} kg CO₂ · #{c.rank}
                </div>
                <Hash style={{ fontSize: 11, marginTop: 4, display: 'inline-block' }}>{c.hash}</Hash>
              </div>
              <div style={{ width: 42, height: 42, border: `1px solid ${ECO.border}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QRGlyph small />
              </div>
            </Row>
          </Card>
        ))}
      </Body>
      <TabBar actor="org" tabs={ORG_TABS} active={2} />
    </Screen>
  );
}

// QR placeholder glyph — schematic, not a real QR
function QRGlyph({ small }) {
  const s = small ? 28 : 56;
  return (
    <svg width={s} height={s} viewBox="0 0 56 56">
      <rect x="0" y="0" width="56" height="56" fill="#fff"/>
      {/* corner finders */}
      {[[2,2],[40,2],[2,40]].map(([x,y],i) => (
        <g key={i}>
          <rect x={x} y={y} width="14" height="14" fill="#0F1115"/>
          <rect x={x+3} y={y+3} width="8" height="8" fill="#fff"/>
          <rect x={x+5} y={y+5} width="4" height="4" fill="#0F1115"/>
        </g>
      ))}
      {/* data dots */}
      {Array.from({length: 60}).map((_, i) => {
        const cx = 20 + (i % 8) * 4;
        const cy = 20 + Math.floor(i / 8) * 4;
        if ((cx > 36 && cy < 18) || (cx < 18 && cy > 36) || (cx < 18 && cy < 18)) return null;
        const on = (i * 7 + 3) % 3 !== 0;
        return on ? <rect key={i} x={cx} y={cy} width="3" height="3" fill="#0F1115"/> : null;
      })}
    </svg>
  );
}

Object.assign(window, { OrgDashboard, OrgRedeem, OrgCerts });
