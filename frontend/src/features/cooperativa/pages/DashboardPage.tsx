import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';

// Página inicial de demo del panel cooperativa (E11-HU03). El formulario de
// registro de ingresos lo construye E5-HU01.
export function CooperativaDashboardPage() {
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
          Registros de hoy
        </h2>
        <Table
          columns={[
            { label: 'Empresa' },
            { label: 'Material' },
            { label: 'Peso' },
          ]}
          rows={[]}
          emptyLabel="Todavía no registraste entregas hoy."
        />
      </div>
    </div>
  );
}
