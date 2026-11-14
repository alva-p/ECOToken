import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { LoadingState } from '@/components/ui/States';
import { hoyArt } from '@/lib/fecha';
import {
  listarReconocimientos,
  descargarCertificadoPdf,
  descargarReportePdf,
  type Reconocimiento,
} from '@/features/certificados/api';

function nombrePeriodo(mes: number, anio: number): string {
  const s = new Date(Date.UTC(anio, mes - 1, 1)).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return s[0].toUpperCase() + s.slice(1);
}

const kg = (n: number) => `${n.toLocaleString('es-AR')} kg`;
const clavePeriodo = (c: Reconocimiento) => `${c.anio}-${c.mes}`;
const inputCls =
  'rounded-lg border border-eco-border-strong bg-eco-surface px-3.5 py-2.5 text-sm text-eco-ink';

function LinkVerificar({ hash }: { hash: string }) {
  return (
    <a
      href={`/verificar/${hash}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-sm font-medium text-eco-muni hover:underline"
    >
      Verificar <ExternalLink size={14} aria-hidden />
    </a>
  );
}

interface Visor {
  titulo: string;
  url: string;
  archivo: string;
}

// PDF en un <dialog> nativo: el visor del navegador ya trae zoom, imprimir y
// descargar; el botón propio queda para mobile, donde el iframe se ve recortado.
function VisorPdf({ visor, onClose }: { visor: Visor; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="h-[90vh] w-[min(95vw,900px)] rounded-xl border border-eco-border bg-eco-surface p-0 backdrop:bg-black/45"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-eco-border px-4 py-3">
          <h2 className="truncate text-sm font-semibold text-eco-ink">
            {visor.titulo}
          </h2>
          <div className="flex shrink-0 gap-2">
            <a
              href={visor.url}
              download={visor.archivo}
              className="rounded-lg border border-eco-muni bg-white px-4 py-2.5 text-sm font-semibold tracking-tight text-eco-muni hover:bg-eco-muni-soft"
            >
              Descargar
            </a>
            <Button variant="outline" color="ink" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
        <iframe
          src={visor.url}
          title={visor.titulo}
          className="w-full flex-1"
        />
      </div>
    </dialog>
  );
}

// E9-HU03: empresas reconocidas por mes, con certificados y reportes para
// acompañar institucionalmente. Empresa elegida va en ?empresa= (back del
// navegador vuelve al listado).
export function ReconocimientosPage() {
  const [data, setData] = useState<Reconocimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [abriendo, setAbriendo] = useState<string | null>(null);
  const [visor, setVisor] = useState<Visor | null>(null);
  const [params, setParams] = useSearchParams();
  const empresaId = params.get('empresa');

  useEffect(() => {
    listarReconocimientos()
      .then(setData)
      .catch(() => setError('No se pudieron cargar los reconocimientos.'))
      .finally(() => setLoading(false));
  }, []);

  // Data viene ordenada por período desc y posición asc: el primero de cada
  // empresa es su último mes.
  const empresas = useMemo(() => {
    const porEmpresa = new Map<string, Reconocimiento[]>();
    for (const c of data) {
      porEmpresa.set(c.empresaId, [...(porEmpresa.get(c.empresaId) ?? []), c]);
    }
    return [...porEmpresa.values()]
      .map((certs) => ({
        id: certs[0].empresaId,
        nombre: certs[0].empresa.razonSocial,
        certs,
        mejorPosicion: Math.min(...certs.map((c) => c.posicion)),
        kgTotal: certs.reduce((s, c) => s + c.kgReciclados, 0),
      }))
      .sort((a, b) => b.kgTotal - a.kgTotal);
  }, [data]);

  // Todos los meses desde el primer certificado hasta el actual (hora ART),
  // también los que no tienen reconocimientos: así se puede consultar un
  // período vacío y ver por qué lo está (E9-HU03).
  const periodos = useMemo(() => {
    const hoy = hoyArt();
    const actual = Number(hoy.slice(0, 4)) * 12 + Number(hoy.slice(5, 7)) - 1;
    const primero = data.at(-1); // data viene del más nuevo al más viejo
    const desde = primero ? primero.anio * 12 + primero.mes - 1 : actual;
    const cantidad = new Map<string, number>();
    for (const c of data) {
      cantidad.set(clavePeriodo(c), (cantidad.get(clavePeriodo(c)) ?? 0) + 1);
    }
    const lista = [];
    for (let n = actual; n >= desde; n--) {
      const anio = Math.floor(n / 12);
      const mes = (n % 12) + 1;
      const clave = `${anio}-${mes}`;
      lista.push({
        clave,
        nombre: nombrePeriodo(mes, anio),
        enCurso: n === actual,
        cantidad: cantidad.get(clave) ?? 0,
      });
    }
    return lista;
  }, [data]);

  async function ver(tipo: 'certificado' | 'reporte', c: Reconocimiento) {
    setAbriendo(`${tipo}:${c.id}`);
    try {
      const blob = await (tipo === 'certificado'
        ? descargarCertificadoPdf(c.id)
        : descargarReportePdf(c.id));
      setVisor({
        titulo: `${tipo === 'certificado' ? 'Certificado' : 'Reporte'} · ${c.empresa.razonSocial} · ${nombrePeriodo(c.mes, c.anio)}`,
        url: URL.createObjectURL(blob),
        archivo: `${tipo}-${c.empresa.razonSocial}-${c.mes}-${c.anio}.pdf`,
      });
    } catch {
      setError(`No se pudo abrir el ${tipo}.`);
    } finally {
      setAbriendo(null);
    }
  }

  function cerrarVisor() {
    if (visor) URL.revokeObjectURL(visor.url);
    setVisor(null);
  }

  const botonVer = (tipo: 'certificado' | 'reporte', c: Reconocimiento) => (
    <Button
      type="button"
      color="muni"
      variant="outline"
      disabled={abriendo === `${tipo}:${c.id}`}
      onClick={() => ver(tipo, c)}
    >
      {abriendo === `${tipo}:${c.id}`
        ? 'Abriendo…'
        : tipo === 'certificado'
          ? 'Certificado'
          : 'Reporte'}
    </Button>
  );

  const linkEmpresa = (id: string, nombre: string) => (
    <button
      type="button"
      onClick={() => setParams({ empresa: id })}
      className="text-left font-medium text-eco-muni hover:underline"
    >
      {nombre}
    </button>
  );

  if (loading) return <LoadingState label="Cargando reconocimientos…" />;

  const empresa = empresas.find((e) => e.id === empresaId);
  const errorMsg = error && <p className="text-sm text-eco-danger">{error}</p>;
  const visorPdf = visor && <VisorPdf visor={visor} onClose={cerrarVisor} />;

  if (empresa) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <Button
            variant="ghost"
            color="ink"
            onClick={() => setParams({})}
            className="inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={16} aria-hidden /> Todas las empresas
          </Button>
          <h2 className="mt-2 text-lg font-semibold text-eco-ink">
            {empresa.nombre}
          </h2>
          <p className="text-xs text-eco-ink2">
            {empresa.certs.length}{' '}
            {empresa.certs.length === 1
              ? 'mes reconocido'
              : 'meses reconocidos'}{' '}
            · {kg(empresa.kgTotal)} reciclados en total
          </p>
        </div>
        {errorMsg}
        <Card className="p-4">
          <Table
            columns={[
              { label: 'Período' },
              { label: 'Posición', align: 'right' },
              { label: 'Kg reciclados', align: 'right' },
              { label: 'CO₂ evitado', align: 'right' },
              { label: 'Ver', width: '15rem' },
              { label: 'Verificación', width: '7rem' },
            ]}
            rows={empresa.certs.map((c) => ({
              cells: [
                nombrePeriodo(c.mes, c.anio),
                `${c.posicion}° de ${c.totalEmpresas}`,
                kg(c.kgReciclados),
                kg(c.co2Evitado),
                <div className="flex gap-2">
                  {botonVer('certificado', c)}
                  {botonVer('reporte', c)}
                </div>,
                <LinkVerificar hash={c.hashVerificacion} />,
              ],
            }))}
          />
        </Card>
        {visorPdf}
      </div>
    );
  }

  const q = busqueda.trim().toLowerCase();
  const delMes = data.filter(
    (c) =>
      clavePeriodo(c) === periodo &&
      c.empresa.razonSocial.toLowerCase().includes(q),
  );
  const filtradas = empresas.filter((e) => e.nombre.toLowerCase().includes(q));
  const elegido = periodos.find((p) => p.clave === periodo);
  const vacioDelMes = !elegido
    ? ''
    : elegido.cantidad > 0
      ? 'Ninguna empresa coincide con la búsqueda.'
      : elegido.enCurso
        ? `El ranking de ${elegido.nombre} todavía no cerró: los certificados se emiten automáticamente al cierre del mes.`
        : `No hay organizaciones reconocidas en ${elegido.nombre}: no se emitieron certificados para ese período.`;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-eco-ink2">
        Empresas reconocidas al cierre de cada mes. Elegí una para ver sus
        certificados y reportes, o filtrá por mes para ver el ranking de ese
        período.
      </p>
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Buscar empresa…"
          aria-label="Buscar empresa"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className={`${inputCls} min-w-0 flex-1 sm:max-w-xs`}
        />
        <select
          aria-label="Mes"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className={inputCls}
        >
          <option value="">Todos los meses</option>
          {periodos.map((p) => (
            <option key={p.clave} value={p.clave}>
              {p.nombre}
              {p.enCurso
                ? ' — en curso'
                : p.cantidad === 0
                  ? ' — sin reconocimientos'
                  : ''}
            </option>
          ))}
        </select>
      </div>
      {errorMsg}
      <Card className="p-4">
        {periodo ? (
          <Table
            columns={[
              { label: 'Posición', width: '6rem' },
              { label: 'Empresa' },
              { label: 'Kg reciclados', align: 'right' },
              { label: 'CO₂ evitado', align: 'right' },
              { label: 'Verificación', width: '7rem' },
            ]}
            rows={delMes.map((c) => ({
              cells: [
                `${c.posicion}°`,
                linkEmpresa(c.empresaId, c.empresa.razonSocial),
                kg(c.kgReciclados),
                kg(c.co2Evitado),
                <LinkVerificar hash={c.hashVerificacion} />,
              ],
            }))}
            emptyLabel={vacioDelMes}
          />
        ) : (
          <Table
            columns={[
              { label: 'Empresa' },
              { label: 'Meses', align: 'right' },
              { label: 'Mejor posición', align: 'right' },
              { label: 'Kg totales', align: 'right' },
              { label: 'Último mes', align: 'right' },
            ]}
            rows={filtradas.map((e) => ({
              cells: [
                linkEmpresa(e.id, e.nombre),
                e.certs.length,
                `${e.mejorPosicion}°`,
                kg(e.kgTotal),
                nombrePeriodo(e.certs[0].mes, e.certs[0].anio),
              ],
            }))}
            emptyLabel={
              data.length
                ? 'Ninguna empresa coincide con la búsqueda.'
                : 'Todavía no hay certificados emitidos. Se generan al cierre de cada mes.'
            }
          />
        )}
      </Card>
    </div>
  );
}
