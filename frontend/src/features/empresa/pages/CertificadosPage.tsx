import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { LoadingState } from '@/components/ui/States';
import {
  misCertificados,
  descargarCertificadoPdf,
  descargarReportePdf,
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

// Certificados (E8-HU02) y reportes mensuales de la empresa: ambos se generan
// al cierre del mes (E8-HU01) para las empresas con aportes ese mes.
export function CertificadosPage() {
  const [data, setData] = useState<MiCertificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Clave `tipo:id` del PDF en descarga, para deshabilitar solo ese botón.
  const [descargando, setDescargando] = useState<string | null>(null);

  useEffect(() => {
    misCertificados()
      .then(setData)
      .catch(() => setError('No se pudo cargar tus certificados.'))
      .finally(() => setLoading(false));
  }, []);

  async function descargar(
    tipo: 'certificado' | 'reporte',
    cert: MiCertificado,
  ) {
    setDescargando(`${tipo}:${cert.id}`);
    try {
      const blob = await (tipo === 'certificado'
        ? descargarCertificadoPdf(cert.id)
        : descargarReportePdf(cert.id));
      descargarBlob(blob, `${tipo}-${cert.mes}-${cert.anio}.pdf`);
    } catch {
      setError(`No se pudo descargar el PDF del ${tipo}.`);
    } finally {
      setDescargando(null);
    }
  }

  const boton = (tipo: 'certificado' | 'reporte', c: MiCertificado) => (
    <Button
      key={c.id}
      type="button"
      color="org"
      variant="outline"
      disabled={descargando === `${tipo}:${c.id}`}
      onClick={() => descargar(tipo, c)}
    >
      {descargando === `${tipo}:${c.id}` ? 'Descargando…' : 'Descargar PDF'}
    </Button>
  );

  if (loading) return <LoadingState label="Cargando certificados…" />;

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-eco-danger">{error}</p>}

      <section>
        <h2 className="text-sm font-semibold text-eco-ink">Certificados</h2>
        <p className="mb-3 mt-0.5 text-xs text-eco-ink2">
          Reconocimiento mensual verificable on-chain, con tu posición en el
          ranking.
        </p>
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
                boton('certificado', c),
              ],
            }))}
            emptyLabel="Todavía no tenés certificados emitidos."
          />
        </Card>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-eco-ink">
          Reportes mensuales
        </h2>
        <p className="mb-3 mt-0.5 text-xs text-eco-ink2">
          Detalle de tus entregas, saldo de tokens e impacto de cada mes
          cerrado.
        </p>
        <Card className="p-4">
          <Table
            columns={[
              { label: 'Período' },
              { label: 'Kg reciclados', align: 'right' },
              { label: 'Emitido', align: 'right' },
              { label: '' },
            ]}
            rows={data.map((c) => ({
              cells: [
                nombrePeriodo(c.mes, c.anio),
                `${c.kgReciclados.toLocaleString('es-AR')} kg`,
                new Date(c.fechaEmision).toLocaleDateString('es-AR'),
                boton('reporte', c),
              ],
            }))}
            emptyLabel="Todavía no tenés reportes disponibles. Se generan al cierre de cada mes."
          />
        </Card>
      </section>
    </div>
  );
}
