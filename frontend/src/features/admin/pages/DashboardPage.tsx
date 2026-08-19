import { Table } from '@/components/ui/Table';

// Página inicial de demo del panel admin (E11-HU03). El listado y las acciones de
// aprobar/rechazar los construye E3-HU04.
export function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-eco-ink">
        Empresas pendientes de alta
      </h2>
      <Table
        columns={[
          { label: 'Empresa' },
          { label: 'CUIT' },
          { label: 'Solicitud' },
          { label: 'Acciones', align: 'right' },
        ]}
        rows={[]}
        emptyLabel="No hay solicitudes pendientes."
      />
    </div>
  );
}
