// EcoToken — Panel admin municipal (violeta): aprobaciones, alta coop, conversión, roles, pausa
// Todas usan WShell actor="muni" + ADMIN_NAV.

// ── E3-HU04 · Aprobación de empresas ──────────────────────────
function AdminApprovals({ modal }) {
  const rows = [
    { name: 'Supermercado Top S.R.L.', cuit: '30-71234567-8', rep: 'Marcela Ferreyra', date: '2 may 2026', mail: 'administracion@supertop.com.ar' },
    { name: 'Ferretería Industrial VM', cuit: '30-65887421-3', rep: 'Raúl Domínguez', date: '30 abr 2026', mail: 'info@ferrevm.com.ar' },
    { name: 'Clínica Regional del Sur', cuit: '30-70998812-5', rep: 'Dra. Inés Balmaceda', date: '29 abr 2026', mail: 'gerencia@clinicasur.ar' },
    { name: 'Textil Andino S.A.', cuit: '30-68112907-1', rep: 'Jorge Kaplan', date: '27 abr 2026', mail: 'jkaplan@textilandino.com' },
  ];
  return (
    <WShell actor="muni" nav={ADMIN_NAV} active={0}
      subtitle="Panel de administración" title="Aprobación de empresas"
      right={<Pill color={ECO.muni}>4 pendientes</Pill>}
      overlay={modal && (
        <WModal title="Aprobar empresa" confirmLabel="Aprobar y dar de alta" color={ECO.org}
          sub={<span>Vas a habilitar la cuenta de <strong>Supermercado Top S.R.L.</strong> (CUIT 30-71234567-8). Se enviará el acceso a administracion@supertop.com.ar.</span>}>
          <div style={{ padding: '12px 16px', background: ECO.orgSoft, borderRadius: 8, fontSize: 12.5, color: ECO.ink, lineHeight: 1.5 }}>
            La empresa quedará en <strong>Categoría C · Pequeños generadores</strong> hasta el primer cierre de mes, cuando se recalcula según volumen.
          </div>
        </WModal>
      )}>
      <div style={{ display: 'flex', gap: 4, padding: 4, background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 8, alignSelf: 'flex-start' }}>
        {['Pendientes · 4', 'Aprobadas · 47', 'Rechazadas · 3'].map((t, i) => (
          <div key={i} style={{ padding: '8px 16px', borderRadius: 6, fontSize: 13, whiteSpace: 'nowrap', fontWeight: i === 0 ? 600 : 500, background: i === 0 ? ECO.muniSoft : 'transparent', color: i === 0 ? ECO.muni : ECO.ink2, cursor: 'pointer' }}>{t}</div>
        ))}
      </div>
      <WTable
        cols={[
          { label: 'Empresa', w: 280 },
          { label: 'CUIT', w: 150 },
          { label: 'Representante', w: 170 },
          { label: 'Solicitud', w: 110 },
          { label: 'Email' },
          { label: 'Acciones', w: 210, align: 'right' },
        ]}
        rows={rows.map(r => ({ cells: [
          <span style={{ fontWeight: 600 }}>{r.name}</span>,
          <Addr>{r.cuit}</Addr>,
          r.rep,
          <span style={{ color: ECO.ink2 }}>{r.date}</span>,
          <span style={{ color: ECO.ink2, fontSize: 12.5 }}>{r.mail}</span>,
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <SBtn variant="outline" color={ECO.danger}>Rechazar</SBtn>
            <SBtn color={ECO.org}>Aprobar</SBtn>
          </div>,
        ] }))}
        footer={<><span>4 solicitudes pendientes de revisión</span><span>Plazo máximo de respuesta: 5 días hábiles</span></>}
      />
    </WShell>
  );
}

