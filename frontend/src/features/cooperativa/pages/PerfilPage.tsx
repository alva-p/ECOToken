import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, Circle, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Tooltip } from '@/components/ui/Tooltip';
import { LoadingState } from '@/components/ui/States';
import {
  actualizarMiPerfil,
  obtenerMiPerfil,
  subirLogo,
  urlLogoEmpresa,
  type MiPerfil,
} from '@/features/empresa/api';

const TAMANIO_MAXIMO_LOGO = 2 * 1024 * 1024; // 2 MB

type FormState = {
  razonSocial: string;
  emailContacto: string;
  telefono: string;
  domicilio: string;
  codigoPostal: string;
  pais: string;
  sitioWeb: string;
  representanteLegal: string;
  descripcion: string;
};

const EMPTY_FORM: FormState = {
  razonSocial: '',
  emailContacto: '',
  telefono: '',
  domicilio: '',
  codigoPostal: '',
  pais: '',
  sitioWeb: '',
  representanteLegal: '',
  descripcion: '',
};

const limpio = (v: string) => {
  const t = v.trim();
  return t ? t : undefined;
};

function esCuadrada(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.naturalWidth === img.naturalHeight);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}

function Dato({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-eco-ink2">{label}</span>
      <span className="text-sm text-eco-ink">{value || '—'}</span>
    </div>
  );
}

