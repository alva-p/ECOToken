// EcoToken — Versiones mobile (390×812) de auth y panel empresa
// 13m/14m/15m: registro, pendiente, login · 22m/23m/24m: historial, comprobante, mi ranking

// ── Scaffold auth mobile ──────────────────────────────────────
function MAuthShell({ children }) {
  return (
    <Screen>
      <div style={{ background: ECO.surface, borderBottom: `1px solid ${ECO.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="assets/logo-ecotoken.png" alt="EcoToken" style={{ height: 26, width: 'auto', display: 'block' }} />
        <div style={{ height: 20, width: 1, background: ECO.border }} />
        <img src="assets/logo-villa-maria.png" alt="Villa María" style={{ height: 22, display: 'block' }} />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 18px 32px' }}>{children}</div>
    </Screen>
  );
}

function MField({ label, value, placeholder, mono, required, right }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: ECO.ink, marginBottom: 6 }}>
        {label}{required && <span style={{ color: ECO.danger }}> *</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: ECO.surface, border: `1px solid ${ECO.borderStrong}`, borderRadius: 8, fontSize: 14, fontFamily: mono ? MONO : FONT, color: value ? ECO.ink : ECO.ink3, letterSpacing: mono ? -0.3 : 0 }}>
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || placeholder}</span>{right}
      </div>
    </div>
  );
}

// ── 13m · Registro de empresa ─────────────────────────────────
function MRegisterCompany() {
  return (
    <MAuthShell>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: ECO.org, textTransform: 'uppercase', letterSpacing: 1 }}>Adhesión al programa</div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginTop: 6 }}>Registrá tu empresa</div>
        <div style={{ fontSize: 13, color: ECO.ink2, marginTop: 6, lineHeight: 1.5 }}>La Municipalidad revisará la solicitud antes de habilitar la cuenta.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MField label="Razón social" required value="Supermercado Top S.R.L." />
        <MField label="CUIT" required mono value="30-71234567-8" />
        <MField label="Domicilio legal" required value="Bv. España 421, Villa María" />
        <MField label="Representante legal" required value="Marcela Ferreyra" />
        <MField label="Email de contacto" required value="administracion@supertop.com.ar" />
      </div>
      <div style={{ margin: '18px 0' }}>
        <WCheck checked>
          Acepto los <span style={{ color: ECO.org, fontWeight: 600 }}>Términos y Condiciones</span> y la <span style={{ color: ECO.org, fontWeight: 600 }}>Política de Privacidad</span> del programa EcoToken.
        </WCheck>
      </div>
      <Btn color={ECO.org}>Enviar solicitud de registro</Btn>
      <div style={{ textAlign: 'center', fontSize: 13, color: ECO.ink2, marginTop: 16 }}>
        ¿Ya tenés cuenta? <span style={{ color: ECO.org, fontWeight: 600 }}>Iniciar sesión</span>
      </div>
    </MAuthShell>
  );
}

// ── 14m · Registro pendiente ──────────────────────────────────
function MRegisterPending() {
  const steps = [
    { t: 'Solicitud enviada', d: '2 may 2026 · 10:32 hs', state: 'done' },
    { t: 'En revisión por la Municipalidad', d: 'Verificación de CUIT y documentación', state: 'current' },
    { t: 'Alta de cuenta', d: 'Recibirás un email con el acceso', state: 'todo' },
  ];
  return (
    <MAuthShell>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: ECO.coopSoft, margin: '8px auto 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ECO.coop} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        </div>
        <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: -0.4, marginTop: 16 }}>Registro pendiente de aprobación</div>
        <div style={{ fontSize: 13, color: ECO.ink2, marginTop: 8, lineHeight: 1.55 }}>
          Recibimos la solicitud de <strong style={{ color: ECO.ink }}>Supermercado Top S.R.L.</strong> Plazo de revisión: <strong style={{ color: ECO.ink }}>5 días hábiles</strong>.
        </div>
      </div>
      <Card style={{ marginTop: 22 }}>
        {steps.map((s, i) => {
          const color = s.state === 'done' ? ECO.org : s.state === 'current' ? ECO.coop : ECO.ink3;
          return (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: s.state === 'done' ? ECO.org : ECO.surface, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.state === 'done' && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>}
                  {s.state === 'current' && <div style={{ width: 7, height: 7, borderRadius: 4, background: ECO.coop }} />}
                </div>
                {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 26, background: s.state === 'done' ? ECO.org : ECO.border }} />}
              </div>
              <div style={{ paddingBottom: i < steps.length - 1 ? 18 : 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: s.state === 'todo' ? ECO.ink2 : ECO.ink }}>{s.t}</div>
                <div style={{ fontSize: 12, color: ECO.ink2, marginTop: 2 }}>{s.d}</div>
              </div>
            </div>
          );
        })}
      </Card>
      <div style={{ marginTop: 16, padding: '13px 16px', background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 10, fontSize: 12, color: ECO.ink2, lineHeight: 1.5 }}>
        Te enviamos un comprobante a <strong style={{ color: ECO.ink }}>administracion@supertop.com.ar</strong>. Si se rechaza, vas a recibir el motivo para corregir los datos.
      </div>
      <div style={{ marginTop: 18 }}>
        <Btn variant="outline" color={ECO.ink}>Volver al inicio</Btn>
      </div>
    </MAuthShell>
  );
}

// ── 15m · Login multi-rol ─────────────────────────────────────
function MLoginScreen() {
  const roles = [
    { k: 'empresa', label: 'Empresa', color: ECO.org },
    { k: 'coop', label: 'Cooperativa', color: ECO.coop },
    { k: 'muni', label: 'Municipalidad', color: ECO.muni },
  ];
  const active = 0;
  return (
    <MAuthShell>
      <div style={{ textAlign: 'center', margin: '12px 0 24px' }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>Iniciar sesión</div>
        <div style={{ fontSize: 13, color: ECO.ink2, marginTop: 6 }}>Accedé con la cuenta de tu organización</div>
      </div>
      <div style={{ display: 'flex', background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 9, padding: 4, gap: 4, marginBottom: 20 }}>
        {roles.map((r, i) => {
          const on = i === active;
          return (
            <div key={r.k} style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 6, fontSize: 12, fontWeight: on ? 600 : 500, background: on ? r.color + '14' : 'transparent', color: on ? r.color : ECO.ink2, cursor: 'pointer' }}>{r.label}</div>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MField label="Email" value="administracion@supertop.com.ar" />
        <MField label="Contraseña" value="••••••••••" right={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ECO.ink3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
        } />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <WCheck checked>Recordarme</WCheck>
        <span style={{ fontSize: 12.5, color: ECO.org, fontWeight: 600 }}>Olvidé mi contraseña</span>
      </div>
      <div style={{ marginTop: 22 }}>
        <Btn color={ECO.org}>Ingresar</Btn>
      </div>
      <div style={{ textAlign: 'center', fontSize: 13, color: ECO.ink2, marginTop: 18, lineHeight: 1.5 }}>
        ¿Tu empresa todavía no participa?<br /><span style={{ color: ECO.org, fontWeight: 600 }}>Registrala acá</span>
      </div>
    </MAuthShell>
  );
}

// ── 22m · Historial de aportes ────────────────────────────────
const EMP_TABS = [
  { label: 'Resumen', icon: I.home },
  { label: 'Aportes', icon: I.list },
  { label: 'Ranking', icon: I.trophy },
  { label: 'Certificados', icon: I.cert },
];

function MEmpresaHistory() {
  const rows = [
    { id: 'REC-0412', date: '28 abr', mat: 'Cartón', kg: '48,0', eco: 38, c: ECO.org },
    { id: 'REC-0398', date: '24 abr', mat: 'Plástico PET', kg: '32,5', eco: 39, c: '#3D6FB3' },
    { id: 'REC-0371', date: '17 abr', mat: 'Vidrio', kg: '55,0', eco: 33, c: ECO.coop },
    { id: 'REC-0344', date: '10 abr', mat: 'Cartón', kg: '61,2', eco: 49, c: ECO.org },
    { id: 'REC-0322', date: '3 abr', mat: 'Papel', kg: '27,8', eco: 19, c: '#6FA889' },
  ];
  return (
    <Screen>
      <TopBar actor="org" subtitle="Supermercado Top" title="Historial de aportes"
        right={<Pill color={ECO.org}>CSV ↓</Pill>} />
      <Body>
        <div style={{ display: 'flex', gap: 6, overflow: 'auto', paddingBottom: 2 }}>
          {['Todos', 'Cartón', 'PET', 'Vidrio', 'Papel'].map((m, i) => (
            <span key={m} style={{ padding: '8px 14px', borderRadius: 999, fontSize: 12.5, whiteSpace: 'nowrap', fontWeight: i === 0 ? 600 : 500, background: i === 0 ? ECO.org : ECO.surface, color: i === 0 ? '#fff' : ECO.ink2, border: `1px solid ${i === 0 ? ECO.org : ECO.border}` }}>{m}</span>
          ))}
        </div>
        <Card>
          <Row>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ECO.ink2} strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>
              01/03 — 30/04/2026
            </div>
            <div style={{ fontSize: 12, color: ECO.ink2 }}>38 aportes · <strong style={{ color: ECO.org }}>1.050 ECO</strong></div>
          </Row>
        </Card>
        <Card pad={0}>
          {rows.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderBottom: i < rows.length - 1 ? `1px solid ${ECO.border}` : 'none' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: r.c, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.mat} · {r.kg} kg</div>
                <div style={{ fontSize: 11, color: ECO.ink2, marginTop: 2 }}><Hash>{r.id}</Hash> · {r.date} 2026</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: ECO.org }}>+{r.eco}</div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ECO.ink3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </div>
          ))}
        </Card>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {['‹', '1', '2', '3', '›'].map((n, i) => (
            <span key={i} style={{ width: 34, height: 34, borderRadius: 7, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, background: n === '1' ? ECO.org : ECO.surface, color: n === '1' ? '#fff' : ECO.ink2, border: `1px solid ${n === '1' ? ECO.org : ECO.border}` }}>{n}</span>
          ))}
        </div>
      </Body>
      <TabBar actor="org" tabs={EMP_TABS} active={1} />
    </Screen>
  );
}

// ── 23m · Detalle de comprobante ──────────────────────────────
function MEmpresaReceipt() {
  return (
    <Screen>
      <TopBar actor="org" subtitle="Historial de aportes" title="Comprobante REC-0412"
        right={<Pill color={ECO.org}>PDF ↓</Pill>} />
      <Body>
        <Card style={{ borderColor: ECO.org }}>
          <Row>
            <div style={{ fontSize: 11, color: ECO.ink2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Aporte verificado</div>
            <TxChip state="confirmada" />
          </Row>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            {[
              ['Fecha', '28 abr 2026 · 11:47'],
              ['Cooperativa', 'Coop. 7 de Febrero'],
              ['Material', 'Cartón'],
              ['Peso verificado', '48,0 kg'],
              ['Factor', '0.80 ECO/kg · v3'],
              ['Tokens', '+38 ECO'],
            ].map(([l, v], i) => (
              <div key={i}>
                <div style={{ fontSize: 10, color: ECO.ink2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{l}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3, color: l === 'Tokens' ? ECO.org : ECO.ink }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ background: ECO.orgSoft, borderColor: ECO.orgSoft }}>
          <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>Este aporte evitó la emisión de <strong>54 kg de CO₂ equivalente</strong> y suma al ranking de abril 2026.</div>
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Verificación on-chain</div>
          <div style={{ marginTop: 10, padding: '10px 12px', background: ECO.bg, borderRadius: 7, fontFamily: MONO, fontSize: 11.5, letterSpacing: -0.3, wordBreak: 'break-all', color: ECO.ink }}>0x7f3a9b41e8d2c6f0a5b7…88b02c4d</div>
          <Row style={{ marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: ECO.ink2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bloque</div>
              <div style={{ fontFamily: MONO, fontSize: 12.5, marginTop: 3 }}>#14.882.301</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: ECO.ink2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Red</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 3 }}>Base Mainnet</div>
            </div>
          </Row>
          <div style={{ marginTop: 14 }}>
            <Btn variant="outline" color={ECO.org}>Ver en basescan.org ↗</Btn>
          </div>
        </Card>
        <Btn variant="ghost" color={ECO.ink2}>← Volver al historial</Btn>
      </Body>
      <TabBar actor="org" tabs={EMP_TABS} active={1} />
    </Screen>
  );
}

// ── 24m · Mi posición en el ranking ───────────────────────────
function MEmpresaRanking() {
  const months = ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'];
  const myRank = [7, 5, 6, 4, 3, 2];
  const rows = [
    { rank: 1, name: 'Hospital Pasteur', kg: 489, me: false },
    { rank: 2, name: 'Supermercado Top S.R.L.', kg: 412, me: true },
    { rank: 3, name: 'Coop. Puente Verde', kg: 376, me: false },
    { rank: 4, name: 'ONG Reciclar Más', kg: 164, me: false },
    { rank: 5, name: 'Escuela Técnica N°34', kg: 198, me: false },
  ];
  const W = 330, H = 150, P = 26;
  const x = i => P + (i / (myRank.length - 1)) * (W - P * 2);
  const y = r => P + ((r - 1) / 7) * (H - P * 2);
  return (
    <Screen>
      <TopBar actor="org" subtitle="Supermercado Top" title="Mi posición"
        right={<Pill color={ECO.org}>Cat. A</Pill>} />
      <Body>
        <Card style={{ borderColor: ECO.org }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: ECO.org, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>2°</div>
              <div style={{ fontSize: 8, letterSpacing: 0.5, marginTop: 2 }}>DE 47</div>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>Abril 2026</div>
              <div style={{ fontSize: 12, color: ECO.ink2, marginTop: 2 }}>412 kg · 1.050 ECO</div>
              <div style={{ display: 'inline-flex', marginTop: 5, padding: '3px 9px', borderRadius: 999, background: ECO.orgSoft, color: ECO.org, fontSize: 10.5, fontWeight: 600 }}>↑ 1 puesto vs marzo</div>
            </div>
          </div>
        </Card>
        <Card>
          <Row style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Evolución</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['6 meses', '12 meses'].map((p, i) => (
                <span key={p} style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: i === 0 ? 600 : 500, background: i === 0 ? ECO.orgSoft : 'transparent', color: i === 0 ? ECO.org : ECO.ink2 }}>{p}</span>
              ))}
            </div>
          </Row>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
            {[1, 3, 5, 7].map(r => (
              <g key={r}>
                <line x1={P} y1={y(r)} x2={W - P} y2={y(r)} stroke={ECO.border} strokeWidth="1" />
                <text x={P - 7} y={y(r) + 3.5} textAnchor="end" fontSize="9" fill={ECO.ink2} fontFamily="Inter">{r}°</text>
              </g>
            ))}
            <polyline points={myRank.map((r, i) => `${x(i)},${y(r)}`).join(' ')} fill="none" stroke={ECO.org} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {myRank.map((r, i) => (
              <g key={i}>
                <circle cx={x(i)} cy={y(r)} r={i === myRank.length - 1 ? 5.5 : 3} fill={i === myRank.length - 1 ? ECO.org : ECO.surface} stroke={ECO.org} strokeWidth="2" />
                <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill={ECO.ink2} fontFamily="Inter">{months[i]}</text>
              </g>
            ))}
            <text x={x(5)} y={y(2) - 11} textAnchor="middle" fontSize="11" fontWeight="700" fill={ECO.org} fontFamily="Inter">2°</text>
          </svg>
        </Card>
        <Card pad={0}>
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${ECO.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>Categoría A · Abril 2026</div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ECO.ink2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </div>
          {rows.map((r, i) => (
            <div key={r.rank} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < rows.length - 1 ? `1px solid ${ECO.border}` : 'none', background: r.me ? ECO.orgSoft : 'transparent' }}>
              <div style={{ width: 24, fontSize: 13.5, fontWeight: 700, color: r.me ? ECO.org : ECO.ink2, textAlign: 'center' }}>{r.rank}</div>
              <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: r.me ? 700 : 500, color: r.me ? ECO.org : ECO.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                {r.me && <Pill color={ECO.org}>Vos</Pill>}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{r.kg} kg</div>
            </div>
          ))}
          <div style={{ padding: '11px 14px', background: ECO.bg, borderTop: `1px solid ${ECO.border}`, fontSize: 11.5, color: ECO.ink2 }}>
            Te faltan <strong style={{ color: ECO.ink }}>77 kg</strong> para alcanzar el 1° puesto
          </div>
        </Card>
      </Body>
      <TabBar actor="org" tabs={EMP_TABS} active={2} />
    </Screen>
  );
}

Object.assign(window, { MRegisterCompany, MRegisterPending, MLoginScreen, MEmpresaHistory, MEmpresaReceipt, MEmpresaRanking });
