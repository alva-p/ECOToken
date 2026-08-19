// EcoToken — Reporte mensual de actividad (A4 vertical)
// Documento técnico/contable — sobrio, parecido a un resumen bancario.

function ActivityReport() {
  const W = 794, H = 1123; // A4 portrait @ 96dpi
  const GREEN = '#0F6E56';
  const AMBER = '#BA7517';
  const INK = '#1A1A1A';
  const INK2 = '#5A5A5A';
  const ROW_ALT = '#F5F5F2';
  const BORDER = '#D9D9D5';

  const Section = ({ n, title, children }) => (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 22, height: 22, background: GREEN, color: '#fff',
          fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{n}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: GREEN, letterSpacing: 0.2, textTransform: 'uppercase' }}>{title}</div>
        <div style={{ flex: 1, height: 1, background: GREEN + '30' }} />
      </div>
      {children}
    </div>
  );

  return (
    <div style={{
      width: W, height: H, background: '#FFFFFF',
      fontFamily: `'Inter', system-ui, sans-serif`, color: INK,
      padding: '40px 46px 32px', position: 'relative',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottom: `2px solid ${GREEN}` }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="assets/logo-ecotoken.png?v=2" alt="EcoToken" style={{ height: 56, width: 'auto', display: 'block' }}/>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: INK2, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>Reporte mensual de actividad</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 3, letterSpacing: -0.4 }}>Abril 2026</div>
          <div style={{ fontSize: 10, color: INK2, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>N° 2026-04-0042</div>
        </div>
      </div>

      {/* ORG INFO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 14, fontSize: 10 }}>
        <div>
          <Field label="Organización" value="Organización X" big/>
          <Field label="CUIT" value="30-71204185-3"/>
          <Field label="Dirección" value="Bv. España 842, Villa María"/>
        </div>
        <div>
          <Field label="Dirección EVM" value="0xUSR1…0005" mono/>
          <Field label="Fecha de emisión" value="01 / 05 / 2026"/>
          <Field label="Periodo" value="01/04/2026 – 30/04/2026"/>
        </div>
      </div>

      {/* SECTION 1 — ENTREGAS */}
      <Section n="1" title="Entregas del mes">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
          <thead>
            <tr style={{ background: GREEN, color: '#fff' }}>
              <Th w="13%">Fecha</Th>
              <Th w="22%">Material</Th>
              <Th w="13%" align="right">Kg</Th>
              <Th w="22%" align="right">Tokens ECO</Th>
              <Th w="30%">TX Hash</Th>
            </tr>
          </thead>
          <tbody>
            <Tr d="03 / 04 / 2026" m="Plástico PET" kg="120 kg" eco="1.800 ECO" tx="0x3a1b47c…f201"/>
            <Tr d="12 / 04 / 2026" m="Cartón" kg="85 kg" eco="850 ECO" tx="0x7f2cb91…ea44" alt/>
            <Tr d="21 / 04 / 2026" m="Vidrio" kg="60 kg" eco="420 ECO" tx="0x9d4ec02…11b8"/>
            <tr style={{ background: GREEN + '10', borderTop: `1.5px solid ${GREEN}` }}>
              <td style={{ padding: '10px 8px', fontSize: 11, fontWeight: 700, color: GREEN }} colSpan="2">Total Abril 2026</td>
              <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: GREEN }}>265 kg</td>
              <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: GREEN }}>3.070 ECO</td>
              <td style={{ padding: '10px 8px', fontSize: 9, color: INK2 }}>3 entregas verificadas</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* SECTION 2 — RESUMEN TOKENS */}
      <Section n="2" title="Resumen de tokens">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, border: `1px solid ${BORDER}` }}>
          <tbody>
            <Lr label="Saldo anterior" value="45.130 ECO"/>
            <Lr label="Tokens acuñados este mes" value="+ 3.070 ECO" pos alt/>
            <Lr label="Canjes realizados este mes" value="− 0 ECO"/>
            <tr style={{ background: AMBER + '15', borderTop: `2px solid ${AMBER}` }}>
              <td style={{ padding: '12px 12px', fontSize: 11, fontWeight: 700, color: AMBER, letterSpacing: 0.2, textTransform: 'uppercase' }}>Saldo disponible actual</td>
              <td style={{ padding: '12px 12px', textAlign: 'right', fontSize: 18, fontWeight: 700, color: AMBER, letterSpacing: -0.3, fontFamily: 'JetBrains Mono, monospace' }}>48.200 ECO</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* SECTION 3 — IMPACTO */}
      <Section n="3" title="Impacto ambiental">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <ImpactBox label="CO₂ evitado · este mes" value="398 kg" color={GREEN}/>
          <ImpactBox label="CO₂ acumulado · 2026" value="1.121 kg" color={GREEN}/>
          <ImpactBox label="Posición en el ranking" value="#2" sub="de 12 organizaciones" color={AMBER}/>
        </div>
      </Section>

      {/* SECTION 4 — VERIFICACIÓN */}
      <Section n="4" title="Verificación on-chain">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 14, border: `1px solid ${BORDER}`, background: '#FAFAF8' }}>
          <ReportQR/>
          <div style={{ flex: 1, fontSize: 10, lineHeight: 1.5, color: INK }}>
            <div style={{ fontSize: 10.5 }}>Todos los registros de este reporte son verificables públicamente en la red blockchain Base Sepolia.</div>
            <div style={{ marginTop: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, color: INK2 }}>
              Data Hash: <span style={{ color: INK }}>0x4f8a2b91c7e0d3f5a8b2c6d9e1f4…9c1e</span>
            </div>
            <div style={{ marginTop: 4, fontSize: 9.5, color: INK2 }}>
              Verificado y emitido por <span style={{ color: INK, fontWeight: 600 }}>Cooperativa 7 de Febrero</span> con MINTER_ROLE · EcoToken V1.0
            </div>
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: INK2, letterSpacing: 0.2 }}>
        <div style={{ maxWidth: 380, lineHeight: 1.5 }}>
          Este reporte acredita el saldo de tokens ECO disponibles para canje de beneficios municipales · <span style={{ color: INK, fontWeight: 600 }}>Municipalidad de Villa María</span>
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 9 }}>
          REP-2026-04-0042<br/>Emitido 01/05/2026 09:14
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, big, mono }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 8.5, color: '#5A5A5A', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: big ? 13 : 11, fontWeight: big ? 700 : 500, marginTop: 1, fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit' }}>{value}</div>
    </div>
  );
}