export function CooperativaPerfilPage() {
  const [perfil, setPerfil] = useState<MiPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [errorLogo, setErrorLogo] = useState<string | null>(null);
  const [logoVersion, setLogoVersion] = useState(() => Date.now());
  const fileRef = useRef<HTMLInputElement>(null);

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [ticketNota, setTicketNota] = useState(false);

  function cargar() {
    setLoading(true);
    obtenerMiPerfil()
      .then(setPerfil)
      .catch(() => setError('No se pudo cargar tu perfil.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErrorLogo(null);

    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setErrorLogo('El logo debe ser una imagen PNG, JPG o WebP.');
      return;
    }
    if (file.size > TAMANIO_MAXIMO_LOGO) {
      setErrorLogo('El logo no puede superar los 2 MB.');
      return;
    }
    if (!(await esCuadrada(file))) {
      setErrorLogo('El logo debe ser una imagen cuadrada (relación 1:1).');
      return;
    }

    setSubiendoLogo(true);
    try {
      await subirLogo(file);
      setLogoVersion(Date.now());
      cargar();
      window.dispatchEvent(new Event('ecotoken:logo'));
    } catch {
      setErrorLogo('No se pudo subir el logo. Intentá de nuevo.');
    } finally {
      setSubiendoLogo(false);
    }
  }

  function iniciarEdicion() {
    if (!perfil) return;
    setForm({
      razonSocial: perfil.razonSocial,
      emailContacto: perfil.emailContacto ?? '',
      telefono: perfil.telefono ?? '',
      domicilio: perfil.domicilio ?? '',
      codigoPostal: perfil.codigoPostal ?? '',
      pais: perfil.pais ?? '',
      sitioWeb: perfil.sitioWeb ?? '',
      representanteLegal: perfil.representanteLegal ?? '',
      descripcion: perfil.descripcion ?? '',
    });
    setErrores({});
    setEditando(true);
  }

  function setField(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function guardarPerfil() {
    const errs: Record<string, string> = {};
    if (!form.razonSocial.trim()) {
      errs.razonSocial = 'La razón social es obligatoria.';
    }
    if (form.emailContacto && !/^\S+@\S+\.\S+$/.test(form.emailContacto)) {
      errs.emailContacto = 'Ingresá un email válido.';
    }
    setErrores(errs);
    if (Object.keys(errs).length) return;

    setGuardando(true);
    try {
      const actualizado = await actualizarMiPerfil({
        razonSocial: form.razonSocial.trim(),
        emailContacto: limpio(form.emailContacto),
        telefono: limpio(form.telefono),
        domicilio: limpio(form.domicilio),
        codigoPostal: limpio(form.codigoPostal),
        pais: limpio(form.pais),
        sitioWeb: limpio(form.sitioWeb),
        representanteLegal: limpio(form.representanteLegal),
        descripcion: limpio(form.descripcion),
      });
      setPerfil(actualizado);
      setEditando(false);
    } catch {
      setErrores({
        envio:
          'No se pudo guardar. Revisá el email y el sitio web (debe ser una URL válida).',
      });
    } finally {
      setGuardando(false);
    }
  }

  if (loading) return <LoadingState label="Cargando tu perfil…" />;
  if (error || !perfil)
    return <p className="text-sm text-eco-danger">{error ?? 'Sin datos.'}</p>;

  const itemsPerfil = [
    { label: 'Logo', ok: !!perfil.logoUrl },
    { label: 'Teléfono', ok: !!perfil.telefono },
    { label: 'Sitio web', ok: !!perfil.sitioWeb },
    { label: 'Domicilio', ok: !!perfil.domicilio },
    { label: 'País', ok: !!perfil.pais },
    { label: 'Descripción', ok: !!perfil.descripcion },
  ];
  const completados = itemsPerfil.filter((i) => i.ok).length;
  const pctPerfil = Math.round((completados / itemsPerfil.length) * 100);
  const CIRC = 2 * Math.PI * 46;

  return (
    <div className="flex flex-col gap-5">
      <section>
        <div className="flex flex-wrap items-center gap-4">
          <Tooltip
            align="left"
            content={
              <div className="flex w-52 flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Completá tu perfil</span>
                  <span className="font-bold text-eco-coop">{pctPerfil}%</span>
                </div>
                <div className="flex flex-col gap-1">
                  {itemsPerfil.map((it) => (
                    <span key={it.label} className="flex items-center gap-1.5">
                      {it.ok ? (
                        <CheckCircle2
                          size={13}
                          className="shrink-0 text-eco-coop"
                        />
                      ) : (
                        <Circle size={13} className="shrink-0 text-eco-ink2" />
                      )}
                      <span
                        className={it.ok ? 'text-eco-ink' : 'text-eco-ink2'}
                      >
                        {it.label}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            }
          >
            <div className="relative h-20 w-20 shrink-0">
              <svg
                viewBox="0 0 100 100"
                className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
              >
                <defs>
                  <linearGradient id="gradLogoCoop" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-eco-border"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="url(#gradLogoCoop)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={(1 - pctPerfil / 100) * CIRC}
                  className="transition-[stroke-dashoffset] duration-700 ease-out"
                />
              </svg>

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={subiendoLogo}
                className="group absolute inset-[9px] flex items-center justify-center overflow-hidden rounded-full border border-eco-border bg-eco-bg"
              >
                {perfil.logoUrl ? (
                  <img
                    src={urlLogoEmpresa(perfil.id, logoVersion)}
                    alt="Logo de la cooperativa"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-1 text-center text-[9px] leading-tight text-eco-ink2">
                    Subir logo
                  </span>
                )}
                <span className="absolute inset-0 hidden items-center justify-center rounded-full bg-black/45 text-[9px] font-semibold text-white group-hover:flex">
                  {subiendoLogo ? 'Subiendo…' : 'Cambiar'}
                </span>
              </button>

              <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-eco-coop px-1.5 py-0.5 text-[9px] font-bold leading-none text-white ring-2 ring-eco-bg">
                {pctPerfil}%
              </span>
            </div>
          </Tooltip>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleLogoChange}
          />

          <div>
            <h2 className="text-sm font-semibold text-eco-ink">Mi perfil</h2>
            <p className="mt-0.5 text-xs text-eco-ink2">
              Datos de tu cooperativa registrados en ECOToken.
            </p>
          </div>

          <Button
            color="coop"
            variant="outline"
            onClick={() => setTicketNota(true)}
            className="ml-auto"
          >
            Generar ticket
          </Button>
        </div>

        {errorLogo && (
          <p className="mt-2 text-xs text-eco-danger">{errorLogo}</p>
        )}
        {ticketNota && (
          <p className="mt-2 text-xs text-eco-ink2">
            Función en desarrollo: pronto vas a poder generar un ticket de
            soporte.
          </p>
        )}

        <Card className="relative mt-3 grid gap-4 p-6 sm:grid-cols-2">
          {editando ? (
            <>
              <Field
                label="Razón social"
                required
                value={form.razonSocial}
                onChange={setField('razonSocial')}
                error={errores.razonSocial}
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-eco-ink2">
                  CUIT (no editable)
                </span>
                <span className="text-sm text-eco-ink">{perfil.cuit}</span>
              </div>
              <Field
                label="Email de contacto"
                type="email"
                value={form.emailContacto}
                onChange={setField('emailContacto')}
                error={errores.emailContacto}
              />
              <Field
                label="Teléfono"
                value={form.telefono}
                onChange={setField('telefono')}
              />
              <Field
                label="Domicilio"
                value={form.domicilio}
                onChange={setField('domicilio')}
              />
              <Field
                label="Código postal"
                value={form.codigoPostal}
                onChange={setField('codigoPostal')}
              />
              <Field
                label="País"
                value={form.pais}
                onChange={setField('pais')}
              />
              <Field
                label="Sitio web"
                placeholder="https://…"
                value={form.sitioWeb}
                onChange={setField('sitioWeb')}
              />
              <Field
                label="Representante legal"
                value={form.representanteLegal}
                onChange={setField('representanteLegal')}
              />
              <Field
                label="Descripción"
                value={form.descripcion}
                onChange={setField('descripcion')}
              />

              {errores.envio && (
                <p className="text-xs text-eco-danger sm:col-span-2">
                  {errores.envio}
                </p>
              )}
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button
                  variant="outline"
                  color="ink"
                  onClick={() => setEditando(false)}
                  disabled={guardando}
                >
                  Cancelar
                </Button>
                <Button
                  color="coop"
                  onClick={guardarPerfil}
                  disabled={guardando}
                >
                  {guardando ? 'Guardando…' : 'Guardar'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={iniciarEdicion}
                title="Editar perfil"
                aria-label="Editar perfil"
                className="absolute right-3 top-3 rounded-md p-1.5 text-eco-ink2 transition-colors hover:bg-eco-bg hover:text-eco-ink"
              >
                <Pencil size={18} />
              </button>

              <Dato label="Razón social" value={perfil.razonSocial} />
              <Dato label="CUIT" value={perfil.cuit} />
              <Dato label="Email de contacto" value={perfil.emailContacto} />
              <Dato label="Teléfono" value={perfil.telefono} />
              <Dato label="Domicilio" value={perfil.domicilio} />
              <Dato label="Código postal" value={perfil.codigoPostal} />
              <Dato label="País" value={perfil.pais} />
              <Dato label="Sitio web" value={perfil.sitioWeb} />
              <Dato
                label="Representante legal"
                value={perfil.representanteLegal}
              />
              <Dato label="Descripción" value={perfil.descripcion} />
            </>
          )}
        </Card>
      </section>
    </div>
  );
}
