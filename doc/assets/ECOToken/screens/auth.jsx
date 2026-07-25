// EcoToken — Auth: registro de empresa, pendiente de aprobación, login multi-rol
// Pantallas web públicas centradas (1280).

function AuthShell({ children, wide }) {
  return (
    <div style={{ width: '100%', height: '100%', background: ECO.bg, fontFamily: FONT, color: ECO.ink, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: ECO.surface, borderBottom: `1px solid ${ECO.border}`, padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="assets/logo-ecotoken.png" alt="EcoToken" style={{ height: 32, width: 'auto', display: 'block' }} />
          <div style={{ height: 24, width: 1, background: ECO.border }} />
          <img src="assets/logo-villa-maria.png" alt="Villa María" style={{ height: 26, display: 'block' }} />
        </div>
        <div style={{ fontSize: 13, color: ECO.ink2 }}>¿Necesitás ayuda? <span style={{ color: ECO.org, fontWeight: 600 }}>Contactanos</span></div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: wide ? 720 : 440 }}>{children}</div>
      </div>
    </div>
  );
}

// ── E3-HU01 · Registro de empresa ─────────────────────────────
function RegisterCompany() {
  return (
    <AuthShell wide>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: ECO.org, textTransform: 'uppercase', letterSpacing: 1 }}>Adhesión al programa</div>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.7, marginTop: 8 }}>Registrá tu empresa</div>
        <div style={{ fontSize: 14, color: ECO.ink2, marginTop: 8, lineHeight: 1.5 }}>Completá los datos institucionales. La Municipalidad revisará la solicitud antes de habilitar la cuenta.</div>
      </div>

      <div style={{ background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 14, padding: 32 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <WField label="Razón social" required value="Supermercado Top S.R.L." />
          <WField label="CUIT" required mono value="30-71234567-8" half />
          <WField label="Rubro / actividad" value="Comercio minorista" half />
          <WField label="Domicilio legal" required value="Bv. España 421, Villa María, Córdoba" />
          <WField label="Representante legal" required value="Marcela Ferreyra" half />
          <WField label="DNI del representante" mono value="27.884.120" half />
          <WField label="Email de contacto" required value="administracion@supertop.com.ar" half />
          <WField label="Teléfono" value="+54 353 461-2200" half />
        </div>

        <div style={{ height: 1, background: ECO.border, margin: '24px 0' }} />

        <WCheck checked>
          Acepto los <span style={{ color: ECO.org, fontWeight: 600 }}>Términos y Condiciones</span> del programa EcoToken y la <span style={{ color: ECO.org, fontWeight: 600 }}>Política de Privacidad</span>. Declaro que los datos consignados son verídicos y que la empresa se compromete a entregar materiales reciclables según el reglamento municipal.
        </WCheck>

        <div style={{ marginTop: 24 }}>
          <Btn color={ECO.org}>Enviar solicitud de registro</Btn>
        </div>
        <div style={{ textAlign: 'center', fontSize: 13, color: ECO.ink2, marginTop: 16 }}>
          ¿Ya tenés cuenta? <span style={{ color: ECO.org, fontWeight: 600 }}>Iniciar sesión</span>
        </div>
      </div>
    </AuthShell>
  );
}

// ── E3-HU03 · Registro pendiente de aprobación ────────────────
function RegisterPending() {
  const steps = [
    { t: 'Solicitud enviada', d: '2 may 2026 · 10:32 hs', state: 'done' },
    { t: 'En revisión por la Municipalidad', d: 'Verificación de CUIT y documentación', state: 'current' },
    { t: 'Alta de cuenta', d: 'Recibirás un email con el acceso', state: 'todo' },
  ];
  return (
    <AuthShell>
      <div style={{ background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 14, padding: 36, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: ECO.coopSoft, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ECO.coop} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginTop: 20 }}>Registro pendiente de aprobación</div>
        <div style={{ fontSize: 14, color: ECO.ink2, marginTop: 10, lineHeight: 1.55 }}>
          Recibimos la solicitud de <strong style={{ color: ECO.ink }}>Supermercado Top S.R.L.</strong> La Municipalidad la revisará en un plazo de <strong style={{ color: ECO.ink }}>5 días hábiles</strong>.
        </div>

        <div style={{ textAlign: 'left', margin: '28px 0 0', display: 'flex', flexDirection: 'column' }}>
          {steps.map((s, i) => {
            const color = s.state === 'done' ? ECO.org : s.state === 'current' ? ECO.coop : ECO.ink3;
            return (
              <div key={i} style={{ display: 'flex', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: s.state === 'done' ? ECO.org : ECO.surface, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.state === 'done' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>}
                    {s.state === 'current' && <div style={{ width: 8, height: 8, borderRadius: 4, background: ECO.coop }} />}
                  </div>
                  {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 28, background: s.state === 'done' ? ECO.org : ECO.border }} />}
                </div>
                <div style={{ paddingBottom: i < steps.length - 1 ? 20 : 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: s.state === 'todo' ? ECO.ink2 : ECO.ink }}>{s.t}</div>
                  <div style={{ fontSize: 12, color: ECO.ink2, marginTop: 3 }}>{s.d}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 28, padding: '14px 18px', background: ECO.bg, borderRadius: 10, fontSize: 12.5, color: ECO.ink2, lineHeight: 1.5, textAlign: 'left' }}>
          Te enviamos un comprobante a <strong style={{ color: ECO.ink }}>administracion@supertop.com.ar</strong>. Si la solicitud es rechazada vas a recibir el motivo y podrás corregir los datos.
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn variant="outline" color={ECO.ink}>Volver al inicio</Btn>
        </div>
      </div>
    </AuthShell>
  );
}

// ── E4-HU02 / E9-HU01 · Login multi-rol ───────────────────────
function LoginScreen() {
  const roles = [
    { k: 'empresa', label: 'Empresa', color: ECO.org },
    { k: 'coop', label: 'Cooperativa', color: ECO.coop },
    { k: 'muni', label: 'Municipalidad', color: ECO.muni },
  ];
  const active = 0;
  return (
    <AuthShell>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6 }}>Iniciar sesión</div>
        <div style={{ fontSize: 14, color: ECO.ink2, marginTop: 8 }}>Accedé con la cuenta de tu organización</div>
      </div>

      <div style={{ background: ECO.surface, border: `1px solid ${ECO.border}`, borderRadius: 14, padding: 28 }}>
        {/* Selector de rol */}
        <div style={{ display: 'flex', background: ECO.bg, border: `1px solid ${ECO.border}`, borderRadius: 9, padding: 4, gap: 4, marginBottom: 22 }}>
          {roles.map((r, i) => {
            const on = i === active;
            return (
              <div key={r.k} style={{ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 6, fontSize: 13, fontWeight: on ? 600 : 500, background: on ? ECO.surface : 'transparent', color: on ? r.color : ECO.ink2, boxShadow: on ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}>{r.label}</div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <WField label="Email" value="administracion@supertop.com.ar" />
          <WField label="Contraseña" value="••••••••••" right={
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
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: ECO.ink2, marginTop: 20 }}>
        ¿Tu empresa todavía no participa? <span style={{ color: ECO.org, fontWeight: 600 }}>Registrala acá</span>
      </div>
    </AuthShell>
  );
}

Object.assign(window, { RegisterCompany, RegisterPending, LoginScreen });