// ── E4-HU01 · Alta de cooperativa + VALIDATOR_ROLE ────────────
function AdminCoopCreate() {
  const steps = [
    { t: 'Cuenta creada', d: 'coop.7defebrero@ecotoken.gob.ar', state: 'done' },
    { t: 'Wallet generada', d: '0x4B8f…9aE2 · custodia municipal', state: 'done' },
    { t: 'Otorgando VALIDATOR_ROLE on-chain', d: 'TX 0x91c3…77b1 · esperando confirmación', state: 'current' },
    { t: 'Cooperativa habilitada para registrar pesajes', d: '', state: 'todo' },
  ];
  return (
    <WShell actor="muni" nav={ADMIN_NAV} active={1}
      subtitle="Panel de administración" title="Alta de cooperativa">
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 10, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2, marginBottom: 18 }}>Datos de la cooperativa</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <WField label="Nombre" required value="Cooperativa 7 de Febrero" />
            <WField label="CUIT" required mono value="30-70765432-1" half />
            <WField label="Matrícula INAES" mono value="MAT-45.821" half />
            <WField label="Domicilio" value="Ruta 9 km 552, Villa María" />
            <WField label="Responsable operativo" value="Norma Giacosa" half />
            <WField label="Email de acceso" required value="coop.7defebrero@ecotoken.gob.ar" half />
          </div>
          <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
            <SBtn variant="outline" color={ECO.ink2} style={{ padding: '11px 18px' }}>Cancelar</SBtn>
            <SBtn color={ECO.muni} style={{ padding: '11px 18px', flex: 1 }}>Crear cuenta y otorgar rol validador</SBtn>
          </div>
        </div>

        <div style={{ background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 10, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>Progreso del alta</div>
            <TxChip state="pendiente" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map((s, i) => {
              const color = s.state === 'done' ? ECO.org : s.state === 'current' ? ECO.coop : ECO.ink3;
              return (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: s.state === 'done' ? ECO.org : ECO.surface, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.state === 'done' && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>}
                      {s.state === 'current' && <div style={{ width: 7, height: 7, borderRadius: 4, background: ECO.coop }} />}
                    </div>
                    {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 24, background: s.state === 'done' ? ECO.org : ECO.border }} />}
                  </div>
                  <div style={{ paddingBottom: i < steps.length - 1 ? 16 : 0, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: s.state === 'todo' ? ECO.ink2 : ECO.ink }}>{s.t}</div>
                    {s.d && <div style={{ fontSize: 11.5, color: ECO.ink2, marginTop: 2, fontFamily: s.d.startsWith('0x') || s.d.startsWith('TX') ? MONO : FONT, letterSpacing: s.d.startsWith('TX') ? -0.3 : 0 }}>{s.d}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 18, padding: '12px 14px', background: ECO.coopSoft, borderRadius: 8, fontSize: 12, color: ECO.ink, lineHeight: 1.5 }}>
            El <strong>VALIDATOR_ROLE</strong> permite a la cooperativa registrar pesajes que emiten tokens. La transacción suele confirmar en menos de 1 minuto.
          </div>
        </div>
      </div>
    </WShell>
  );
}

