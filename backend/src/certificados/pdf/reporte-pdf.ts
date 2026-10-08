import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { join } from 'node:path';

// Réplica de doc/assets/ECOToken/screens/report.jsx (reporte mensual de
// actividad). Mismo lienzo (794x1123 "px" @ 96dpi = A4 vertical) y mismas
// medidas que el JSX: se dibuja con los números tal cual y se escala la
// página entera ×0.75 (96dpi -> 72dpi). Igual que certificado-pdf.ts, los
// textos no pasan `width` a doc.text() (ver el comentario de ese archivo).
// Las coordenadas `y` de los textos son el borde superior de la caja CSS.
const W = 794;
const H = 1123;
const SCALE = 0.75;
const PAD_X = 46;
const GREEN = '#0F6E56';
const AMBER = '#BA7517';
const INK = '#1A1A1A';
const INK2 = '#5A5A5A';
const ROW_ALT = '#F5F5F2';
const BORDER = '#D9D9D5';
const ROW_LINE = '#E6E6E2';
const CONTENT_W = W - 2 * PAD_X;
const FOOTER_TOP = H - 32 - 42; // línea superior del pie
const LIMITE = FOOTER_TOP - 20; // hasta dónde puede llegar el contenido
const ASSETS = join(__dirname, 'assets');

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
  /** Base del explorador de bloques (p. ej. https://sepolia.etherscan.io). */
  explorerUrl: string;
  emitidoEn: Date;
}

const num = (n: number, dec = 0) =>
  n.toLocaleString('es-AR', { maximumFractionDigits: dec });
const dos = (n: number) => String(n).padStart(2, '0');

/** Partes de fecha/hora en horario de Argentina (las entregas se guardan en UTC). */
function partes(d: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Cordoba',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return p as Record<'day' | 'month' | 'year' | 'hour' | 'minute', string>;
}
const fechaEspaciada = (d: Date) => {
  const p = partes(d);
  return `${p.day} / ${p.month} / ${p.year}`;
};
/** Hace clickeable el rectángulo y lo subraya fino, para que se note que es un enlace. */
function enlace(
  doc: PDFKit.PDFDocument,
  url: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  doc.link(x, y, w, h, url);
  doc
    .moveTo(x, y + h - 1)
    .lineTo(x + w, y + h - 1)
    .lineWidth(0.5)
    .stroke(GREEN);
}
const corto = (h: string) =>
  h.length > 16 ? `${h.slice(0, 9)}…${h.slice(-4)}` : h;

interface Estilo {
  font?: string;
  size?: number;
  color?: string;
  align?: 'left' | 'right';
  spacing?: number;
}

/**
 * Una línea de texto. `y` es el borde superior de la caja de línea; `x` es el
 * borde izquierdo (o derecho con align 'right'). El "₂" no existe en las
 * fuentes estándar del PDF, así que se dibuja un "2" chico y bajado.
 */
function t(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  e: Estilo = {},
) {
  const size = e.size ?? 10;
  const opts: PDFKit.Mixins.TextOptions = { lineBreak: false };
  if (e.spacing) opts.characterSpacing = e.spacing;
  doc
    .font(e.font ?? 'Helvetica')
    .fontSize(size)
    .fillColor(e.color ?? INK);
  const top = y + size * 0.23;
  const w = (s: string, sz = size) =>
    doc.fontSize(sz).widthOfString(s, opts) + 0;
  let cursor = e.align === 'right' ? x - w(text.replace('₂', '2')) : x;
  const trozos = text.split('₂');
  trozos.forEach((trozo, i) => {
    if (i > 0) {
      doc.fontSize(size * 0.7).text('2', cursor, top + size * 0.28, opts);
      cursor += w('2', size * 0.7);
    }
    doc.fontSize(size).text(trozo, cursor, top, opts);
    cursor += w(trozo);
  });
  return cursor;
}

