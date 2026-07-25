// EcoToken — scaffold compartido para paneles web (admin municipal / empresa)
// Reutiliza paleta ECO, FONT, MONO, Pill de shared.jsx

const ADMIN_NAV = [
  { label: 'Empresas', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V8h7V3h4v5h7v13" /><path d="M9 21v-6h6v6" /><path d="M3 21h18" /></svg> },
  { label: 'Cooperativas', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><circle cx="16.5" cy="9.5" r="2.5" /><path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5" /><path d="M14.8 14.4c2 .3 3.6 1.9 4.1 4.1" /></svg> },
  { label: 'Conversión', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16M4 8h16M7 8l-3 7a3 3 0 0 0 6 0zM17 8l-3 7a3 3 0 0 0 6 0z" /></svg> },
  { label: 'Roles', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="15" r="4.2" /><path d="M11 12L20 3M16 7l3 3M13 10l2 2" /></svg> },
  { label: 'Contrato', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" /><path d="M10 12h4M12 10v4" /></svg> },
];

const EMP_NAV = [
  { label: 'Resumen', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg> },
  { label: 'Aportes', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg> },
  { label: 'Ranking', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0zM6 6H4v2a3 3 0 0 0 3 3M18 6h2v2a3 3 0 0 1-3 3M9 14v2h6v-2M8 20h8" /></svg> },
  { label: 'Certificados', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="14" rx="1" /><path d="M8 9h8M8 13h5" /><circle cx="16" cy="18" r="2" /><path d="M14.5 19.5L13 22l3-1 3 1-1.5-2.5" /></svg> },
];

function WShell({ actor = 'muni', nav, active = 0, title, subtitle, right, children, overlay, who }) {
  const color = ECO[actor];
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: ECO.bg, fontFamily: FONT, color: ECO.ink, position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: 220, background: '#14181C', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 18px', borderBottom: '1px solid #23282E' }}>
          <img src="assets/logo-ecotoken.png" alt="EcoToken" style={{ height: 30, width: 'auto', display: 'block', filter: 'brightness(1.15)' }} />
        </div>
        <div style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map((n, i) => {
            const on = i === active;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: on ? color : 'transparent', color: on ? '#fff' : '#9AA1A8', fontSize: 13, fontWeight: on ? 600 : 500, cursor: 'pointer' }}>
                <span style={{ width: 18, height: 18, display: 'inline-flex' }}>{n.icon}</span>{n.label}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 'auto', padding: '16px 18px', borderTop: '1px solid #23282E' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#C9CDD2' }}>{who || 'Municipalidad de Villa María'}</div>
          <div style={{ fontSize: 11, color: '#7A8188', marginTop: 2 }}>{actor === 'muni' ? 'Administrador' : 'Cuenta empresa'}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ background: ECO.surface, borderBottom: `1px solid ${ECO.border}` }}>
          <div style={{ height: 3, background: color }} />
          <div style={{ padding: '16px 28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
            <div>
              {subtitle && <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color }}>{subtitle}</div>}
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3, marginTop: 2 }}>{title}</div>
            </div>
            {right}
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
      </div>
      {overlay}
    </div>
  );
}

function WTable({ cols, rows, footer }) {
  const cell = (c) => ({ width: c.w, flex: c.w ? 'none' : 1, textAlign: c.align || 'left', paddingRight: 12, minWidth: 0 });
  return (
    <div style={{ background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', padding: '12px 18px', background: ECO.bg, borderBottom: `1px solid ${ECO.border}` }}>
        {cols.map((c, i) => <div key={i} style={{ ...cell(c), fontSize: 11, fontWeight: 600, color: ECO.ink2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{c.label}</div>)}
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '13px 18px', borderBottom: i < rows.length - 1 ? `1px solid ${ECO.border}` : 'none', fontSize: 13, background: r.__hl ? ECO.orgSoft : 'transparent' }}>
          {r.cells.map((v, j) => <div key={j} style={cell(cols[j])}>{v}</div>)}
        </div>
      ))}
      {footer && <div style={{ padding: '12px 18px', background: ECO.bg, borderTop: `1px solid ${ECO.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: ECO.ink2 }}>{footer}</div>}
    </div>
  );
}

function SBtn({ children, color = ECO.ink, variant = 'solid', style = {} }) {
  const v = {
    solid: { background: color, color: '#fff', border: '1px solid transparent' },
    outline: { background: ECO.surface, color, border: `1px solid ${color}55` },
    ghost: { background: 'transparent', color, border: '1px solid transparent' },
  }[variant];
  return <button style={{ padding: '8px 14px', borderRadius: 7, fontFamily: FONT, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', letterSpacing: -0.1, ...v, ...style }}>{children}</button>;
}

function WField({ label, value, placeholder, mono, required, area, half, right }) {
  return (
    <div style={{ flex: half ? '0 0 calc(50% - 8px)' : '1 1 100%' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: ECO.ink, marginBottom: 6 }}>
        {label}{required && <span style={{ color: ECO.danger }}> *</span>}
      </div>
      <div style={{ display: 'flex', alignItems: area ? 'flex-start' : 'center', gap: 8, padding: area ? '12px 14px' : '11px 14px', minHeight: area ? 84 : 'auto', background: ECO.surface, border: `1px solid ${ECO.borderStrong}`, borderRadius: 8, fontSize: 13.5, fontFamily: mono ? MONO : FONT, color: value ? ECO.ink : ECO.ink3, letterSpacing: mono ? -0.3 : 0 }}>
        <span style={{ flex: 1 }}>{value || placeholder}</span>{right}
      </div>
    </div>
  );
}

function WCheck({ checked, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1, background: checked ? ECO.org : ECO.surface, border: `1.5px solid ${checked ? ECO.org : ECO.borderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {checked && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>}
      </div>
      <div style={{ fontSize: 12.5, color: ECO.ink2, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function WModal({ title, sub, children, confirmLabel, cancelLabel = 'Cancelar', danger, color = ECO.muni, width = 460 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,17,21,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, fontFamily: FONT }}>
      <div style={{ width, background: ECO.surface, borderRadius: 14, padding: 26, boxShadow: '0 18px 50px rgba(0,0,0,0.25)' }}>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3, color: ECO.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: ECO.ink2, marginTop: 6, lineHeight: 1.5 }}>{sub}</div>}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <SBtn variant="outline" color={ECO.ink2}>{cancelLabel}</SBtn>
          <SBtn color={danger ? ECO.danger : color}>{confirmLabel}</SBtn>
        </div>
      </div>
    </div>
  );
}

function TxChip({ state, hash }) {
  const map = {
    confirmada: { c: ECO.org, label: 'Confirmada', icon: '✓' },
    pendiente: { c: ECO.coop, label: 'Pendiente', icon: '◌' },
    fallida: { c: ECO.danger, label: 'Fallida', icon: '✕' },
  }[state];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: map.c + '14', color: map.c, fontSize: 11, fontWeight: 600 }}>
      <span>{map.icon}</span>{map.label}{hash && <span style={{ fontFamily: MONO, fontWeight: 400, color: ECO.ink2, letterSpacing: -0.3 }}>{hash}</span>}
    </span>
  );
}

function Addr({ children }) {
  return <span style={{ fontFamily: MONO, fontSize: 12, color: ECO.ink, letterSpacing: -0.3 }}>{children}</span>;
}

Object.assign(window, { ADMIN_NAV, EMP_NAV, WShell, WTable, SBtn, WField, WCheck, WModal, TxChip, Addr });