// ── E5-HU02 · Tabla de conversión ─────────────────────────────
function AdminConversion() {
  const rows = [
    { m: 'Plástico PET', f: '1.20', unit: 'ECO / kg', updated: '1 mar 2026', v: 'v3', editing: false },
    { m: 'Cartón', f: '0.80', unit: 'ECO / kg', updated: '1 mar 2026', v: 'v3', editing: true },
    { m: 'Vidrio', f: '0.60', unit: 'ECO / kg', updated: '1 ene 2026', v: 'v2', editing: false },
    { m: 'Papel', f: '0.70', unit: 'ECO / kg', updated: '1 ene 2026', v: 'v2', editing: false },
    { m: 'Metal / aluminio', f: '2.10', unit: 'ECO / kg', updated: '1 mar 2026', v: 'v3', editing: false },
  ];
  const history = [
    { v: 'v3', date: '1 mar 2026', by: 'S. Ambiente', note: 'Suba PET y aluminio por demanda de acopio' },
    { v: 'v2', date: '1 ene 2026', by: 'S. Ambiente', note: 'Ajuste anual general +10%' },
    { v: 'v1', date: '1 oct 2025', by: 'S. Ambiente', note: 'Tabla inicial del programa' },
  ];
  return (
    <WShell actor="muni" nav={ADMIN_NAV} active={2}
      subtitle="Panel de administración" title="Tabla de conversión"
      right={<SBtn color={ECO.muni}>Publicar nueva versión</SBtn>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, alignItems: 'start' }}>
        <WTable
          cols={[
            { label: 'Material', w: 180 },
            { label: 'Factor', w: 160 },
            { label: 'Unidad', w: 110 },
            { label: 'Vigente desde', w: 130 },
            { label: 'Versión', w: 80 },
            { label: '', align: 'right' },
          ]}
          rows={rows.map(r => ({ cells: [
            <span style={{ fontWeight: 600 }}>{r.m}</span>,
            r.editing ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ padding: '6px 10px', border: `1.5px solid ${ECO.muni}`, borderRadius: 6, fontFamily: MONO, fontSize: 13, background: ECO.muniSoft, color: ECO.ink }}>0.85</span>
                <span style={{ fontSize: 11, color: ECO.ink2, textDecoration: 'line-through' }}>0.80</span>
              </span>
            ) : <span style={{ fontFamily: MONO, fontSize: 13 }}>{r.f}</span>,
            <span style={{ color: ECO.ink2, fontSize: 12 }}>{r.unit}</span>,
            <span style={{ color: ECO.ink2 }}>{r.updated}</span>,
            <Pill color={ECO.muni}>{r.v}</Pill>,
            r.editing ? (
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <SBtn variant="ghost" color={ECO.ink2}>Cancelar</SBtn>
                <SBtn color={ECO.org}>Guardar</SBtn>
              </div>
            ) : <div style={{ textAlign: 'right' }}><SBtn variant="outline" color={ECO.muni}>Editar</SBtn></div>,
          ] }))}
          footer={<><span>Los cambios rigen desde la publicación de la versión — no afectan pesajes ya registrados</span></>}
        />
        <div style={{ background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2, marginBottom: 14 }}>Historial de versiones</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {history.map((h, i) => (
              <div key={h.v} style={{ display: 'flex', gap: 12, paddingBottom: i < history.length - 1 ? 16 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 34, height: 24, borderRadius: 6, background: i === 0 ? ECO.muni : ECO.muniSoft, color: i === 0 ? '#fff' : ECO.muni, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{h.v}</div>
                  {i < history.length - 1 && <div style={{ width: 2, flex: 1, background: ECO.border, marginTop: 4 }} />}
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{h.date} · <span style={{ color: ECO.ink2, fontWeight: 500 }}>{h.by}</span>{i === 0 && <Pill color={ECO.org} style={{ marginLeft: 8 }}>Vigente</Pill>}</div>
                  <div style={{ fontSize: 12, color: ECO.ink2, marginTop: 3, lineHeight: 1.45 }}>{h.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WShell>
  );
}

// ── E10-HU01 · Gestión de roles del contrato ──────────────────
function AdminRoles() {
  const rows = [
    { addr: '0x4B8f…9aE2', name: 'Coop. 7 de Febrero', role: 'VALIDATOR_ROLE', granted: '12 oct 2025', tx: 'confirmada', hash: '0x91c3…77b1' },
    { addr: '0xA13d…04C7', name: 'Municipalidad VM', role: 'DEFAULT_ADMIN_ROLE', granted: '1 oct 2025', tx: 'confirmada', hash: '0x0be2…f1a9' },
    { addr: '0xA13d…04C7', name: 'Municipalidad VM', role: 'PAUSER_ROLE', granted: '1 oct 2025', tx: 'confirmada', hash: '0x0be2…f1a9' },
    { addr: '0x77Fe…B310', name: 'Coop. Puente Verde', role: 'VALIDATOR_ROLE', granted: '8 abr 2026', tx: 'pendiente', hash: '0x5dd0…3c22' },
  ];
  const roleColor = { VALIDATOR_ROLE: ECO.coop, DEFAULT_ADMIN_ROLE: ECO.muni, PAUSER_ROLE: ECO.danger };
  return (
    <WShell actor="muni" nav={ADMIN_NAV} active={3}
      subtitle="Panel de administración" title="Roles del contrato"
      right={<SBtn color={ECO.muni}>+ Otorgar rol</SBtn>}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 18px', background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 10 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ECO.muni} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" /></svg>
        <div style={{ fontSize: 13 }}>Contrato <Addr>EcoToken.sol · 0xE0c0…4F21</Addr> en <strong>Base Mainnet</strong></div>
        <span style={{ marginLeft: 'auto' }}><TxChip state="confirmada" /></span>
      </div>
      <WTable
        cols={[
          { label: 'Cuenta', w: 160 },
          { label: 'Titular', w: 190 },
          { label: 'Rol', w: 210 },
          { label: 'Otorgado', w: 110 },
          { label: 'Transacción', w: 210 },
          { label: 'Acciones', align: 'right' },
        ]}
        rows={rows.map(r => ({ cells: [
          <Addr>{r.addr}</Addr>,
          <span style={{ fontWeight: 600 }}>{r.name}</span>,
          <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 5, background: roleColor[r.role] + '14', color: roleColor[r.role], fontSize: 11, fontWeight: 700, fontFamily: MONO, letterSpacing: -0.2 }}>{r.role}</span>,
          <span style={{ color: ECO.ink2 }}>{r.granted}</span>,
          <TxChip state={r.tx} hash={r.hash} />,
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {r.role !== 'DEFAULT_ADMIN_ROLE' ? <SBtn variant="outline" color={ECO.danger}>Revocar</SBtn> : <span style={{ fontSize: 11.5, color: ECO.ink3, alignSelf: 'center' }}>No revocable</span>}
          </div>,
        ] }))}
        footer={<><span>4 asignaciones · 3 cuentas</span><span>Cambios de rol requieren firma de la wallet admin</span></>}
      />
    </WShell>
  );
}

// ── E10-HU02 · Pausar / despausar contrato ────────────────────
function AdminPause({ modal = true }) {
  return (
    <WShell actor="muni" nav={ADMIN_NAV} active={4}
      subtitle="Panel de administración" title="Estado del contrato"
      overlay={modal && (
        <WModal title="Pausar contrato" confirmLabel="Pausar contrato" danger width={480}
          sub="Al pausar, no se podrán registrar pesajes ni emitir tokens hasta despausar. El motivo queda registrado en la auditoría.">
          <WField label="Motivo de la pausa" required area value="Mantenimiento programado: migración del oráculo de pesajes. Ventana estimada 2 hs." />
          <WCheck checked>Confirmo que notifiqué a las cooperativas activas antes de pausar.</WCheck>
        </WModal>
      )}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 10, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: ECO.orgSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 14, height: 14, borderRadius: 7, background: ECO.org }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>Contrato activo</div>
              <div style={{ fontSize: 12.5, color: ECO.ink2, marginTop: 2 }}>Operando con normalidad desde el 14 abr 2026 · 09:15 hs</div>
            </div>
          </div>
          <div style={{ height: 1, background: ECO.border, margin: '20px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: ECO.ink2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Contrato</div>
              <div style={{ marginTop: 4 }}><Addr>0xE0c0…4F21</Addr></div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: ECO.ink2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Red</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Base Mainnet</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: ECO.ink2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pesajes últimas 24 hs</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>23 registrados</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: ECO.ink2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Rol requerido</div>
              <div style={{ fontSize: 12, fontFamily: MONO, fontWeight: 600, marginTop: 4, color: ECO.danger }}>PAUSER_ROLE</div>
            </div>
          </div>
          <div style={{ marginTop: 22 }}>
            <SBtn color={ECO.danger} style={{ width: '100%', padding: '12px 0' }}>Pausar contrato</SBtn>
          </div>
        </div>

        <div style={{ background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 10, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2, marginBottom: 14 }}>Historial de pausas</div>
          {[
            { s: 'Despausado', d: '14 abr 2026 · 09:15', by: 'Municipalidad VM', note: 'Fin de mantenimiento del oráculo' },
            { s: 'Pausado', d: '14 abr 2026 · 07:02', by: 'Municipalidad VM', note: 'Mantenimiento programado: actualización del oráculo de pesajes' },
            { s: 'Despausado', d: '2 ene 2026 · 12:40', by: 'Municipalidad VM', note: 'Incidente resuelto — factor de conversión corregido' },
          ].map((h, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, marginTop: 4, background: h.s === 'Pausado' ? ECO.danger : ECO.org, flexShrink: 0 }} />
                {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: ECO.border, marginTop: 4 }} />}
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{h.s} · <span style={{ color: ECO.ink2, fontWeight: 500 }}>{h.d}</span></div>
                <div style={{ fontSize: 12, color: ECO.ink2, marginTop: 3, lineHeight: 1.45 }}>{h.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WShell>
  );
}

Object.assign(window, { AdminApprovals, AdminCoopCreate, AdminConversion, AdminRoles, AdminPause });
