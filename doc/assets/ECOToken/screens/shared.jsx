// Shared primitives for EcoToken screens
// Flat institutional style — white surfaces, hairline borders, no shadows.

const ECO = {
  ink: '#0F1115',
  ink2: '#6B7076',
  ink3: '#B5B8BC',
  bg: '#F7F7F5',
  surface: '#FFFFFF',
  border: '#E6E7E9',
  borderStrong: '#D7D9DC',
  org: '#1D9E75',
  orgSoft: '#E8F5EF',
  coop: '#BA7517',
  coopSoft: '#FAF1E4',
  muni: '#534AB7',
  muniSoft: '#ECEAF7',
  danger: '#B43A2C',
};

const FONT = `'Inter', -apple-system, system-ui, sans-serif`;
const MONO = `'JetBrains Mono', ui-monospace, Menlo, monospace`;

// ── Screen scaffold ───────────────────────────────────────────────
function Screen({ children, bg = ECO.bg }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: bg,
      fontFamily: FONT, color: ECO.ink, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>{children}</div>
  );
}

// Top header — actor color band as a thin top stripe + title
function TopBar({ actor = 'org', title, subtitle, right }) {
  const color = ECO[actor];
  return (
    <div style={{ background: ECO.surface, borderBottom: `1px solid ${ECO.border}` }}>
      <div style={{ height: 3, background: color }} />
      <div style={{ padding: '14px 18px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          {subtitle && <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color }}>{subtitle}</div>}
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.2, lineHeight: 1.15, marginTop: 2 }}>{title}</div>
        </div>
        {right && <div>{right}</div>}
      </div>
    </div>
  );
}

function Body({ children, pad = 16 }) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: pad, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {children}
    </div>
  );
}

function Card({ children, style = {}, pad = 14 }) {
  return (
    <div style={{
      background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 10,
      padding: pad, ...style,
    }}>{children}</div>
  );
}

function Row({ children, justify = 'space-between', align = 'center', gap = 12, style = {} }) {
  return <div style={{ display: 'flex', justifyContent: justify, alignItems: align, gap, ...style }}>{children}</div>;
}

function Stat({ label, value, sub, accent }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: ECO.ink2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, color: accent || ECO.ink, letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: ECO.ink2, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Pill({ children, color, soft = true, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
      padding: '4px 8px', borderRadius: 4,
      background: soft ? color + '1A' : color, color: soft ? color : '#fff',
      ...style,
    }}>{children}</span>
  );
}

function Btn({ children, color = ECO.ink, variant = 'solid', disabled, onClick, style = {} }) {
  const styles = {
    solid: { background: disabled ? ECO.border : color, color: disabled ? ECO.ink3 : '#fff', border: '1px solid transparent' },
    outline: { background: ECO.surface, color: disabled ? ECO.ink3 : color, border: `1px solid ${disabled ? ECO.border : color}` },
    ghost: { background: 'transparent', color: disabled ? ECO.ink3 : color, border: '1px solid transparent' },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '13px 14px', fontFamily: FONT, fontSize: 14, fontWeight: 600,
      borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', letterSpacing: -0.1,
      ...styles, ...style,
    }}>{children}</button>
  );
}

// Bottom tab bar (3 tabs per actor)
function TabBar({ actor = 'org', tabs, active }) {
  const color = ECO[actor];
  return (
    <div style={{
      borderTop: `1px solid ${ECO.border}`, background: ECO.surface,
      display: 'flex', padding: '8px 0 22px',
    }}>
      {tabs.map((t, i) => {
        const on = i === active;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 0' }}>
            <div style={{ width: 22, height: 22, color: on ? color : ECO.ink3 }}>{t.icon}</div>
            <div style={{ fontSize: 10, fontWeight: on ? 600 : 500, color: on ? color : ECO.ink2, letterSpacing: 0.1 }}>{t.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// Mono-ish identifier chip
function Hash({ children, style = {} }) {
  return <span style={{ fontFamily: MONO, fontSize: 11, color: ECO.ink2, letterSpacing: -0.3, ...style }}>{children}</span>;
}

// Simple line for list separators inside a card
function Sep() { return <div style={{ height: 1, background: ECO.border, margin: '10px -14px' }} />; }

// SVG icons (24×24 stroke 1.5) — minimal flat
const I = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>,
  swap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h13M14 4l3 3-3 3M20 17H7M10 14l-3 3 3 3"/></svg>,
  cert: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="14" rx="1"/><path d="M8 9h8M8 13h5"/><circle cx="16" cy="18" r="2"/><path d="M14.5 19.5L13 22l3-1 3 1-1.5-2.5"/></svg>,
  scale: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16M4 8h16M7 8l-3 7a3 3 0 0 0 6 0zM17 8l-3 7a3 3 0 0 0 6 0z"/></svg>,
  list: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0zM6 6H4v2a3 3 0 0 0 3 3M18 6h2v2a3 3 0 0 1-3 3M9 14v2h6v-2M8 20h8"/></svg>,
  gift: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 13h18M12 9v11M8 9a2.5 2.5 0 1 1 4-2.5A2.5 2.5 0 1 1 16 9z"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>,
};

Object.assign(window, { ECO, FONT, MONO, Screen, TopBar, Body, Card, Row, Stat, Pill, Btn, TabBar, Hash, Sep, I });
