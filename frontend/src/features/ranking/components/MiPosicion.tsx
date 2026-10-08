import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { MiPosicion as Datos } from '../api';
import { Distribucion, Evolucion } from './RankingEstadisticas';
import { SubtituloSeccion } from './SubtituloSeccion';

const num = (n: number) => n.toLocaleString('es-AR');

function Dato({
  label,
  valor,
  sub,
}: {
  label: string;
  valor: string;
  sub?: string;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-eco-ink2">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-eco-ink">
        {valor}
      </div>
      {sub && <div className="text-xs text-eco-ink2">{sub}</div>}
    </div>
  );
}

/** "Tu posición": la empresa logueada dentro del ranking del período. */
export function MiPosicion({
  datos,
  periodo,
}: {
  datos: Datos;
  periodo: string;
}) {
  if (!datos.participa) {
    return (
      <Card className="p-6">
        <SubtituloSeccion
          titulo="Tu posición"
          detalle={`Tu empresa en ${periodo}`}
        />
        <p className="mt-4 text-center text-sm text-eco-ink2">
          En este período no registraste aportes, por eso tu empresa no figura
          en el ranking. Mirá cómo sumar en{' '}
          <Link to="/empresa/aportes" className="font-semibold text-eco-org">
            tus aportes
          </Link>
          .
        </p>
      </Card>
    );
  }

  const t = datos.tendencia;
  const serie = datos.evolucion.map((p) => ({
    mes: p.mes,
    anio: p.anio,
    totalKg: p.kg,
  }));
  return (
    <section>
      <SubtituloSeccion
        titulo="Tu posición"
        detalle={`Tu empresa en ${periodo}`}
      />
      <div className="mt-5 overflow-hidden rounded-2xl border border-eco-org bg-white">
        <div className="flex flex-col gap-5 bg-eco-org-soft p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-eco-org text-white">
              <Trophy aria-hidden size={26} />
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight text-eco-ink sm:text-4xl">
                Estás en el top {datos.posicion}
              </div>
              <div className="mt-0.5 text-sm text-eco-ink2">
                de {num(datos.totalEmpresas)}{' '}
                {datos.totalEmpresas === 1 ? 'empresa' : 'empresas'} en{' '}
                {periodo}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {datos.nuevo && <Badge color="org">Nuevo</Badge>}
            {t !== null && t !== 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-eco-ink">
                {t > 0 ? (
                  <ArrowUp aria-hidden size={13} className="text-eco-org" />
                ) : (
                  <ArrowDown aria-hidden size={13} className="text-eco-coop" />
                )}
                {t > 0 ? 'Subiste' : 'Bajaste'} {Math.abs(t)}{' '}
                {Math.abs(t) === 1 ? 'puesto' : 'puestos'} vs. el mes anterior
              </span>
            )}
            {t === 0 && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-eco-ink2">
                Mantuviste tu puesto
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <dl className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            <Dato
              label="Material reciclado"
              valor={`${num(datos.kgReciclados)} kg`}
            />
            <Dato label="Puntos ECO" valor={num(datos.tokens)} />
            <Dato
              label="Certificados"
              valor={num(datos.certificados)}
              sub="emitidos hasta hoy"
            />
            <Dato
              label="CO₂ evitado"
              valor={`${num(datos.co2Evitado)} kg`}
              sub="según certificados"
            />
          </dl>
          <p className="mt-5 rounded-lg bg-eco-bg px-4 py-3 text-sm text-eco-ink">
            {datos.puntosParaSubir === null ? (
              <>Sos la primera del ranking de {periodo}. ¡Seguí así!</>
            ) : (
              <>
                Te faltan <b>{num(datos.puntosParaSubir)} puntos ECO</b> para
                pasar al puesto {(datos.posicion ?? 1) - 1}.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Evolucion serie={serie} titulo="Tu evolución mensual" />
        <Distribucion
          materiales={datos.materiales}
          total={datos.kgReciclados}
          titulo="Tus materiales"
        />
      </div>
    </section>
  );
}
