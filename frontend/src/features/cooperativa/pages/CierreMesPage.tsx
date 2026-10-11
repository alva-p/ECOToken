import { useEffect, useState } from 'react';
import { inicioMes, restanteCierre, useAhora } from '@/lib/cierreMes';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/States';
import { misEntregas, type EntregaHistorial } from '../api';

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
  const ahora = useAhora();
  const [entregas, setEntregas] = useState<EntregaHistorial[] | null>(null);

  useEffect(() => {
    misEntregas(31)
      .then(setEntregas)
      .catch(() => setEntregas([]));
  }, []);

  const { dias, horas, minutos, segundos } = restanteCierre(ahora);

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
        <div className="mt-3 flex flex-wrap gap-6">
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
