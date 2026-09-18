import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { LoadingState } from '@/components/ui/States';
import {
  misCertificados,
  descargarCertificadoPdf,
  type MiCertificado,
} from '@/features/certificados/api';

function nombrePeriodo(mes: number, anio: number): string {
  return new Date(Date.UTC(anio, mes - 1, 1)).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function descargarBlob(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

// Certificados mensuales de la empresa (E8-HU02): se emiten al cierre del
// ranking (E8-HU01) para las empresas con aportes ese mes.
export function CertificadosPage() {
  const [data, setData] = useState<MiCertificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descargando, setDescargando] = useState<string | null>(null);

  useEffect(() => {
    misCertificados()
      .then(setData)
      .catch(() => setError('No se pudo cargar tus certificados.'))
      .finally(() => setLoading(false));
  }, []);

  async function descargar(cert: MiCertificado) {
    setDescargando(cert.id);
    try {
      const blob = await descargarCertificadoPdf(cert.id);
      descargarBlob(blob, `certificado-${cert.mes}-${cert.anio}.pdf`);
    } catch {
      setError('No se pudo descargar el PDF del certificado.');
    } finally {
      setDescargando(null);
    }
  }

  if (loading) return <LoadingState label="Cargando certificados…" />;

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-eco-danger">{error}</p>}

      <Card className="p-4">
        <Table
          columns={[
            { label: 'Período' },
            { label: 'Posición', align: 'right' },
            { label: 'Kg reciclados', align: 'right' },
            { label: 'CO₂ evitado', align: 'right' },
            { label: '' },
          ]}
          rows={data.map((c) => ({
            cells: [
              nombrePeriodo(c.mes, c.anio),
              `#${c.posicion}`,
              `${c.kgReciclados.toLocaleString('es-AR')} kg`,
              `${c.co2Evitado.toLocaleString('es-AR')} kg`,
              <Button
                key={c.id}
                type="button"
                color="org"
                variant="outline"
                disabled={descargando === c.id}
                onClick={() => descargar(c)}
              >
                {descargando === c.id ? 'Descargando…' : 'Descargar PDF'}
              </Button>,
            ],
          }))}
          emptyLabel="Todavía no tenés certificados emitidos."
        />
      </Card>
    </div>
  );
}
