import { useEffect, useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field } from '@/components/ui/Field';
import { LoadingState } from '@/components/ui/States';
import { Table } from '@/components/ui/Table';
import {
  actualizarBeneficio,
  crearBeneficio,
  eliminarBeneficio,
  listarBeneficios,
  listarCanjes,
  resolverCanje,
  type CanjeConEmpresa,
  type Beneficio,
  TIPOS_BENEFICIO,
  type TipoBeneficio,
} from '../api';

const TIPOS = TIPOS_BENEFICIO;

const ESTADOS = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
};

const VACIO = {
  titulo: '',
  descripcion: '',
  tipo: 'WEB' as TipoBeneficio,
  costoTokens: '',
  cupos: '',
  vigenteHasta: '',
};

// Premios y beneficios que la municipalidad publica para que las empresas los
// canjeen con tokens ECO (publicidad en la web municipal, pantallas, etc.).
export function BeneficiosPage() {
  const [items, setItems] = useState<Beneficio[] | null>(null);
  const [canjes, setCanjes] = useState<CanjeConEmpresa[]>([]);
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState<string | null>(null);

  const cargar = () =>
    Promise.all([listarBeneficios(), listarCanjes()])
      .then(([b, c]) => {
        setItems(b);
        setCanjes(c);
      })
      .catch(() => setError('No se pudieron cargar los beneficios.'));

  useEffect(() => {
    cargar();
  }, []);

  const set = (k: keyof typeof VACIO, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await crearBeneficio({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        tipo: form.tipo,
        costoTokens: Number(form.costoTokens),
        cupos: form.cupos ? Number(form.cupos) : null,
        vigenteHasta: form.vigenteHasta || null,
      });
      setForm(VACIO);
      await cargar();
    } catch {
      setError('No se pudo crear el beneficio. Revisá los datos.');
    }
  }

  const pendientes = canjes.filter((c) => c.estado === 'PENDIENTE').length;

  async function accion(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      await cargar();
    } catch {
      setError(
        'No se pudo completar la acción. Un beneficio con solicitudes no se puede eliminar: pausalo.',
      );
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-eco-ink">
          Nuevo premio o beneficio
        </h2>
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Field
            label="Título"
            required
            value={form.titulo}
            onChange={(e) => set('titulo', e.target.value)}
            placeholder="Ej. Fin de semana en pantallas digitales"
          />
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-eco-ink">
              Tipo
            </span>
            <select
              value={form.tipo}
              onChange={(e) => set('tipo', e.target.value)}
              className="w-full rounded-lg border border-eco-border-strong bg-eco-surface px-3.5 py-2.5 text-sm text-eco-ink"
            >
              {Object.entries(TIPOS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold text-eco-ink">
              Descripción
            </span>
            <textarea
              required
              rows={3}
              value={form.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              placeholder="Ej. 5 minutos de publicidad durante todo un fin de semana con un video de 10 segundos."
              className="w-full rounded-lg border border-eco-border-strong bg-eco-surface px-3.5 py-2.5 text-sm text-eco-ink"
            />
          </label>
          <Field
            label="Costo (tokens ECO)"
            type="number"
            min={1}
            required
            value={form.costoTokens}
            onChange={(e) => set('costoTokens', e.target.value)}
          />
          <Field
            label="Cupos (vacío = sin límite)"
            type="number"
            min={1}
            value={form.cupos}
            onChange={(e) => set('cupos', e.target.value)}
          />
          <Field
            label="Vigente hasta (opcional)"
            type="date"
            value={form.vigenteHasta}
            onChange={(e) => set('vigenteHasta', e.target.value)}
          />
          <div className="flex items-end">
            <Button type="submit" color="muni">
              Publicar beneficio
            </Button>
          </div>
        </form>
      </Card>

      {error && <p className="text-sm text-eco-danger">{error}</p>}

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-eco-ink">
          Solicitudes de canje
          {pendientes > 0 && (
            <span className="ml-2">
              <Badge color="muni">{pendientes} pendientes</Badge>
            </span>
          )}
        </h2>
        <p className="mb-3 mt-0.5 text-xs text-eco-ink2">
          Las organizaciones solicitan beneficios con sus ECO; los puntos quedan
          reservados hasta que aprobás o rechazás la solicitud.
        </p>
        <Table
          columns={[
            { label: 'Fecha' },
            { label: 'Organización' },
            { label: 'Beneficio' },
            { label: 'ECO', align: 'right' },
            { label: 'Estado' },
            { label: '', align: 'right' },
          ]}
          rows={canjes.map((c) => ({
            cells: [
              new Date(c.createdAt).toLocaleDateString('es-AR'),
              c.empresa.razonSocial,
              c.beneficio.titulo,
              c.costoTokens.toLocaleString('es-AR'),
              <Badge
                key="e"
                color={
                  c.estado === 'APROBADO'
                    ? 'org'
                    : c.estado === 'RECHAZADO'
                      ? 'danger'
                      : 'muni'
                }
              >
                {ESTADOS[c.estado]}
              </Badge>,
              c.estado === 'PENDIENTE' ? (
                <div key="a" className="flex justify-end gap-2">
                  <Button
                    type="button"
                    color="muni"
                    className="px-3 py-1.5 text-xs"
                    onClick={() =>
                      accion(() => resolverCanje(c.id, 'APROBADO'))
                    }
                  >
                    Aprobar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    color="danger"
                    className="px-3 py-1.5 text-xs"
                    onClick={() =>
                      window.confirm(
                        `¿Rechazar la solicitud de ${c.empresa.razonSocial}? Los ECO reservados vuelven a su saldo.`,
                      ) && accion(() => resolverCanje(c.id, 'RECHAZADO'))
                    }
                  >
                    Rechazar
                  </Button>
                </div>
              ) : (
                ''
              ),
            ],
          }))}
          emptyLabel="Todavía no hay solicitudes de canje."
        />
      </Card>

      {!items ? (
        <LoadingState label="Cargando beneficios…" />
      ) : items.length === 0 ? (
        <Card className="py-10 text-center text-sm text-eco-ink2">
          Todavía no publicaste ningún beneficio.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((b) => (
            <Card key={b.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <Badge color="muni">{TIPOS[b.tipo]}</Badge>
                <Badge color={b.activo ? 'org' : 'ink'}>
                  {b.activo ? 'Activo' : 'Pausado'}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-eco-ink">{b.titulo}</h3>
                <p className="mt-1 text-sm text-eco-ink2">{b.descripcion}</p>
              </div>
              <div className="mt-auto text-xs text-eco-ink2">
                <span className="text-lg font-bold text-eco-ink">
                  {b.costoTokens.toLocaleString('es-AR')}
                </span>{' '}
                tokens ECO
                {' · '}
                {b.cupos ? `${b.cupos} cupos` : 'sin límite de cupos'}
                {b.vigenteHasta &&
                  ` · hasta ${new Date(b.vigenteHasta).toLocaleDateString('es-AR', { timeZone: 'UTC' })}`}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  color="muni"
                  onClick={() =>
                    accion(() =>
                      actualizarBeneficio(b.id, { activo: !b.activo }),
                    )
                  }
                >
                  {b.activo ? 'Pausar' : 'Activar'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  color="danger"
                  onClick={() =>
                    window.confirm('¿Eliminar este beneficio?') &&
                    accion(() => eliminarBeneficio(b.id))
                  }
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
