// EcoToken — Certificado mensual de impacto ambiental (A4 horizontal)
// Documento emocional, para compartir en redes / imprimir / mostrar.

function Certificate() {
  const W = 1123,H = 794; // A4 landscape @ 96dpi (297×210mm)
  const GREEN = '#0F6E56';
  const AMBER = '#BA7517';
  const INK = '#1A1A1A';
  const INK2 = '#5A5A5A';

  return (
    <div style={{
      width: W, height: H, background: '#FFFFFF',
      fontFamily: `'Inter', system-ui, sans-serif`, color: INK,
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Borde decorativo */}
      <div style={{ position: 'absolute', inset: 18, border: `1.5px solid ${GREEN}` }} />
      <div style={{ position: 'absolute', inset: 24, border: `0.5px solid ${GREEN}` }} />

      {/* Esquinas decorativas */}
      {[[24, 24], [W - 24, 24], [24, H - 24], [W - 24, H - 24]].map((p, i) =>
      <svg key={i} width="14" height="14" style={{
        position: 'absolute',
        left: p[0] - 7, top: p[1] - 7
      }}>
          <rect x="5" y="5" width="4" height="4" fill={GREEN} />
        </svg>
      )}

      <div style={{ position: 'absolute', inset: 50, display: 'flex', flexDirection: 'column' }}>

        {/* HEADER · 3 logos */}
        <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 18, borderBottom: `0.5px solid ${GREEN}55` }}>
          {/* EcoToken */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <img src="assets/logo-ecotoken.png?v=2" alt="EcoToken" style={{ height: 56, width: 'auto', display: 'block' }} />
          </div>

          {/* Municipalidad — logo institucional (centrado) */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="assets/logo-villa-maria.png" alt="Villa María Ciudad Abierta" style={{ height: 52, display: 'block', width: "174px" }} />
          </div>

          {/* Cooperativa 7 de Febrero — logo */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
            <img src="assets/logo-cooperativa.jpg" alt="Cooperativa 7 de Febrero" style={{ height: 52, width: 52, display: 'block', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.2 }}>Cooperativa</div>
              <div style={{ fontSize: 10, color: INK2, marginTop: 1 }}>7 de Febrero · Villa María</div>
            </div>
          </div>
        </div>

        {/* TITLE */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <div style={{ fontSize: 11, color: AMBER, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600 }}>Otorga el presente</div>
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1, marginTop: 8, color: GREEN }}>Certificado de Impacto Ambiental</div>
          <div style={{ fontSize: 13, color: INK2, marginTop: 6, letterSpacing: 0.5 }}>Abril 2026 · Villa María, Córdoba</div>
        </div>

        {/* CENTRAL TEXT */}
        <div style={{ margin: '36px auto 0', maxWidth: 820, textAlign: 'center' }}>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: INK, margin: 0, textWrap: 'pretty' }}>
            La Municipalidad de Villa María y la Cooperativa 7 de Febrero certifican que{' '}
            <span style={{ fontWeight: 700, color: GREEN }}>Organización X</span>{' '}
            colaboró activamente con el cuidado del medio ambiente durante el mes de abril de 2026,
            reciclando <strong>265 kg</strong> de materiales y evitando la emisión de{' '}
            <strong>398 kg de CO₂ equivalente</strong> a la atmósfera.
          </p>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: 24, marginTop: 38 }}>
          <MaterialIcon kind="plastico" kg="120 kg" label="Plástico PET" color={GREEN} />
          <MaterialIcon kind="carton" kg="85 kg" label="Cartón" color={GREEN} />
          <MaterialIcon kind="vidrio" kg="60 kg" label="Vidrio" color={GREEN} />

          <div style={{ width: 1, background: GREEN + '33', margin: '8px 4px' }} />

          {/* Big metric */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 200 }}>
            <div style={{ fontSize: 10, color: AMBER, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>CO₂ evitado</div>
            <div style={{ fontSize: 48, fontWeight: 700, color: GREEN, letterSpacing: -2, lineHeight: 1, marginTop: 4 }}>398 kg</div>
            <div style={{ fontSize: 11, color: INK2, marginTop: 4 }}>equivalente atmosférico</div>
          </div>
        </div>

        {/* RANKING */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <div style={{ display: 'inline-flex', gap: 10, border: `1px solid ${AMBER}`, borderRadius: 4, background: '#FAF1E4', alignItems: "center", height: "30px", fontWeight: "600", padding: "8px 16px"
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0zM6 6H4v2a3 3 0 0 0 3 3M18 6h2v2a3 3 0 0 1-3 3M9 14v2h6v-2M8 20h8" /></svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: AMBER, letterSpacing: 0.3, textAlign: "center", whiteSpace: "nowrap" }}>
              Posición #2 de 12 organizaciones · Abril 2026
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          {/* Firma izquierda */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: 32, borderBottom: `0.8px solid ${INK}`, marginBottom: 6 }} />
            <div style={{ fontSize: 11, fontWeight: 600 }}>Municipalidad de Villa María</div>
            <div style={{ fontSize: 9, color: INK2, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 2 }}>Intendente de la ciudad</div>
          </div>

          {/* Sello + QR */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '0 18px' }}>
            <CertQR />
            <div style={{ fontSize: 9, color: INK2, textAlign: 'center', lineHeight: 1.3 }}>
              Verificá en <span style={{ fontFamily: 'JetBrains Mono, monospace', color: INK }}>basescan.org</span>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: INK2, marginTop: 2 }}>
              TX: 0x7f3a9b…2c4d
            </div>
          </div>

          {/* Sello verificado */}
          <div style={{ position: 'relative', width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="130" height="130" viewBox="0 0 130 130" style={{ position: 'absolute' }}>
              <circle cx="65" cy="65" r="60" fill="none" stroke={GREEN} strokeWidth="1.5" />
              <circle cx="65" cy="65" r="52" fill="none" stroke={GREEN} strokeWidth="0.6" />
              {Array.from({ length: 32 }).map((_, i) => {
                const a = i / 32 * Math.PI * 2;
                return <line key={i} x1={65 + Math.cos(a) * 52} y1={65 + Math.sin(a) * 52} x2={65 + Math.cos(a) * 55} y2={65 + Math.sin(a) * 55} stroke={GREEN} strokeWidth="0.8" />;
              })}
              <defs>
                <path id="cArc" d="M 25 65 A 40 40 0 0 1 105 65" fill="none" />
                <path id="cArc2" d="M 25 65 A 40 40 0 0 0 105 65" fill="none" />
              </defs>
              <text fill={GREEN} fontSize="8" fontWeight="600" letterSpacing="2.5" fontFamily="Inter">
                <textPath href="#cArc" startOffset="50%" textAnchor="middle">VERIFICADO ON-CHAIN</textPath>
              </text>
              <text fill={GREEN} fontSize="7" letterSpacing="2" fontFamily="Inter">
                <textPath href="#cArc2" startOffset="50%" textAnchor="middle">COOP. 7 DE FEBRERO</textPath>
              </text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
              <div style={{ fontSize: 14, fontWeight: 700, color: GREEN, letterSpacing: -0.3 }}>Abril</div>
              <div style={{ fontSize: 9, color: GREEN, letterSpacing: 1, fontWeight: 600 }}>2026</div>
            </div>
          </div>

          {/* Firma derecha */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: 32, borderBottom: `0.8px solid ${INK}`, marginBottom: 6 }} />
            <div style={{ fontSize: 11, fontWeight: 600 }}>Cooperativa 7 de Febrero</div>
            <div style={{ fontSize: 9, color: INK2, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 2 }}>Recolección y verificación</div>
          </div>
        </div>
      </div>
    </div>);

}

