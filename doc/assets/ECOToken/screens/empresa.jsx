// EcoToken — Panel empresa (verde): historial de aportes, detalle comprobante, mi ranking
// WShell actor="org" + EMP_NAV.

// ── E6-HU02 · Historial de aportes ────────────────────────────
function EmpresaHistory() {
  const rows = [
    { id: 'REC-0412', date: '28 abr 2026', coop: 'Coop. 7 de Febrero', mat: 'Cartón', kg: '48,0', eco: 38, tx: 'confirmada', hash: '0x7f3a…2c4d' },
    { id: 'REC-0398', date: '24 abr 2026', coop: 'Coop. 7 de Febrero', mat: 'Plástico PET', kg: '32,5', eco: 39, tx: 'confirmada', hash: '0x2e91…88b0' },
    { id: 'REC-0371', date: '17 abr 2026', coop: 'Coop. 7 de Febrero', mat: 'Vidrio', kg: '55,0', eco: 33, tx: 'confirmada', hash: '0xc4d7…10ef' },
    { id: 'REC-0344', date: '10 abr 2026', coop: 'Coop. Puente Verde', mat: 'Cartón', kg: '61,2', eco: 49, tx: 'confirmada', hash: '0x9a02…b3c1' },
    { id: 'REC-0322', date: '3 abr 2026', coop: 'Coop. 7 de Febrero', mat: 'Papel', kg: '27,8', eco: 19, tx: 'confirmada', hash: '0x11f6…04da' },
    { id: 'REC-0301', date: '28 mar 2026', coop: 'Coop. 7 de Febrero', mat: 'Plástico PET', kg: '44,1', eco: 53, tx: 'confirmada', hash: '0x6b3e…77aa' },
  ];
  const matColor = { 'Cartón': ECO.org, 'Plástico PET': '#3D6FB3', 'Vidrio': ECO.coop, 'Papel': '#6FA889' };
  return (
    <WShell actor="org" nav={EMP_NAV} active={1} who="Supermercado Top S.R.L."
      subtitle="Panel empresa" title="Historial de aportes"
      right={<SBtn variant="outline" color={ECO.org}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5M4 21h16" /></svg>
          Exportar CSV
        </span>
      </SBtn>}>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: ECO.ink2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Desde</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: ECO.surface, border: `1px solid ${ECO.borderStrong}`, borderRadius: 7, fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ECO.ink2} strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>
            01/03/2026
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: ECO.ink2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Hasta</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: ECO.surface, border: `1px solid ${ECO.borderStrong}`, borderRadius: 7, fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ECO.ink2} strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>
            30/04/2026
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: ECO.ink2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Material</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Todos', 'Cartón', 'PET', 'Vidrio', 'Papel'].map((m, i) => (
              <span key={m} style={{ padding: '8px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: i === 0 ? 600 : 500, background: i === 0 ? ECO.org : ECO.surface, color: i === 0 ? '#fff' : ECO.ink2, border: `1px solid ${i === 0 ? ECO.org : ECO.border}`, cursor: 'pointer' }}>{m}</span>
            ))}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 12.5, color: ECO.ink2, paddingBottom: 10 }}>38 aportes en el período · <strong style={{ color: ECO.ink }}>412 kg</strong> · <strong style={{ color: ECO.org }}>1.050 ECO</strong></div>
      </div>

      <WTable
        cols={[
          { label: 'Comprobante', w: 120 },
          { label: 'Fecha', w: 110 },
          { label: 'Cooperativa', w: 180 },
          { label: 'Material', w: 130 },
          { label: 'Peso', w: 90, align: 'right' },
          { label: 'Tokens', w: 90, align: 'right' },
          { label: 'Transacción', w: 200 },
          { label: '', align: 'right' },
        ]}
        rows={rows.map(r => ({ cells: [
          <Addr>{r.id}</Addr>,
          <span style={{ color: ECO.ink2 }}>{r.date}</span>,
          r.coop,
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: matColor[r.mat] }} />{r.mat}</span>,
          <span style={{ fontWeight: 600 }}>{r.kg} kg</span>,
          <span style={{ fontWeight: 600, color: ECO.org }}>+{r.eco}</span>,
          <TxChip state={r.tx} hash={r.hash} />,
          <div style={{ textAlign: 'right' }}><SBtn variant="ghost" color={ECO.org}>Ver detalle →</SBtn></div>,
        ] }))}
        footer={<>
          <span>Mostrando 6 de 38 aportes</span>
          <span style={{ display: 'inline-flex', gap: 6 }}>
            <SBtn variant="outline" color={ECO.ink2}>‹</SBtn>
            {[1, 2, 3].map(n => <SBtn key={n} variant={n === 1 ? 'solid' : 'outline'} color={n === 1 ? ECO.org : ECO.ink2}>{n}</SBtn>)}
            <SBtn variant="outline" color={ECO.ink2}>›</SBtn>
          </span>
        </>}
      />
    </WShell>
  );
}

