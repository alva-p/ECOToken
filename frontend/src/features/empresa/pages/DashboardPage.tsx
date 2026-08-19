import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';

// Página inicial de demo del panel empresa (E11-HU03). Sin datos reales todavía:
// el saldo y el historial los conectan E6-HU01/E6-HU02.
export function EmpresaDashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="text-xs font-semibold uppercase tracking-wide text-eco-ink2">
          Saldo actual
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-3xl font-bold tracking-tight text-eco-ink">
            — ECO
          </span>
          <Badge color="org">Próximamente</Badge>
        </div>
      </Card>
      <div>
        <h2 className="mb-3 text-sm font-semibold text-eco-ink">
          Últimos aportes
        </h2>
        <Table
          columns={[
            { label: 'Fecha' },
            { label: 'Material' },
            { label: 'Peso' },
            { label: 'Tokens', align: 'right' },
          ]}
          rows={[]}
          emptyLabel="Todavía no registraste aportes."
        />
      </div>
    </div>
  );
}
