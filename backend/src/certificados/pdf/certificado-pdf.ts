import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { join } from 'node:path';
import type { DesgloseMaterial } from '../desglose-material';

// Réplica de doc/assets/ECOToken/screens/certificate.jsx (E8-HU02). Mismo
// lienzo (1123x794 "px" @ 96dpi = A4 horizontal) y mismas coordenadas que el
// diseño original; 96dpi -> 72dpi (puntos PDF) es exactamente ×0.75, así que
// se dibuja con los números tal cual del JSX y se escala la página entera.
//
// Los textos NUNCA pasan `width` a doc.text(): con `width` seteado, pdfkit
// enruta por LineWrapper, que decide el salto de página comparando `doc.y`
// (en este espacio de 0-794) contra el alto REAL de página (595, ya
// escalado) — sin enterarse del doc.scale() de más abajo. Con `width`
// activo, hasta con lineBreak:false igual se cuelga en un loop de "salto de
// página" infinito. Por eso: centrado manual vía widthOfString().
const W = 1123;
const H = 794;
const SCALE = 0.75;
const GREEN = '#0F6E56';
const AMBER = '#BA7517';
const AMBER_BG = '#FAF1E4';
const INK = '#1A1A1A';
const INK2 = '#5A5A5A';
const ASSETS = join(__dirname, 'assets');

// ponytail: un solo municipio/cooperativa por ahora (confirmado por el
// cliente) — si el sistema pasa a multi-tenant, esto sale de datos reales
// (Municipalidad/Empresa categoría COOPERATIVA) en vez de venir fijo.
const MUNICIPALIDAD = 'Municipalidad de Villa María';
const COOPERATIVA = 'Cooperativa 7 de Febrero';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const MATERIAL_ICONOS: Record<
  string,
  { label: string; paths: string[]; viewBox: [number, number]; dash?: string }
> = {
  PLASTICO: {
    label: 'Plástico PET',
    viewBox: [36, 44],
    paths: [
      'M13 4 h10 v3 h-10 z',
      'M11 7 h14 l-1 32 a3 3 0 0 1 -3 3 h-6 a3 3 0 0 1 -3 -3 z',
      'M14 14 h8 M14 22 h8 M14 30 h8',
    ],
  },
  CARTON: {
    label: 'Cartón',
    viewBox: [40, 40],
    paths: ['M5 12 l15 -7 l15 7 v22 l-15 7 l-15 -7 z', 'M5 12 l15 7 l15 -7', 'M20 19 v22'],
    dash: 'M12 8.5 l15 7',
  },
  VIDRIO: {
    label: 'Vidrio',
    viewBox: [32, 44],
    paths: [
      'M13 3 h6 v8 l4 5 v22 a3 3 0 0 1 -3 3 h-8 a3 3 0 0 1 -3 -3 v-22 l4 -5 z',
      'M9 22 h14',
    ],
  },
};

export interface DatosCertificadoPdf {
  razonSocial: string;
  mes: number;
  anio: number;
  posicion: number;
  totalEmpresas: number;
  kgReciclados: number;
  co2Evitado: number;
  desglosePorMaterial: DesgloseMaterial[];
  hashVerificacion: string;
  urlVerificacion: string;
}