// ── E5-HU03 · Detalle de comprobante ──────────────────────────
function EmpresaReceipt() {
  return (
    <WShell actor="org" nav={EMP_NAV} active={1} who="Supermercado Top S.R.L."
      subtitle="Panel empresa · Historial de aportes" title="Comprobante REC-0412"
      right={<div style={{ display: 'flex', gap: 8 }}><SBtn variant="outline" color={ECO.ink2}>← Volver</SBtn><SBtn variant="outline" color={ECO.org}>Descargar PDF</SBtn></div>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'start', maxWidth: 1100 }}>
        <div style={{ background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${ECO.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: ECO.ink2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Aporte verificado</div>
              <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.3, marginTop: 3, fontFamily: MONO }}>REC-0412</div>
            </div>
            <TxChip state="confirmada" />
          </div>
          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              ['Fecha y hora', '28 abr 2026 · 11:47 hs'],
              ['Cooperativa', 'Coop. 7 de Febrero'],
              ['Operador', 'Norma Giacosa'],
              ['Punto de retiro', 'Depósito central · Bv. España 421'],
              ['Material', 'Cartón'],
              ['Peso verificado', '48,0 kg'],
              ['Factor aplicado', '0.80 ECO/kg · tabla v3'],
              ['Tokens emitidos', '+38 ECO'],
            ].map(([l, v], i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: ECO.ink2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: l === 'Tokens emitidos' ? ECO.org : ECO.ink }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ margin: '0 24px 24px', padding: '14px 18px', background: ECO.orgSoft, borderRadius: 8, fontSize: 12.5, lineHeight: 1.55 }}>
            Este aporte evitó la emisión de <strong>54 kg de CO₂ equivalente</strong> y suma al ranking de abril 2026.
          </div>
        </div>

        <div style={{ background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 10, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>Verificación on-chain</div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: ECO.ink2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tx hash</div>
              <div style={{ marginTop: 5, padding: '10px 12px', background: ECO.bg, borderRadius: 7, fontFamily: MONO, fontSize: 12, letterSpacing: -0.3, wordBreak: 'break-all' }}>0x7f3a9b41e8d2c6f0a5b7…88b02c4d</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: ECO.ink2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bloque</div>
                <div style={{ fontFamily: MONO, fontSize: 13, marginTop: 4 }}>#14.882.301</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: ECO.ink2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Red</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Base Mainnet</div>
              </div>
            </div>
            <SBtn variant="outline" color={ECO.org} style={{ width: '100%', padding: '11px 0' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                Ver en basescan.org
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
              </span>
            </SBtn>
          </div>
          <div style={{ height: 1, background: ECO.border, margin: '18px 0' }} />
          <div style={{ fontSize: 12, color: ECO.ink2, lineHeight: 1.55 }}>
            El hash certifica de forma inmutable la fecha, el peso y el material del aporte. Cualquier persona puede verificarlo sin necesidad de una cuenta.
          </div>
        </div>
      </div>
    </WShell>
  );
}

// ── E6-HU03 · Mi posición en el ranking ───────────────────────
function EmpresaRanking() {
  const months = ['Nov 25', 'Dic 25', 'Ene 26', 'Feb 26', 'Mar 26', 'Abr 26'];
  const myRank = [7, 5, 6, 4, 3, 2];
  const rows = [
    { rank: 1, name: 'Hospital Pasteur', kg: 489, eco: 1250, me: false },
    { rank: 2, name: 'Supermercado Top S.R.L.', kg: 412, eco: 1050, me: true },
    { rank: 3, name: 'Coop. Puente Verde', kg: 376, eco: 980, me: false },
    { rank: 4, name: 'ONG Reciclar Más', kg: 164, eco: 690, me: false },
    { rank: 5, name: 'Escuela Técnica N°34', kg: 198, eco: 820, me: false },
  ];
  const W = 560, H = 180, P = 30;
  const x = i => P + (i / (myRank.length - 1)) * (W - P * 2);
  const y = r => P + ((r - 1) / 7) * (H - P * 2);
  return (
    <WShell actor="org" nav={EMP_NAV} active={2} who="Supermercado Top S.R.L."
      subtitle="Panel empresa" title="Mi posición en el ranking"
      right={<Pill color={ECO.org}>Categoría A</Pill>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16, alignItems: 'start' }}>
        {/* Posición actual + evolución */}
        <div style={{ background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 10, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: ECO.org, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>2°</div>
              <div style={{ fontSize: 9, letterSpacing: 0.5, marginTop: 2 }}>DE 47</div>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>Abril 2026</div>
              <div style={{ fontSize: 12.5, color: ECO.ink2, marginTop: 3 }}>412 kg reciclados · 1.050 ECO</div>
              <div style={{ display: 'inline-flex', marginTop: 6, padding: '3px 10px', borderRadius: 999, background: ECO.orgSoft, color: ECO.org, fontSize: 11, fontWeight: 600 }}>↑ 1 puesto vs marzo</div>
            </div>
          </div>
          <div style={{ height: 1, background: ECO.border, margin: '20px 0 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Evolución · últimos 6 meses</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['6 meses', '12 meses'].map((p, i) => (
                <span key={p} style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: i === 0 ? 600 : 500, background: i === 0 ? ECO.orgSoft : 'transparent', color: i === 0 ? ECO.org : ECO.ink2, cursor: 'pointer' }}>{p}</span>
              ))}
            </div>
          </div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
            {[1, 3, 5, 7].map(r => (
              <g key={r}>
                <line x1={P} y1={y(r)} x2={W - P} y2={y(r)} stroke={ECO.border} strokeWidth="1" />
                <text x={P - 8} y={y(r) + 4} textAnchor="end" fontSize="10" fill={ECO.ink2} fontFamily="Inter">{r}°</text>
              </g>
            ))}
            <polyline points={myRank.map((r, i) => `${x(i)},${y(r)}`).join(' ')} fill="none" stroke={ECO.org} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {myRank.map((r, i) => (
              <g key={i}>
                <circle cx={x(i)} cy={y(r)} r={i === myRank.length - 1 ? 6 : 3.5} fill={i === myRank.length - 1 ? ECO.org : ECO.surface} stroke={ECO.org} strokeWidth="2" />
                <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill={ECO.ink2} fontFamily="Inter">{months[i]}</text>
              </g>
            ))}
            <text x={x(5)} y={y(2) - 14} textAnchor="middle" fontSize="12" fontWeight="700" fill={ECO.org} fontFamily="Inter">2°</text>
          </svg>
        </div>

        {/* Tabla con fila propia destacada */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Ranking · Categoría A · Abril 2026</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: ECO.surface, border: `1px solid ${ECO.borderStrong}`, borderRadius: 7, fontSize: 12.5, fontWeight: 600 }}>
              Abril 2026
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ECO.ink2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </div>
          </div>
          <WTable
            cols={[
              { label: 'Pos.', w: 60 },
              { label: 'Organización' },
              { label: 'Kg', w: 90, align: 'right' },
              { label: 'ECO', w: 90, align: 'right' },
            ]}
            rows={rows.map(r => ({ __hl: r.me, cells: [
              <span style={{ fontWeight: 700, color: r.me ? ECO.org : ECO.ink2 }}>{r.rank}</span>,
              <span style={{ fontWeight: r.me ? 700 : 500, color: r.me ? ECO.org : ECO.ink, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {r.name}{r.me && <Pill color={ECO.org}>Vos</Pill>}
              </span>,
              <span style={{ fontWeight: 600 }}>{r.kg}</span>,
              <span style={{ fontWeight: 600, color: r.me ? ECO.org : ECO.ink }}>{r.eco.toLocaleString('es-AR')}</span>,
            ] }))}
            footer={<><span>Top 5 de 12 organizaciones en Categoría A</span><span>Te faltan <strong style={{ color: ECO.ink }}>77 kg</strong> para alcanzar el 1° puesto</span></>}
          />
        </div>
      </div>
    </WShell>
  );
}

Object.assign(window, { EmpresaHistory, EmpresaReceipt, EmpresaRanking });
