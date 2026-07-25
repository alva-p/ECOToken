// EcoToken — Página pública de verificación de certificado (/verify/:hash) — E8-HU03
// Dos estados: válido / inválido, via prop status.

function VerifyPage({ status = 'valid' }) {
  const ok = status === 'valid';
  return (
    <div style={{ width: '100%', height: '100%', background: ECO.bg, fontFamily: FONT, color: ECO.ink, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: ECO.surface, borderBottom: `1px solid ${ECO.border}`, padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="assets/logo-ecotoken.png" alt="EcoToken" style={{ height: 32, width: 'auto', display: 'block' }} />
          <div style={{ height: 24, width: 1, background: ECO.border }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: ECO.ink2 }}>Verificación de certificados</div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: ECO.ink3 }}>ecotoken.gob.ar/verify</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: 620 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: ECO.org, textTransform: 'uppercase', letterSpacing: 1 }}>Verificación pública</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, marginTop: 8 }}>Verificá un certificado</div>
            <div style={{ fontSize: 14, color: ECO.ink2, marginTop: 8, lineHeight: 1.5 }}>Escaneaste un QR o tenés un hash — comprobá acá su autenticidad contra la blockchain.</div>
          </div>

          {/* Input de hash */}
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', background: ECO.surface, border: `1px solid ${ECO.borderStrong}`, borderRadius: 9 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ECO.ink2} strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
              <span style={{ fontFamily: MONO, fontSize: 13, letterSpacing: -0.3, color: ECO.ink }}>0x7f3a9b41e8d2c6f0a5b7…2c4d</span>
            </div>
            <SBtn color={ECO.org} style={{ padding: '0 22px', fontSize: 13.5 }}>Verificar</SBtn>
          </div>

          {/* Resultado */}
          {ok ? (
            <div style={{ marginTop: 24, background: ECO.surface, border: `1.5px solid ${ECO.org}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', background: ECO.orgSoft, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: ECO.org, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3, color: '#0A4D3C' }}>Certificado válido</div>
                  <div style={{ fontSize: 12.5, color: ECO.ink2, marginTop: 2 }}>Registrado on-chain · Base Mainnet · bloque #14.882.301</div>
                </div>
                <span style={{ marginLeft: 'auto' }}><TxChip state="confirmada" /></span>
              </div>
              <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                {[
                  ['Organización', 'Supermercado Top S.R.L.'],
                  ['Período', 'Abril 2026'],
                  ['Material reciclado', '412 kg'],
                  ['CO₂ evitado', '461 kg equivalente'],
                  ['Emitido por', 'Municipalidad de Villa María'],
                  ['Verificado por', 'Coop. 7 de Febrero'],
                ].map(([l, v], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: ECO.ink2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
                <SBtn variant="outline" color={ECO.org} style={{ flex: 1, padding: '11px 0' }}>Ver certificado PDF</SBtn>
                <SBtn variant="outline" color={ECO.ink2} style={{ flex: 1, padding: '11px 0' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>Ver transacción en basescan.org
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
                  </span>
                </SBtn>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 24, background: ECO.surface, border: `1.5px solid ${ECO.danger}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', background: '#FBEDEB', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: ECO.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3, color: '#7C271C' }}>Certificado no encontrado</div>
                  <div style={{ fontSize: 12.5, color: ECO.ink2, marginTop: 2 }}>El hash no corresponde a ningún certificado emitido por el programa</div>
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: 13, color: ECO.ink, lineHeight: 1.6 }}>Posibles causas:</div>
                <ul style={{ margin: '10px 0 0', paddingLeft: 20, fontSize: 13, color: ECO.ink2, lineHeight: 1.9 }}>
                  <li>El hash fue copiado de forma incompleta — revisá que tenga 66 caracteres.</li>
                  <li>El certificado fue emitido fuera del programa EcoToken Villa María.</li>
                  <li>El documento que lo muestra podría ser apócrifo.</li>
                </ul>
                <div style={{ marginTop: 18, padding: '13px 16px', background: ECO.bg, borderRadius: 8, fontSize: 12.5, color: ECO.ink2, lineHeight: 1.55 }}>
                  Si creés que se trata de un error, escribinos a <strong style={{ color: ECO.ink }}>ambiente@villamaria.gob.ar</strong> adjuntando el certificado.
                </div>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', fontSize: 12, color: ECO.ink3, marginTop: 24 }}>
            La verificación consulta el contrato público EcoToken (0xE0c0…4F21) en Base Mainnet.
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VerifyPage });
