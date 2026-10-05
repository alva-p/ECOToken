import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BuscadorEmpresas } from '../components/BuscadorEmpresas';
import { HistorialEntregas } from '../components/HistorialEntregas';
import { RegistrarEntregaForm } from '../components/RegistrarEntregaForm';
import type { Empresa } from '@/types';

// Página inicial del panel cooperativa: buscador de empresas (E4-HU03) +
// formulario de registro de ingresos (E5-HU01).
export function CooperativaDashboardPage() {
  const [empresaSeleccionada, setEmpresaSeleccionada] =
    useState<Empresa | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
          Rol on-chain
        </div>
        <div className="mt-1.5 text-lg font-semibold text-eco-ink">
          VALIDATOR_ROLE
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-eco-ink">
          Buscar empresa
        </h2>
        <BuscadorEmpresas onSelect={setEmpresaSeleccionada} />
        {empresaSeleccionada && (
          <RegistrarEntregaForm empresa={empresaSeleccionada} />
        )}
      </div>

      <HistorialEntregas />
    </div>
  );
}
