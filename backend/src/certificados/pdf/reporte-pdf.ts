import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { join } from 'node:path';

// Reporte mensual de actividad de una empresa (A4 vertical, 595x842 pt).
// Diseño de referencia: doc/assets/reporte-mensual-actividad.png.
const W = 595;
const H = 842;
const M = 40;
const GREEN = '#0F6E56';
const AMBER = '#BA7517';
const AMBER_BG = '#FAF1E4';
const INK = '#1A1A1A';
const INK2 = '#5A5A5A';
const LINE = '#D9DEDC';
const ZEBRA = '#F7F7F5';
const ASSETS = join(__dirname, 'assets');
const MUNICIPALIDAD = 'Municipalidad de Villa María';
const COOPERATIVA = 'Cooperativa 7 de Febrero';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export interface EntregaReporte {
  fecha: Date;
  material: string;
  kg: number;
  tokens: number;
  txHash: string | null;
}

export interface DatosReportePdf {
  numero: string;
  mes: number;
  anio: number;
  razonSocial: string;
  cuit: string;
  domicilio: string | null;
  walletAddress: string;
  entregas: EntregaReporte[];
  saldoAnterior: number;
  canjes: number;
  co2Mes: number;
  co2Anio: number;
  posicion: number;
  totalEmpresas: number;
  hashVerificacion: string;
  urlVerificacion: string;
  emitidoEn: Date;
}

const num = (n: number, dec = 0) =>
  n.toLocaleString('es-AR', { maximumFractionDigits: dec });