function Th({ children, w, align }) {
  return <th style={{ padding: '8px 8px', textAlign: align || 'left', fontSize: 9.5, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', width: w }}>{children}</th>;
}

function Tr({ d, m, kg, eco, tx, alt }) {
  return (
    <tr style={{ background: alt ? '#F5F5F2' : '#fff', borderBottom: '1px solid #E6E6E2' }}>
      <td style={{ padding: '9px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>{d}</td>
      <td style={{ padding: '9px 8px', fontWeight: 500 }}>{m}</td>
      <td style={{ padding: '9px 8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>{kg}</td>
      <td style={{ padding: '9px 8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#0F6E56', fontWeight: 600 }}>+ {eco}</td>
      <td style={{ padding: '9px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, color: '#5A5A5A' }}>{tx}</td>
    </tr>
  );
}

function Lr({ label, value, pos, alt }) {
  return (
    <tr style={{ background: alt ? '#F5F5F2' : '#fff', borderBottom: '1px solid #E6E6E2' }}>
      <td style={{ padding: '10px 12px', fontSize: 11 }}>{label}</td>
      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: pos ? '#0F6E56' : '#1A1A1A' }}>{value}</td>
    </tr>
  );
}

function ImpactBox({ label, value, sub, color }) {
  return (
    <div style={{ border: `1px solid #D9D9D5`, padding: 14, background: '#fff' }}>
      <div style={{ fontSize: 9, color: '#5A5A5A', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, letterSpacing: -0.6, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 9.5, color: '#5A5A5A', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ReportQR() {
  return (
    <svg width="78" height="78" viewBox="0 0 56 56">
      <rect x="0" y="0" width="56" height="56" fill="#fff"/>
      {[[3,3],[40,3],[3,40]].map(([x,y],i) => (
        <g key={i}>
          <rect x={x} y={y} width="13" height="13" fill="#0F6E56"/>
          <rect x={x+3} y={y+3} width="7" height="7" fill="#fff"/>
          <rect x={x+5} y={y+5} width="3" height="3" fill="#0F6E56"/>
        </g>
      ))}
      {Array.from({length: 70}).map((_, i) => {
        const cx = 20 + (i % 9) * 3.5;
        const cy = 20 + Math.floor(i / 9) * 3.5;
        if ((cx > 36 && cy < 18) || (cx < 18 && cy > 36) || (cx < 18 && cy < 18)) return null;
        const on = (i * 13 + 7) % 3 !== 0;
        return on ? <rect key={i} x={cx} y={cy} width="2.5" height="2.5" fill="#0F6E56"/> : null;
      })}
    </svg>
  );
}

Object.assign(window, { ActivityReport });