function seccion(
  doc: PDFKit.PDFDocument,
  n: number,
  titulo: string,
  y: number,
) {
  y += 22;
  doc.rect(PAD_X, y, 22, 22).fill(GREEN);
  t(doc, String(n), PAD_X + 11 - 3, y + 5.5, {
    font: 'Helvetica-Bold',
    size: 11,
    color: '#FFFFFF',
  });
  const fin = t(doc, titulo.toUpperCase(), PAD_X + 32, y + 3, {
    font: 'Helvetica-Bold',
    size: 13,
    color: GREEN,
    spacing: 0.2,
  });
  doc
    .moveTo(fin + 10, y + 11)
    .lineTo(W - PAD_X, y + 11)
    .lineWidth(1)
    .strokeColor(GREEN)
    .strokeOpacity(0.19)
    .stroke()
    .strokeOpacity(1);
  return y + 22 + 10;
}

function campo(
  doc: PDFKit.PDFDocument,
  label: string,
  valor: string,
  x: number,
  y: number,
  o: { big?: boolean; mono?: boolean } = {},
) {
  t(doc, label.toUpperCase(), x, y, {
    size: 8.5,
    color: INK2,
    font: 'Helvetica-Bold',
    spacing: 0.5,
  });
  const size = o.big ? 13 : 11;
  t(doc, valor, x, y + 10.3 + 1, {
    font: o.mono ? 'Courier' : o.big ? 'Helvetica-Bold' : 'Helvetica',
    size: o.mono ? 10.5 : size,
  });
  return y + 10.3 + 1 + size * 1.2 + 6;
}