function MaterialIcon({ kind, kg, label, color }) {
  const Icon = {
    plastico: <svg width="36" height="44" viewBox="0 0 36 44" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round">
      <path d="M13 4 h10 v3 h-10 z" />
      <path d="M11 7 h14 l-1 32 a3 3 0 0 1 -3 3 h-6 a3 3 0 0 1 -3 -3 z" />
      <path d="M14 14 h8 M14 22 h8 M14 30 h8" strokeWidth="0.8" />
    </svg>,
    carton: <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round">
      <path d="M5 12 l15 -7 l15 7 v22 l-15 7 l-15 -7 z" />
      <path d="M5 12 l15 7 l15 -7" />
      <path d="M20 19 v22" />
      <path d="M12 8.5 l15 7" strokeDasharray="2 2" />
    </svg>,
    vidrio: <svg width="32" height="44" viewBox="0 0 32 44" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round">
      <path d="M13 3 h6 v8 l4 5 v22 a3 3 0 0 1 -3 3 h-8 a3 3 0 0 1 -3 -3 v-22 l4 -5 z" />
      <path d="M9 22 h14" />
    </svg>
  }[kind];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 90 }}>
      <div style={{ height: 48, display: 'flex', alignItems: 'center' }}>{Icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color, letterSpacing: -0.4 }}>{kg}</div>
      <div style={{ fontSize: 10, color: '#5A5A5A', letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 500 }}>{label}</div>
    </div>);

}

function CertQR() {
  return (
    <svg width="64" height="64" viewBox="0 0 56 56">
      <rect x="0" y="0" width="56" height="56" fill="#fff" stroke="#0F6E56" strokeWidth="0.5" />
      {[[3, 3], [40, 3], [3, 40]].map(([x, y], i) =>
      <g key={i}>
          <rect x={x} y={y} width="13" height="13" fill="#0F6E56" />
          <rect x={x + 3} y={y + 3} width="7" height="7" fill="#fff" />
          <rect x={x + 5} y={y + 5} width="3" height="3" fill="#0F6E56" />
        </g>
      )}
      {Array.from({ length: 70 }).map((_, i) => {
        const cx = 20 + i % 9 * 3.5;
        const cy = 20 + Math.floor(i / 9) * 3.5;
        if (cx > 36 && cy < 18 || cx < 18 && cy > 36 || cx < 18 && cy < 18) return null;
        const on = (i * 11 + 5) % 3 !== 0;
        return on ? <rect key={i} x={cx} y={cy} width="2.5" height="2.5" fill="#0F6E56" /> : null;
      })}
    </svg>);

}

Object.assign(window, { Certificate });