function fmt(n: number): string {
  return n.toLocaleString('es-AR', { maximumFractionDigits: 1 });
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Dibuja texto de una sola línea centrado en `cx`, sin pasar por LineWrapper. */
function textoCentrado(
  doc: PDFKit.PDFDocument,
  text: string,
  cx: number,
  y: number,
  opts: {
    font: string;
    size: number;
    color: string;
    characterSpacing?: number;
  },
) {
  doc.font(opts.font).fontSize(opts.size).fillColor(opts.color);
  const textOpts: PDFKit.Mixins.TextOptions = { lineBreak: false };
  if (opts.characterSpacing) textOpts.characterSpacing = opts.characterSpacing;
  const w = doc.widthOfString(text, textOpts);
  doc.text(text, cx - w / 2, y, textOpts);
}

function drawMaterialIcon(
  doc: PDFKit.PDFDocument,
  kind: string,
  slotX: number,
  slotY: number,
) {
  const icono = MATERIAL_ICONOS[kind];
  if (!icono) return;
  const [vw, vh] = icono.viewBox;
  const offsetX = slotX + (90 - vw) / 2;
  const offsetY = slotY + (48 - vh) / 2;

  doc.save();
  doc.translate(offsetX, offsetY);
  doc.lineJoin('round');
  for (const d of icono.paths) {
    doc.path(d).lineWidth(1.5).stroke(GREEN);
  }
  if (icono.dash) {
    doc.dash(2, { space: 2 }).path(icono.dash).lineWidth(1.5).stroke(GREEN);
    doc.undash();
  }
  doc.restore();
}

/** Coloca cada carácter de `text` a lo largo de un arco (E8-HU02, sello). */
function textoEnArco(
  doc: PDFKit.PDFDocument,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  fromDeg: number,
  toDeg: number,
  opts: { font: string; size: number; color: string; flip?: boolean },
) {
  doc.font(opts.font).fontSize(opts.size);
  const n = text.length;
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const deg = fromDeg + t * (toDeg - fromDeg);
    const rad = (deg * Math.PI) / 180;
    const x = cx + radius * Math.cos(rad);
    const y = cy + radius * Math.sin(rad);
    const w = doc.widthOfString(text[i], { lineBreak: false });
    doc.save();
    doc.rotate(deg + 90 + (opts.flip ? 180 : 0), { origin: [x, y] });
    doc.fillColor(opts.color);
    doc.text(text[i], x - w / 2, y - opts.size / 2, { lineBreak: false });
    doc.restore();
  }
}

function drawSelloVerificado(
  doc: PDFKit.PDFDocument,
  cx: number,
  cy: number,
  mesNombre: string,
  anio: number,
) {
  doc.save();
  doc.lineWidth(1.5).circle(cx, cy, 60).stroke(GREEN);
  doc.lineWidth(0.6).circle(cx, cy, 52).stroke(GREEN);

  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    doc
      .moveTo(cx + Math.cos(a) * 52, cy + Math.sin(a) * 52)
      .lineTo(cx + Math.cos(a) * 55, cy + Math.sin(a) * 55)
      .lineWidth(0.8)
      .stroke(GREEN);
  }

  textoEnArco(doc, 'VERIFICADO ON-CHAIN', cx, cy, 41, 180, 360, {
    font: 'Helvetica-Bold',
    size: 7,
    color: GREEN,
  });
  textoEnArco(doc, COOPERATIVA.toUpperCase(), cx, cy, 41, 180, 0, {
    font: 'Helvetica',
    size: 6,
    color: GREEN,
    flip: true,
  });

  doc.translate(cx - 14, cy - 27);
  doc.scale(28 / 24);
  doc
    .lineWidth(2)
    .lineCap('round')
    .lineJoin('round')
    .path('M5 12l5 5L20 7')
    .stroke(GREEN);
  doc.restore();

  // Tamaño de fuente variable: meses largos ("Septiembre") no chocan con el
  // arco de texto que lo rodea.
  textoCentrado(doc, capitalizar(mesNombre), cx, cy + 3, {
    font: 'Helvetica-Bold',
    size: mesNombre.length > 7 ? 11 : 14,
    color: GREEN,
  });
  textoCentrado(doc, String(anio), cx, cy + 17, {
    font: 'Helvetica-Bold',
    size: 9,
    color: GREEN,
  });
}