export async function generarReportePdf(d: DatosReportePdf): Promise<Buffer> {
  const qr = await QRCode.toBuffer(d.urlVerificacion, {
    margin: 1,
    width: 400,
    color: { dark: GREEN, light: '#FFFFFF' },
  });

  const doc = new PDFDocument({ size: [W * SCALE, H * SCALE], margin: 0 });
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const listo = new Promise<Buffer>((resolve) =>
    doc.on('end', () => resolve(Buffer.concat(chunks))),
  );

  const periodo = `${MESES[d.mes - 1]} ${d.anio}`;
  const ultimoDia = new Date(Date.UTC(d.anio, d.mes, 0)).getUTCDate();
  const emision = partes(d.emitidoEn);

  const pie = () => {
    doc
      .moveTo(PAD_X, FOOTER_TOP)
      .lineTo(W - PAD_X, FOOTER_TOP)
      .lineWidth(1)
      .stroke(BORDER);
    const y = FOOTER_TOP + 1 + 14;
    t(
      doc,
      'Este reporte acredita el saldo de tokens ECO disponibles para canje de beneficios',
      PAD_X,
      y,
      { size: 9, color: INK2, spacing: 0.2 },
    );
    const fin = t(doc, 'municipales · ', PAD_X, y + 13.5, {
      size: 9,
      color: INK2,
      spacing: 0.2,
    });
    t(doc, 'Municipalidad de Villa María', fin, y + 13.5, {
      font: 'Helvetica-Bold',
      size: 9,
      color: INK,
      spacing: 0.2,
    });
    t(doc, d.numero, W - PAD_X, y, {
      font: 'Courier',
      size: 9,
      color: INK2,
      align: 'right',
    });
    t(
      doc,
      `Emitido ${emision.day}/${emision.month}/${emision.year} ${emision.hour}:${emision.minute}`,
      W - PAD_X,
      y + 13.5,
      { font: 'Courier', size: 9, color: INK2, align: 'right' },
    );
  };
  const paginaNueva = () => {
    pie();
    doc.addPage({ size: [W * SCALE, H * SCALE], margin: 0 });
    doc.scale(SCALE);
    return 40;
  };

  doc.scale(SCALE);
  doc.rect(0, 0, W, H).fill('#FFFFFF');

  // ─── Encabezado ───
  doc.image(join(ASSETS, 'logo-ecotoken.png'), PAD_X, 40, { height: 56 });
  t(doc, 'REPORTE MENSUAL DE ACTIVIDAD', W - PAD_X, 40, {
    font: 'Helvetica-Bold',
    size: 9,
    color: INK2,
    align: 'right',
    spacing: 0.4,
  });
  t(doc, periodo, W - PAD_X, 40 + 11 + 3, {
    font: 'Helvetica-Bold',
    size: 18,
    align: 'right',
    spacing: -0.4,
  });
  t(
    doc,
    `N° ${d.numero.replace('REP-', '')}`,
    W - PAD_X,
    40 + 11 + 3 + 22 + 4,
    {
      font: 'Courier',
      size: 10,
      color: INK2,
      align: 'right',
    },
  );
  doc
    .moveTo(PAD_X, 40 + 56 + 16 + 1)
    .lineTo(W - PAD_X, 40 + 56 + 16 + 1)
    .lineWidth(2)
    .stroke(GREEN);

  // ─── Datos de la organización (2 columnas, gap 14) ───
  const col2 = PAD_X + (CONTENT_W - 14) / 2 + 14;
  let y1 = 128 + 14 - 14;
  y1 = campo(doc, 'Organización', d.razonSocial, PAD_X, 128, { big: true });
  y1 = campo(doc, 'CUIT', d.cuit, PAD_X, y1);
  y1 = campo(doc, 'Dirección', d.domicilio ?? '—', PAD_X, y1);
  let y2 = campo(doc, 'Dirección EVM', corto(d.walletAddress), col2, 128, {
    mono: true,
  });
  y2 = campo(
    doc,
    'Fecha de emisión',
    `${emision.day} / ${emision.month} / ${emision.year}`,
    col2,
    y2,
  );
  y2 = campo(
    doc,
    'Periodo',
    `01/${dos(d.mes)}/${d.anio} – ${ultimoDia}/${dos(d.mes)}/${d.anio}`,
    col2,
    y2,
  );
  let y = Math.max(y1, y2) - 6;

  // ─── 1. Entregas del mes ───
  y = seccion(doc, 1, 'Entregas del mes', y);
  const anchos = [0.15, 0.2, 0.13, 0.22, 0.3].map((p) => p * CONTENT_W);
  const xs = anchos.reduce<number[]>(
    (acc, w, i) => [...acc, acc[i] + w],
    [PAD_X],
  );
  const cabecera = () => {
    const alto = 8 + 11.4 + 8;
    doc.rect(PAD_X, y, CONTENT_W, alto).fill(GREEN);
    const h = {
      font: 'Helvetica-Bold',
      size: 9.5,
      color: '#FFFFFF',
      spacing: 0.4,
    };
    t(doc, 'FECHA', xs[0] + 8, y + 8, h);
    t(doc, 'MATERIAL', xs[1] + 8, y + 8, h);
    t(doc, 'KG', xs[3] - 8, y + 8, { ...h, align: 'right' });
    t(doc, 'TOKENS ECO', xs[4] - 8, y + 8, { ...h, align: 'right' });
    t(doc, 'TX HASH', xs[4] + 8, y + 8, h);
    y += alto;
  };
  cabecera();
  const FILA = 9 + 12.6 + 9 + 1;
  d.entregas.forEach((e, i) => {
    if (y + FILA > LIMITE) {
      y = paginaNueva();
      cabecera();
    }
    doc.rect(PAD_X, y, CONTENT_W, FILA).fill(i % 2 === 1 ? ROW_ALT : '#FFFFFF');
    doc
      .moveTo(PAD_X, y + FILA - 0.5)
      .lineTo(W - PAD_X, y + FILA - 0.5)
      .lineWidth(1)
      .stroke(ROW_LINE);
    t(doc, fechaEspaciada(e.fecha), xs[0] + 8, y + 9, {
      font: 'Courier',
      size: 10,
    });
    t(doc, e.material, xs[1] + 8, y + 9, { size: 10.5 });
    t(doc, `${num(e.kg, 1)} kg`, xs[3] - 8, y + 9, {
      font: 'Courier',
      size: 10.5,
      align: 'right',
    });
    t(doc, `+ ${num(e.tokens)} ECO`, xs[4] - 8, y + 9, {
      font: 'Courier-Bold',
      size: 10.5,
      color: GREEN,
      align: 'right',
    });
    const txX = xs[4] + 8;
    const txFin = t(doc, e.txHash ? corto(e.txHash) : 'pendiente', txX, y + 9, {
      font: 'Courier',
      size: 9.5,
      color: e.txHash ? GREEN : INK2,
    });
    // La pestaña de logs de Etherscan muestra el evento on-chain de la entrega.
    if (e.txHash) {
      enlace(
        doc,
        `${d.explorerUrl}/tx/${e.txHash}#eventlog`,
        txX,
        y + 9,
        txFin - txX,
        12.6,
      );
    }
    y += FILA;
  });
  if (d.entregas.length === 0) {
    t(doc, 'Sin entregas registradas en el período.', xs[0] + 8, y + 9, {
      size: 10.5,
      color: INK2,
    });
    y += FILA;
  }
  const totalKg = d.entregas.reduce((s, e) => s + e.kg, 0);
  const totalTokens = d.entregas.reduce((s, e) => s + e.tokens, 0);
  const altoTotal = 10 + 13.2 + 10 + 1.5;
  doc.rect(PAD_X, y, CONTENT_W, altoTotal).fill('#EAF2EF');
  doc
    .moveTo(PAD_X, y + 0.75)
    .lineTo(W - PAD_X, y + 0.75)
    .lineWidth(1.5)
    .stroke(GREEN);
  t(doc, `Total ${periodo}`, xs[0] + 8, y + 11.5, {
    font: 'Helvetica-Bold',
    size: 11,
    color: GREEN,
  });
  t(doc, `${num(totalKg, 1)} kg`, xs[3] - 8, y + 11.5, {
    font: 'Helvetica-Bold',
    size: 10.5,
    color: GREEN,
    align: 'right',
  });
  t(doc, `${num(totalTokens)} ECO`, xs[4] - 8, y + 11.5, {
    font: 'Helvetica-Bold',
    size: 10.5,
    color: GREEN,
    align: 'right',
  });
  t(
    doc,
    `${d.entregas.length} ${d.entregas.length === 1 ? 'entrega verificada' : 'entregas verificadas'}`,
    xs[4] + 8,
    y + 12.5,
    { size: 9, color: INK2 },
  );
  y += altoTotal;

  // Las secciones 2-4 miden ~430: si no entran en esta página, van a la siguiente.
  if (y + 430 > LIMITE) y = paginaNueva() - 22;

  // ─── 2. Resumen de tokens ───
  y = seccion(doc, 2, 'Resumen de tokens', y);
  const saldoActual = d.saldoAnterior + totalTokens - d.canjes;
  const filas: Array<[string, string, boolean]> = [
    ['Saldo anterior', `${num(d.saldoAnterior)} ECO`, false],
    ['Tokens acuñados este mes', `+ ${num(totalTokens)} ECO`, true],
    ['Canjes realizados este mes', `- ${num(d.canjes)} ECO`, false],
  ];
  const tablaTop = y;
  filas.forEach(([label, valor, pos], i) => {
    const alto = 10 + 13.2 + 10 + 1;
    doc.rect(PAD_X, y, CONTENT_W, alto).fill(i === 1 ? ROW_ALT : '#FFFFFF');
    doc
      .moveTo(PAD_X, y + alto - 0.5)
      .lineTo(W - PAD_X, y + alto - 0.5)
      .lineWidth(1)
      .stroke(ROW_LINE);
    t(doc, label, PAD_X + 13, y + 10, { size: 11 });
    t(doc, valor, W - PAD_X - 13, y + 10, {
      font: 'Courier-Bold',
      size: 11,
      color: pos ? GREEN : INK,
      align: 'right',
    });
    y += alto;
  });
  const altoSaldo = 12 + 21.6 + 12 + 2;
  doc.rect(PAD_X, y, CONTENT_W, altoSaldo).fill('#F8F1E7');
  doc
    .moveTo(PAD_X, y + 1)
    .lineTo(W - PAD_X, y + 1)
    .lineWidth(2)
    .stroke(AMBER);
  t(doc, 'SALDO DISPONIBLE ACTUAL', PAD_X + 13, y + 16, {
    font: 'Helvetica-Bold',
    size: 11,
    color: AMBER,
    spacing: 0.2,
  });
  t(doc, `${num(saldoActual)} ECO`, W - PAD_X - 13, y + 14, {
    font: 'Courier-Bold',
    size: 18,
    color: AMBER,
    align: 'right',
    spacing: -0.3,
  });
  y += altoSaldo;
  doc
    .rect(PAD_X, tablaTop, CONTENT_W, y - tablaTop)
    .lineWidth(1)
    .stroke(BORDER);

  // ─── 3. Impacto ambiental ───
  y = seccion(doc, 3, 'Impacto ambiental', y);
  const cw = (CONTENT_W - 24) / 3;
  const cajas: Array<[string, string, string | undefined, string]> = [
    ['CO₂ evitado · este mes', `${num(d.co2Mes, 1)} kg`, undefined, GREEN],
    [`CO₂ acumulado · ${d.anio}`, `${num(d.co2Anio, 1)} kg`, undefined, GREEN],
    [
      'Posición en el ranking',
      `#${d.posicion}`,
      `de ${d.totalEmpresas} ${d.totalEmpresas === 1 ? 'organización' : 'organizaciones'}`,
      AMBER,
    ],
  ];
  const altoCaja = 14 + 10.8 + 6 + 28.8 + 13.4 + 14;
  cajas.forEach(([label, valor, sub, color], i) => {
    const x = PAD_X + i * (cw + 12);
    doc.rect(x, y, cw, altoCaja).lineWidth(1).stroke(BORDER);
    t(doc, label.toUpperCase(), x + 15, y + 15, {
      font: 'Helvetica-Bold',
      size: 9,
      color: INK2,
      spacing: 0.5,
    });
    t(doc, valor, x + 15, y + 14 + 10.8 + 6 + 1, {
      font: 'Helvetica-Bold',
      size: 24,
      color,
      spacing: -0.6,
    });
    if (sub) {
      t(doc, sub, x + 15, y + 14 + 10.8 + 6 + 28.8 + 2, {
        size: 9.5,
        color: INK2,
      });
    }
  });
  y += altoCaja;

  // ─── 4. Verificación on-chain ───
  y = seccion(doc, 4, 'Verificación on-chain', y);
  const altoVer = 14 + 78 + 14 + 2;
  doc.rect(PAD_X, y, CONTENT_W, altoVer).fillAndStroke('#FAFAF8', BORDER);
  doc.image(qr, PAD_X + 15, y + 15, { width: 78 });
  const tx = PAD_X + 15 + 78 + 16;
  const ty = y + 15 + (78 - 56.25) / 2;
  t(
    doc,
    'Todos los registros de este reporte son verificables públicamente en la red blockchain Sepolia.',
    tx,
    ty,
    { size: 10.5 },
  );
  const hashY = ty + 15.75 + 8;
  const fin = t(doc, 'Data Hash: ', tx, hashY, {
    font: 'Courier',
    size: 9.5,
    color: INK2,
  });
  const hashFin = t(
    doc,
    `0x${d.hashVerificacion.slice(0, 28)}…${d.hashVerificacion.slice(-4)}`,
    fin,
    hashY,
    { font: 'Courier', size: 9.5, color: GREEN },
  );
  enlace(doc, d.urlVerificacion, fin, hashY, hashFin - fin, 13);
  doc.link(PAD_X + 15, y + 15, 78, 78, d.urlVerificacion);
  const fin2 = t(
    doc,
    'Verificado y emitido por ',
    tx,
    ty + 15.75 + 8 + 14.25 + 4,
    {
      size: 9.5,
      color: INK2,
    },
  );
  const fin3 = t(doc, 'EcoToken', fin2, ty + 15.75 + 8 + 14.25 + 4, {
    font: 'Helvetica-Bold',
    size: 9.5,
    color: INK,
  });
  t(doc, ' · V1.0', fin3, ty + 15.75 + 8 + 14.25 + 4, {
    size: 9.5,
    color: INK2,
  });

  pie();
  doc.end();
  return listo;
}
