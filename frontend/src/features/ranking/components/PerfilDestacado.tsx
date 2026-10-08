import { Building2, Leaf } from 'lucide-react';
import type { LiderPublico } from '../api';

const num = (n: number) => n.toLocaleString('es-AR');

export function PerfilDestacado({
  lider,
  periodo,
}: {
  lider: LiderPublico;
  periodo: string;
}) {
  const stats = [
    ['Total reciclado', `${num(lider.kgReciclados)} kg`, periodo],
    ['Puntos ECO', num(lider.tokens), 'acumulados este mes'],
    ['Certificados', num(lider.certificados), 'emitidos hasta hoy'],
    ['CO₂ evitado', `${num(lider.co2Evitado)} kg`, 'según certificados'],
  ];
  return (
    <section>
      <div className="text-xs font-semibold uppercase tracking-wide text-eco-org">
        Perfil destacado
      </div>
      <h2 className="mb-4 mt-1 text-xl font-bold tracking-tight">
        {lider.razonSocial} · Líder del mes
      </h2>
      <div className="overflow-hidden rounded-2xl border border-eco-border bg-white md:flex">
        <div className="flex flex-col gap-3 bg-eco-org-soft p-6 md:w-64 md:shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-eco-org">
            <Building2 aria-hidden size={28} />
          </div>
          <div className="text-lg font-bold leading-tight">
            {lider.razonSocial}
          </div>
          <div className="mt-auto text-[11px] font-semibold uppercase tracking-wide text-eco-ink2">
            Meses participando
          </div>
          <div className="-mt-2 text-sm font-semibold text-eco-org">
            {lider.mesesConsecutivos}{' '}
            {lider.mesesConsecutivos === 1
              ? 'mes consecutivo'
              : 'meses consecutivos'}
          </div>
        </div>
        <div className="flex-1 p-6">
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map(([label, valor, sub]) => (
              <div key={label}>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-eco-ink2">
                  {label}
                </dt>
                <dd className="mt-1 text-2xl font-bold tracking-tight">
                  {valor}
                </dd>
                <div className="text-[11px] text-eco-ink2">{sub}</div>
              </div>
            ))}
          </dl>
          {lider.materiales.length > 0 && (
            <>
              <div className="mb-2 mt-6 text-xs font-semibold">
                Materiales entregados
              </div>
              <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                {lider.materiales.slice(0, 4).map((m) => (
                  <li
                    key={m.material}
                    className="rounded-lg border border-eco-border px-3 py-2"
                  >
                    <div className="text-[11px] text-eco-ink2">
                      {m.material}
                    </div>
                    <div className="text-sm font-bold">{num(m.kg)} kg</div>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-5 flex gap-3 rounded-lg bg-eco-org-soft p-4 text-sm text-eco-ink">
            <Leaf
              aria-hidden
              size={18}
              className="mt-0.5 shrink-0 text-eco-org"
            />
            <p>
              <b>Reconocimiento ambiental.</b> {lider.razonSocial} lleva{' '}
              {lider.mesesConsecutivos}{' '}
              {lider.mesesConsecutivos === 1 ? 'mes' : 'meses'} en el ranking de
              EcoToken y lideró {periodo} con {num(lider.kgReciclados)} kg
              reciclados.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
