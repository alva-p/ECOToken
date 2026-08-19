import { Table } from '@/components/ui/Table';

// Página inicial de demo del panel municipio (E11-HU03). Los filtros por período
// y la exportación los construye E9-HU02.
export function MunicipioDashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-eco-ink">
        Volumen reciclado por período
      </h2>
      <Table
        columns={[
          { label: 'Período' },
          { label: 'Empresas activas' },
          { label: 'Kg reciclados' },
        ]}
        rows={[]}
        emptyLabel="No hay datos para el período seleccionado."
      />
    </div>
  );
}
