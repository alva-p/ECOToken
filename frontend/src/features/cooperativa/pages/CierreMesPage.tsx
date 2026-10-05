import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/States';
import { misEntregas, type EntregaHistorial } from '../api';

const ART_MS = 3 * 3600_000; // Argentina: GMT-3 fijo, sin horario de verano.

/** Inicio del próximo mes (día 1, 00:00 hora argentina) como instante UTC. */
function proximoCierre(ahora: number): number {
  const art = new Date(ahora - ART_MS);
  return Date.UTC(art.getUTCFullYear(), art.getUTCMonth() + 1, 1) + ART_MS;
}

/** Inicio del mes en curso (día 1, 00:00 hora argentina) como instante UTC. */
function inicioMes(ahora: number): number {
  const art = new Date(ahora - ART_MS);
  return Date.UTC(art.getUTCFullYear(), art.getUTCMonth(), 1) + ART_MS;
}

function Unidad({ valor, label }: { valor: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-semibold tabular-nums text-eco-ink">
        {String(valor).padStart(2, '0')}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-eco-ink2">
        {label}
      </span>
    </div>
  );
}

/** Cierre de mes (solo lectura): cuenta regresiva y resumen del mes en curso.
 * El cierre lo ejecuta el job mensual y lo gestiona administración. */
export function CierreMesPage() {
  const [ahora, setAhora] = useState(Date.now());
  const [entregas, setEntregas] = useState<EntregaHistorial[] | null>(null);

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    misEntregas(31)
      .then(setEntregas)
      .catch(() => setEntregas([]));
  }, []);

  const resto = Math.max(0, proximoCierre(ahora) - ahora);
  const dias = Math.floor(resto / 86_400_000);
  const horas = Math.floor(resto / 3_600_000) % 24;
  const minutos = Math.floor(resto / 60_000) % 60;
  const segundos = Math.floor(resto / 1000) % 60;

  const delMes = entregas?.filter(
    (e) => Date.parse(e.fecha) >= inicioMes(ahora),
  );
  const kilos = delMes?.reduce((s, e) => s + e.peso, 0) ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
          Próximo cierre de mes
        </div>
        <div className="mt-3 flex gap-6">
          <Unidad valor={dias} label="días" />
          <Unidad valor={horas} label="horas" />
          <Unidad valor={minutos} label="min" />
          <Unidad valor={segundos} label="seg" />
        </div>
        <p className="mt-3 text-xs text-eco-ink2">
          Al cierre se calcula el ranking y se emiten los certificados de forma
          automática. Hora de Argentina (GMT-3).
        </p>
      </Card>

      <Card>
        <div className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
          Tu mes hasta ahora
        </div>
        {delMes === undefined ? (
          <LoadingState />
        ) : (
          <div className="mt-1.5 text-lg font-semibold text-eco-ink">
            {delMes.length} entregas · {kilos} kg
          </div>
        )}
      </Card>
    </div>
  );
}
