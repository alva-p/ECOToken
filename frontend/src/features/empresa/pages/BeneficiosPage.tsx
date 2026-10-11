import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { fmtNum } from '@/features/municipio/dashboard/data';
import { beneficiosOrganizacion, type BeneficiosOrganizacion } from '../api';
import { alcanza } from '../dashboard/data';
import {
  Aviso,
  BenefitCard,
  MyBenefitsList,
  useCanje,
} from '../components/Benefits';

// Catálogo completo de beneficios municipales y canjes propios. Reutiliza las
// tarjetas y el modal del dashboard (components/Benefits.tsx).
export function OrganizacionBeneficiosPage() {
  const [datos, setDatos] = useState<BeneficiosOrganizacion | null>(null);
  const [error, setError] = useState(false);

  const cargar = useCallback(() => {
    setError(false);
    beneficiosOrganizacion()
      .then(setDatos)
      .catch(() => setError(true));
  }, []);
  useEffect(cargar, [cargar]);

  const { abrir, modal, aviso, cerrarAviso } = useCanje(datos, cargar);

  if (error) {
    return (
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-eco-ink2">
          No se pudieron cargar los beneficios.
        </p>
        <Button color="org" variant="outline" onClick={cargar}>
          Reintentar
        </Button>
      </Card>
    );
  }
  if (!datos) return <LoadingState label="Cargando beneficios…" />;

  const { saldo, reservado, disponible, beneficios, canjes } = datos;
  // Primero lo que se puede canjear ya, después por costo.
  const orden = [...beneficios].sort(
    (a, b) =>
      Number(alcanza(b, disponible)) - Number(alcanza(a, disponible)) ||
      a.costoTokens - b.costoTokens,
  );

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <Card className="grid grid-cols-1 gap-3 p-5 shadow-sm sm:grid-cols-3">
        {(
          [
            [`${fmtNum(disponible)} ECO`, 'Disponibles para canjear'],
            [`${fmtNum(saldo)} ECO`, 'Saldo actual'],
            [`${fmtNum(reservado)} ECO`, 'Reservados en solicitudes'],
          ] as [string, string][]
        ).map(([v, l]) => (
          <div key={l} className="rounded-lg bg-eco-bg p-3">
            <div className="text-xl font-bold text-eco-ink">{v}</div>
            <div className="text-xs text-eco-ink2">{l}</div>
          </div>
        ))}
      </Card>

      {aviso && <Aviso onClose={cerrarAviso}>{aviso}</Aviso>}

      <section aria-labelledby="catalogo">
        <h2 id="catalogo" className="mb-3 text-sm font-semibold text-eco-ink">
          Beneficios vigentes ({beneficios.length})
        </h2>
        {orden.length === 0 ? (
          <Card className="p-6 text-sm text-eco-ink2">
            La Municipalidad todavía no publicó beneficios vigentes.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orden.map((b) => (
              <BenefitCard
                key={b.id}
                b={b}
                disponible={disponible}
                onCanjear={abrir}
              />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="mis-canjes">
        <h2 id="mis-canjes" className="mb-3 text-sm font-semibold text-eco-ink">
          Mis beneficios
        </h2>
        <Card className="px-5 py-1 shadow-sm">
          <MyBenefitsList canjes={canjes} />
        </Card>
      </section>
      {modal}
    </div>
  );
}