/** PDF del certificado mensual (E8-HU02): réplica de certificate.jsx con datos reales. */
export async function generarCertificadoPdf(
  datos: DatosCertificadoPdf,
): Promise<Buffer> {
  // Resolución alta (el PNG se muestra achicado en el PDF) + quiet zone
  // (margin) real, sin la cual muchos lectores de QR no lo detectan.
  const qrPng = await QRCode.toBuffer(datos.urlVerificacion, {
    margin: 2,
    width: 400,
    color: { dark: GREEN, light: '#FFFFFF' },
  });

  const doc = new PDFDocument({
    size: [W * SCALE, H * SCALE],
    margin: 0,
  });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const listo = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  doc.scale(SCALE);
  doc.rect(0, 0, W, H).fill('#FFFFFF');

  // ─── Borde decorativo + esquinas ───
  doc.rect(18, 18, W - 36, H - 36).lineWidth(1.5).stroke(GREEN);
  doc.rect(24, 24, W - 48, H - 48).lineWidth(0.5).stroke(GREEN);
  for (const [cx, cy] of [
    [24, 24],
    [W - 24, 24],
    [24, H - 24],
    [W - 24, H - 24],
  ]) {
    doc.rect(cx - 2, cy - 2, 4, 4).fill(GREEN);
  }

  // ─── HEADER: 3 logos ───
  const colW = (W - 100) / 3;
  doc.image(join(ASSETS, 'logo-ecotoken.png'), 50, 50, { height: 56 });

  doc.image(
    join(ASSETS, 'logo-villa-maria.png'),
    50 + colW + (colW - 174) / 2,
    52,
    { width: 174, height: 52 },
  );

  const col3Right = 50 + colW * 3;
  doc.save();
  doc.circle(col3Right - 172 + 26, 52 + 26, 26).clip();
  doc.image(join(ASSETS, 'logo-cooperativa.jpg'), col3Right - 172, 52, {
    width: 52,
    height: 52,
  });
  doc.restore();
  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor(INK)
    .text('Cooperativa', col3Right - 110, 60, { lineBreak: false });
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(INK2)
    .text('7 de Febrero · Villa María', col3Right - 110, 76, {
      lineBreak: false,
    });

  doc
    .moveTo(50, 124)
    .lineTo(W - 50, 124)
    .lineWidth(0.5)
    .strokeOpacity(0.33)
    .stroke(GREEN)
    .strokeOpacity(1);

  // ─── TITLE ───
  const centroX = W / 2;
  textoCentrado(doc, 'OTORGA EL PRESENTE', centroX, 148, {
    font: 'Helvetica-Bold',
    size: 11,
    color: AMBER,
    characterSpacing: 3,
  });
  textoCentrado(doc, 'Certificado de Impacto Ambiental', centroX, 164, {
    font: 'Helvetica-Bold',
    size: 38,
    color: GREEN,
  });
  const nombreMes = MESES[datos.mes - 1];
  textoCentrado(
    doc,
    `${capitalizar(nombreMes)} ${datos.anio} · Villa María, Córdoba`,
    centroX,
    222,
    { font: 'Helvetica', size: 13, color: INK2 },
  );

  // ─── CENTRAL TEXT (único bloque que sí puede envolver en varias líneas) ───
  doc.font('Helvetica').fontSize(14).fillColor(INK);
  doc.text(
    `La ${MUNICIPALIDAD} y la ${COOPERATIVA} certifican que ${datos.razonSocial} colaboró ` +
      `activamente con el cuidado del medio ambiente durante el mes de ${nombreMes} de ${datos.anio}, ` +
      `reciclando ${fmt(datos.kgReciclados)} kg de materiales y evitando la emisión de ` +
      `${fmt(datos.co2Evitado)} kg de CO2 equivalente a la atmósfera.`,
    152,
    276,
    { width: 820, align: 'center', lineGap: 4 },
  );

  // ─── METRICS ROW ───
  const clavesMaterial = ['PLASTICO', 'CARTON', 'VIDRIO'];
  const porMaterial = new Map(
    datos.desglosePorMaterial.map((d) => [d.material, d.kg]),
  );
  const metricsY = 362;
  clavesMaterial.forEach((key, i) => {
    const slotX = 270 + i * (90 + 24);
    drawMaterialIcon(doc, key, slotX, metricsY);
    const kg = porMaterial.get(key) ?? 0;
    textoCentrado(doc, `${fmt(kg)} kg`, slotX + 45, metricsY + 54, {
      font: 'Helvetica-Bold',
      size: 18,
      color: GREEN,
    });
    textoCentrado(
      doc,
      MATERIAL_ICONOS[key].label.toUpperCase(),
      slotX + 45,
      metricsY + 78,
      { font: 'Helvetica', size: 10, color: INK2 },
    );
  });

  doc
    .moveTo(613, metricsY + 8)
    .lineTo(613, metricsY + 86)
    .lineWidth(1)
    .strokeOpacity(0.2)
    .stroke(GREEN)
    .strokeOpacity(1);

  const bigMetricCx = 645 + 100;
  textoCentrado(doc, 'CO2 EVITADO', bigMetricCx, metricsY + 8, {
    font: 'Helvetica-Bold',
    size: 10,
    color: AMBER,
    characterSpacing: 1.5,
  });
  textoCentrado(doc, `${fmt(datos.co2Evitado)} kg`, bigMetricCx, metricsY + 24, {
    font: 'Helvetica-Bold',
    size: 44,
    color: GREEN,
  });
  textoCentrado(doc, 'equivalente atmosférico', bigMetricCx, metricsY + 74, {
    font: 'Helvetica',
    size: 11,
    color: INK2,
  });

  // ─── RANKING BADGE ───
  const badgeTexto = `Posición #${datos.posicion} de ${datos.totalEmpresas} organizaciones · ${capitalizar(nombreMes)} ${datos.anio}`;
  doc.font('Helvetica-Bold').fontSize(12);
  const textoAncho = doc.widthOfString(badgeTexto, { lineBreak: false });
  const badgeAncho = 16 + 14 + 10 + textoAncho + 16;
  const badgeX = (W - badgeAncho) / 2;
  const badgeY = 488;
  doc
    .roundedRect(badgeX, badgeY, badgeAncho, 30, 4)
    .fillAndStroke(AMBER_BG, AMBER);
  doc.save();
  doc.translate(badgeX + 16, badgeY + 8);
  doc.lineWidth(2).lineCap('round').lineJoin('round');
  doc
    .path(
      'M8 4h8v5a4 4 0 0 1-8 0zM6 6H4v2a3 3 0 0 0 3 3M18 6h2v2a3 3 0 0 1-3 3M9 14v2h6v-2M8 20h8',
    )
    .stroke(AMBER);
  doc.restore();
  doc
    .fillColor(AMBER)
    .text(badgeTexto, badgeX + 16 + 14 + 10, badgeY + 9, { lineBreak: false });

  // ─── FOOTER ───
  const footerBottom = H - 50;
  const stampCx = W / 2;
  const stampCy = footerBottom - 65;

  drawSelloVerificado(doc, stampCx, stampCy, nombreMes, datos.anio);

  const QR_SIZE = 110;
  const qrCx = stampCx - 60 - 18 - QR_SIZE / 2;
  const qrTop = footerBottom - QR_SIZE - 28;

  // Clic o escaneo llevan al mismo lado: en pantalla es un link real, en
  // papel es el QR. Cubre el QR + los dos textos, todo bajo una sola área.
  doc.link(qrCx - 70, qrTop, 140, footerBottom - qrTop, datos.urlVerificacion);

  doc.image(qrPng, qrCx - QR_SIZE / 2, qrTop, {
    width: QR_SIZE,
    height: QR_SIZE,
  });
  textoCentrado(doc, 'Escaneá o tocá para verificar', qrCx, footerBottom - 25, {
    font: 'Helvetica',
    size: 9,
    color: GREEN,
  });
  const hashCorto = `${datos.hashVerificacion.slice(0, 8)}…${datos.hashVerificacion.slice(-6)}`;
  textoCentrado(doc, hashCorto, qrCx, footerBottom - 13, {
    font: 'Courier',
    size: 8,
    color: INK2,
  });

  const sigWidth = 240;
  const sigLeftCx = 50 + sigWidth / 2;
  doc
    .moveTo(50, footerBottom - 32)
    .lineTo(50 + sigWidth, footerBottom - 32)
    .lineWidth(0.8)
    .stroke(INK);
  textoCentrado(doc, MUNICIPALIDAD, sigLeftCx, footerBottom - 26, {
    font: 'Helvetica-Bold',
    size: 11,
    color: INK,
  });
  textoCentrado(
    doc,
    'INTENDENTE DE LA CIUDAD',
    sigLeftCx,
    footerBottom - 12,
    { font: 'Helvetica', size: 9, color: INK2, characterSpacing: 0.5 },
  );

  const sigRightCx = W - 50 - sigWidth / 2;
  doc
    .moveTo(W - 50 - sigWidth, footerBottom - 32)
    .lineTo(W - 50, footerBottom - 32)
    .lineWidth(0.8)
    .stroke(INK);
  textoCentrado(doc, COOPERATIVA, sigRightCx, footerBottom - 26, {
    font: 'Helvetica-Bold',
    size: 11,
    color: INK,
  });
  textoCentrado(
    doc,
    'RECOLECCIÓN Y VERIFICACIÓN',
    sigRightCx,
    footerBottom - 12,
    { font: 'Helvetica', size: 9, color: INK2, characterSpacing: 0.5 },
  );

  doc.end();
  return listo;
}