const dos = (n: number) => String(n).padStart(2, '0');
const fecha = (d: Date) =>
  `${dos(d.getUTCDate())}/${dos(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
const corto = (h: string) =>
  h.length > 16 ? `${h.slice(0, 10)}…${h.slice(-4)}` : h;

/** Texto de una línea; `align` respecto de x (right = termina en x). */
function t(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  o: {
    font?: string;
    size?: number;
    color?: string;
    align?: 'left' | 'right';
    spacing?: number;
  } = {},
) {
  const opts: PDFKit.Mixins.TextOptions = { lineBreak: false };
  if (o.spacing) opts.characterSpacing = o.spacing;
  doc
    .font(o.font ?? 'Helvetica')
    .fontSize(o.size ?? 9)
    .fillColor(o.color ?? INK);
  const w = o.align === 'right' ? doc.widthOfString(text, opts) : 0;
  doc.text(text, x - w, y, opts);
}

function seccion(
  doc: PDFKit.PDFDocument,
  n: number,
  titulo: string,
  y: number,
) {
  doc.rect(M, y, 18, 18).fill(GREEN);
  t(doc, String(n), M + 9 - 2.5, y + 5, {
    font: 'Helvetica-Bold',
    size: 9,
    color: '#FFFFFF',
  });
  t(doc, titulo, M + 26, y + 4, {
    font: 'Helvetica-Bold',
    size: 11,
    color: GREEN,
    spacing: 0.3,
  });
  const w = doc.widthOfString(titulo) + 26 + titulo.length * 0.3;
  doc
    .moveTo(M + w + 12, y + 9)
    .lineTo(W - M, y + 9)
    .lineWidth(0.6)
    .stroke(LINE);
  return y + 30;
}

export async function generarReportePdf(d: DatosReportePdf): Promise<Buffer> {
  const qr = await QRCode.toBuffer(d.urlVerificacion, {
    margin: 2,
    width: 300,
    color: { dark: GREEN, light: '#FFFFFF' },
  });

  const doc = new PDFDocument({ size: [W, H], margin: 0 });
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const listo = new Promise<Buffer>((resolve) =>
    doc.on('end', () => resolve(Buffer.concat(chunks))),
  );

  const periodo = `${MESES[d.mes - 1]} ${d.anio}`;
  const desde = new Date(Date.UTC(d.anio, d.mes - 1, 1));
  const hasta = new Date(Date.UTC(d.anio, d.mes, 0));
  const piePagina = () => {
    doc
      .moveTo(M, H - 60)
      .lineTo(W - M, H - 60)
      .lineWidth(0.6)
      .stroke(LINE);
    t(
      doc,
      'Este reporte acredita el saldo de tokens ECO disponibles para canje de beneficios',
      M,
      H - 50,
      { size: 7, color: INK2 },
    );
    t(doc, `municipales · ${MUNICIPALIDAD}`, M, H - 40, {
      size: 7,
      color: INK2,
    });
    t(doc, d.numero, W - M, H - 50, {
      font: 'Courier',
      size: 7,
      color: INK2,
      align: 'right',
    });
    t(doc, `Emitido ${fecha(d.emitidoEn)}`, W - M, H - 40, {
      font: 'Courier',
      size: 7,
      color: INK2,
      align: 'right',
    });
  };

  // ─── Encabezado ───
  doc.image(join(ASSETS, 'logo-ecotoken.png'), M, 34, { height: 46 });
  t(doc, 'REPORTE MENSUAL DE ACTIVIDAD', W - M, 38, {
    size: 8,
    color: INK2,
    align: 'right',
    spacing: 0.5,
  });
  t(doc, periodo, W - M, 52, {
    font: 'Helvetica-Bold',
    size: 20,
    align: 'right',
  });
  t(doc, `N° ${d.numero.replace('REP-', '')}`, W - M, 78, {
    font: 'Courier',
    size: 8,
    color: INK2,
    align: 'right',
  });
  doc
    .moveTo(M, 92)
    .lineTo(W - M, 92)
    .lineWidth(1.5)
    .stroke(GREEN);

  // ─── Datos de la organización ───
  const campo = (
    label: string,
    valor: string,
    x: number,
    y: number,
    mono = false,
  ) => {
    t(doc, label, x, y, { size: 7, color: INK2, spacing: 0.5 });
    t(doc, valor, x, y + 10, {
      font: mono ? 'Courier' : 'Helvetica',
      size: mono ? 9 : 10,
    });
  };
  const col2 = 320;
  t(doc, 'ORGANIZACIÓN', M, 104, { size: 7, color: INK2, spacing: 0.5 });
  t(doc, d.razonSocial, M, 114, { font: 'Helvetica-Bold', size: 13 });
  campo('CUIT', d.cuit, M, 136);
  campo('DIRECCIÓN', d.domicilio ?? '—', M, 162);
  campo('DIRECCIÓN EVM', corto(d.walletAddress), col2, 104, true);
  campo('FECHA DE EMISIÓN', fecha(d.emitidoEn), col2, 130);
  campo('PERIODO', `${fecha(desde)} – ${fecha(hasta)}`, col2, 156);

  // ─── 1. Entregas ───
  let y = seccion(doc, 1, 'ENTREGAS DEL MES', 196);
  const cols = {
    fecha: M + 8,
    mat: M + 80,
    kg: M + 270,
    tok: M + 365,
    tx: M + 380,
  };
  const cabecera = () => {
    doc.rect(M, y, W - 2 * M, 20).fill(GREEN);
    const h = {
      size: 7.5,
      font: 'Helvetica-Bold',
      color: '#FFFFFF',
      spacing: 0.4,
    };
    t(doc, 'FECHA', cols.fecha, y + 6, h);
    t(doc, 'MATERIAL', cols.mat, y + 6, h);
    t(doc, 'KG', cols.kg, y + 6, { ...h, align: 'right' });
    t(doc, 'TOKENS ECO', cols.tok, y + 6, { ...h, align: 'right' });
    t(doc, 'TX HASH', cols.tx + 12, y + 6, h);
    y += 20;
  };
  cabecera();
  d.entregas.forEach((e, i) => {
    if (y > H - 130) {
      piePagina();
      doc.addPage({ size: [W, H], margin: 0 });
      y = 40;
      cabecera();
    }
    if (i % 2 === 1) doc.rect(M, y, W - 2 * M, 22).fill(ZEBRA);
    t(doc, fecha(e.fecha), cols.fecha, y + 7, { font: 'Courier', size: 8 });
    t(doc, e.material, cols.mat, y + 7, { size: 9.5 });
    t(doc, `${num(e.kg, 1)} kg`, cols.kg, y + 7, {
      font: 'Courier',
      size: 8.5,
      align: 'right',
    });
    t(doc, `+ ${num(e.tokens)} ECO`, cols.tok, y + 7, {
      font: 'Courier-Bold',
      size: 8.5,
      color: GREEN,
      align: 'right',
    });
    t(doc, e.txHash ? corto(e.txHash) : 'pendiente', cols.tx + 12, y + 7, {
      font: 'Courier',
      size: 7.5,
      color: INK2,
    });
    y += 22;
  });
  const totalKg = d.entregas.reduce((s, e) => s + e.kg, 0);
  const totalTokens = d.entregas.reduce((s, e) => s + e.tokens, 0);
  if (d.entregas.length === 0) {
    t(doc, 'Sin entregas registradas en el período.', cols.fecha, y + 7, {
      size: 9,
      color: INK2,
    });
    y += 22;
  }
  doc.rect(M, y, W - 2 * M, 22).fill('#EEF5F2');
  t(doc, `Total ${periodo}`, cols.fecha, y + 7, {
    font: 'Helvetica-Bold',
    size: 9.5,
    color: GREEN,
  });
  t(doc, `${num(totalKg, 1)} kg`, cols.kg, y + 7, {
    font: 'Courier-Bold',
    size: 8.5,
    color: GREEN,
    align: 'right',
  });
  t(doc, `${num(totalTokens)} ECO`, cols.tok, y + 7, {
    font: 'Courier-Bold',
    size: 8.5,
    align: 'right',
  });
  t(doc, `${d.entregas.length} entregas`, cols.tx + 12, y + 7, {
    size: 7.5,
    color: INK2,
  });
  y += 22 + 22;

  // ─── Resto de secciones: si no entran, página nueva ───
  if (y > H - 410) {
    piePagina();
    doc.addPage({ size: [W, H], margin: 0 });
    y = 40;
  }

  // ─── 2. Resumen de tokens ───
  y = seccion(doc, 2, 'RESUMEN DE TOKENS', y);
  const saldoActual = d.saldoAnterior + totalTokens - d.canjes;
  const filas: Array<[string, string, string?]> = [
    ['Saldo anterior', `${num(d.saldoAnterior)} ECO`],
    ['Tokens acuñados este mes', `+ ${num(totalTokens)} ECO`, GREEN],
    ['Canjes realizados este mes', `- ${num(d.canjes)} ECO`],
  ];
  doc
    .rect(M, y, W - 2 * M, filas.length * 22)
    .lineWidth(0.6)
    .stroke(LINE);
  filas.forEach(([a, b, c], i) => {
    if (i === 1) doc.rect(M + 0.3, y + 22, W - 2 * M - 0.6, 22).fill(ZEBRA);
    t(doc, a, M + 10, y + 7, { size: 9.5 });
    t(doc, b, W - M - 10, y + 7, {
      font: 'Courier-Bold',
      size: 9,
      color: c ?? INK,
      align: 'right',
    });
    y += 22;
  });
  doc.rect(M, y, W - 2 * M, 34).fill(AMBER_BG);
  doc
    .moveTo(M, y)
    .lineTo(W - M, y)
    .lineWidth(1.5)
    .stroke(AMBER);
  t(doc, 'SALDO DISPONIBLE ACTUAL', M + 10, y + 12, {
    font: 'Helvetica-Bold',
    size: 9.5,
    color: AMBER,
    spacing: 0.3,
  });
  t(doc, `${num(saldoActual)} ECO`, W - M - 10, y + 9, {
    font: 'Courier-Bold',
    size: 16,
    color: AMBER,
    align: 'right',
  });
  y += 34 + 22;

  // ─── 3. Impacto ───
  y = seccion(doc, 3, 'IMPACTO AMBIENTAL', y);
  const cw = (W - 2 * M - 20) / 3;
  const tarjetas: Array<[string, string, string?, string?]> = [
    ['CO₂ EVITADO · ESTE MES', `${num(d.co2Mes, 1)} kg`],
    [`CO₂ ACUMULADO · ${d.anio}`, `${num(d.co2Anio, 1)} kg`],
    [
      'POSICIÓN EN EL RANKING',
      `#${d.posicion}`,
      `de ${d.totalEmpresas} organizaciones`,
      AMBER,
    ],
  ];
  tarjetas.forEach(([label, valor, sub, color], i) => {
    const x = M + i * (cw + 10);
    doc.rect(x, y, cw, 62).lineWidth(0.6).stroke(LINE);
    t(doc, label.replace('CO₂', 'CO2'), x + 10, y + 10, {
      size: 7,
      color: INK2,
      spacing: 0.3,
    });
    t(doc, valor, x + 10, y + 24, {
      font: 'Helvetica-Bold',
      size: 20,
      color: color ?? GREEN,
    });
    if (sub) t(doc, sub, x + 10, y + 48, { size: 8, color: INK2 });
  });
  y += 62 + 22;

  // ─── 4. Verificación ───
  y = seccion(doc, 4, 'VERIFICACIÓN ON-CHAIN', y);
  doc.rect(M, y, W - 2 * M, 84).fill(ZEBRA);
  doc.image(qr, M + 10, y + 8, { width: 68 });
  const tx = M + 94;
  t(
    doc,
    'Todos los registros de este reporte son verificables públicamente en la red blockchain.',
    tx,
    y + 14,
    { size: 9 },
  );
  t(doc, `Data Hash: ${corto(d.hashVerificacion)}`, tx, y + 34, {
    font: 'Courier',
    size: 7.5,
    color: INK2,
  });
  t(
    doc,
    `Verificado y emitido por ${COOPERATIVA} · EcoToken V1.0`,
    tx,
    y + 50,
    { size: 8, color: INK2 },
  );
  t(doc, 'Escaneá el QR para validar el certificado del período.', tx, y + 62, {
    size: 8,
    color: INK2,
  });

  piePagina();
  doc.end();
  return listo;
}
