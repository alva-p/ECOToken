// Exportaciones del Panel de Gestión Ambiental. Ambas respetan los filtros
// activos: reciben los aportes del período ya filtrados.
//  - CSV: datos crudos, un renglón por aporte (para otros sistemas).
//  - Excel: informe con diseño, una hoja por vista del dashboard.
import type { Cell, Worksheet } from 'exceljs';
import {
  hoy,
  nombreMaterial,
  porMaterial,
  porMes,
  porOrganizacion,
  resumir,
  type Aporte,
  type Filtros,
} from './data';

function nombreArchivo(f: Filtros, ext: string) {
  const sufijo = [f.desde || 'inicio', f.hasta || hoy(), f.material]
    .filter(Boolean)
    .join('_');
  return `gestion-ambiental_${sufijo}.${ext}`;
}

function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

const fecha = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');

function describirFiltros(f: Filtros) {
  return [
    `Período: ${f.desde ? fecha(f.desde) : 'inicio'} – ${f.hasta ? fecha(f.hasta) : 'hoy'}`,
    `Material: ${f.material ? nombreMaterial(f.material) : 'todos'}`,
    `Organización: ${f.busqueda || 'todas'}`,
  ].join('   ·   ');
}

// ─── CSV ───

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function descargarCsv(aportes: Aporte[], f: Filtros) {
  const encabezado = [
    'Fecha',
    'Organización',
    'CUIT',
    'Material',
    'Kg',
    'Puntos ECO',
    'Verificado on-chain',
  ];
  const lineas = [...aportes]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((a) =>
      [
        a.fecha.slice(0, 10),
        a.organizacion,
        a.cuit,
        nombreMaterial(a.material),
        a.kg,
        a.puntos,
        a.verificado ? 'Sí' : 'No',
      ]
        .map(csvCell)
        .join(','),
    );
  const csv = [encabezado.join(','), ...lineas].join('\n');
  descargar(
    new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }),
    nombreArchivo(f, 'csv'),
  );
}

// ─── Excel ───

const VERDE = 'FF1D9E75';
const VERDE_SUAVE = 'FFE8F5EF';
const GRIS = 'FFF7F7F5';
const BORDE = 'FFE6E7E9';
const TINTA = 'FF0F1115';
const TINTA2 = 'FF6B7076';

const FMT_KG = '#,##0.0 "kg"';
const FMT_INT = '#,##0';
const FMT_PCT = '0.0%';

interface Col {
  header: string;
  width: number;
  fmt?: string;
}

/** Título, subtítulo y tabla con encabezado verde, cebra, autofiltro y fila de totales opcional. */
function tabla(
  ws: Worksheet,
  titulo: string,
  subtitulo: string,
  cols: Col[],
  filas: (string | number | Date)[][],
  totales?: (string | number)[],
) {
  ws.views = [{ state: 'frozen', ySplit: 4, showGridLines: false }];
  cols.forEach((c, i) => (ws.getColumn(i + 1).width = c.width));

  ws.mergeCells(1, 1, 1, cols.length);
  const t = ws.getCell(1, 1);
  t.value = titulo;
  t.font = { bold: true, size: 15, color: { argb: TINTA } };
  ws.getRow(1).height = 26;
  ws.mergeCells(2, 1, 2, cols.length);
  const s = ws.getCell(2, 1);
  s.value = subtitulo;
  s.font = { size: 10, color: { argb: TINTA2 } };

  const head = ws.getRow(4);
  head.values = cols.map((c) => c.header);
  head.height = 32;
  head.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: VERDE } };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
  });

  filas.forEach((valores, i) => {
    const row = ws.getRow(5 + i);
    row.values = valores;
    row.eachCell({ includeEmpty: true }, (cell, n) => {
      const col = cols[n - 1];
      if (!col) return;
      if (col.fmt) cell.numFmt = col.fmt;
      if (i % 2 === 1)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: GRIS },
        };
      cell.border = { bottom: { style: 'thin', color: { argb: BORDE } } };
    });
  });

  if (totales) {
    const row = ws.getRow(5 + filas.length);
    row.values = totales;
    row.eachCell({ includeEmpty: true }, (cell: Cell, n) => {
      const col = cols[n - 1];
      if (!col) return;
      if (col.fmt) cell.numFmt = col.fmt;
      cell.font = { bold: true, color: { argb: TINTA } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: VERDE_SUAVE },
      };
      cell.border = { top: { style: 'thin', color: { argb: VERDE } } };
    });
  }

  ws.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: 4 + filas.length, column: cols.length },
  };
  ws.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
  };
}

export async function descargarExcel(aportes: Aporte[], f: Filtros) {
  // Import dinámico: exceljs pesa ~1 MB, solo se baja al exportar.
  const { default: ExcelJS } = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'EcoToken';
  wb.created = new Date();

  const filtros = describirFiltros(f);
  const resumen = resumir(aportes);
  const materiales = porMaterial(aportes);
  const organizaciones = porOrganizacion(aportes);
  const nombresMat = materiales.map((m) => m.material);
  const meses = porMes(aportes, f.desde, f.hasta);
  const kgTotal = resumen.kg || 1;

  // 1. Resumen
  const ws = wb.addWorksheet('Resumen', {
    properties: { tabColor: { argb: VERDE } },
  });
  ws.views = [{ showGridLines: false }];
  ws.getColumn(1).width = 34;
  ws.getColumn(2).width = 22;
  ws.getColumn(3).width = 4;
  ws.getColumn(4).width = 22;
  ws.getColumn(5).width = 16;
  ws.getColumn(6).width = 12;
  ws.mergeCells('A1:F1');
  ws.getCell('A1').value = 'Panel de Gestión Ambiental — Informe de reciclaje';
  ws.getCell('A1').font = { bold: true, size: 18, color: { argb: VERDE } };
  ws.getRow(1).height = 30;
  ws.mergeCells('A2:F2');
  ws.getCell('A2').value = filtros;
  ws.getCell('A2').font = { size: 10, color: { argb: TINTA2 } };
  ws.mergeCells('A3:F3');
  ws.getCell('A3').value =
    `Generado el ${new Date().toLocaleString('es-AR')} · EcoToken`;
  ws.getCell('A3').font = { size: 9, italic: true, color: { argb: TINTA2 } };

  const principal = materiales[0];
  const kpis: [string, number | string, string?][] = [
    ['Organizaciones participantes', resumen.organizaciones, FMT_INT],
    ['Material recuperado', resumen.kg, FMT_KG],
    ['Aportes registrados', resumen.aportes, FMT_INT],
    [
      'Promedio por aporte',
      resumen.aportes ? resumen.kg / resumen.aportes : 0,
      FMT_KG,
    ],
    ['Puntos ECO reconocidos', resumen.puntos, FMT_INT],
    [
      'Material principal',
      principal
        ? `${nombreMaterial(principal.material)} (${principal.pct.toFixed(1)}%)`
        : '—',
    ],
    ['Tipos de materiales recuperados', materiales.length, FMT_INT],
  ];
  ws.getCell('A5').value = 'Indicadores principales';
  ws.getCell('A5').font = { bold: true, size: 12, color: { argb: TINTA } };
  kpis.forEach(([label, valor, fmt], i) => {
    const r = 6 + i;
    const a = ws.getCell(r, 1);
    const b = ws.getCell(r, 2);
    a.value = label;
    a.font = { color: { argb: TINTA2 } };
    b.value = valor;
    b.font = { bold: true, size: 12, color: { argb: TINTA } };
    b.alignment = { horizontal: 'right' };
    if (fmt) b.numFmt = fmt;
    for (const c of [a, b]) {
      c.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: i % 2 ? 'FFFFFFFF' : VERDE_SUAVE },
      };
      c.border = { bottom: { style: 'thin', color: { argb: BORDE } } };
    }
  });

  ws.getCell('D5').value = 'Composición por material';
  ws.getCell('D5').font = { bold: true, size: 12, color: { argb: TINTA } };
  ['Material', 'Kg', '%'].forEach((h, i) => {
    const c = ws.getCell(6, 4 + i);
    c.value = h;
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: VERDE } };
    c.alignment = { horizontal: i ? 'right' : 'left' };
  });
  materiales.forEach((m, i) => {
    const r = 7 + i;
    ws.getCell(r, 4).value = nombreMaterial(m.material);
    ws.getCell(r, 5).value = m.kg;
    ws.getCell(r, 5).numFmt = FMT_KG;
    ws.getCell(r, 6).value = m.pct / 100;
    ws.getCell(r, 6).numFmt = FMT_PCT;
    for (let c = 4; c <= 6; c++)
      ws.getCell(r, c).border = {
        bottom: { style: 'thin', color: { argb: BORDE } },
      };
  });
  ws.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
  };

  // 2. Materiales
  tabla(
    wb.addWorksheet('Materiales'),
    'Material recuperado por tipo',
    filtros,
    [
      { header: 'Material', width: 22 },
      { header: 'Kg reciclados', width: 16, fmt: FMT_KG },
      { header: '% del total', width: 13, fmt: FMT_PCT },
      { header: 'Aportes', width: 11, fmt: FMT_INT },
      { header: 'Organizaciones', width: 15, fmt: FMT_INT },
      { header: 'Kg promedio por aporte', width: 20, fmt: FMT_KG },
    ],
    materiales.map((m) => [
      nombreMaterial(m.material),
      m.kg,
      m.pct / 100,
      m.aportes,
      new Set(
        aportes
          .filter((a) => a.material === m.material)
          .map((a) => a.organizacionId),
      ).size,
      m.kg / m.aportes,
    ]),
    [
      'Total',
      resumen.kg,
      1,
      resumen.aportes,
      resumen.organizaciones,
      resumen.aportes ? resumen.kg / resumen.aportes : 0,
    ],
  );

  // 3. Organizaciones (con kg por material)
  tabla(
    wb.addWorksheet('Organizaciones'),
    'Participación por organización',
    filtros,
    [
      { header: 'Posición', width: 10, fmt: FMT_INT },
      { header: 'Organización', width: 30 },
      { header: 'CUIT', width: 16 },
      { header: 'Kg reciclados', width: 15, fmt: FMT_KG },
      { header: '% del total', width: 12, fmt: FMT_PCT },
      ...nombresMat.map((m) => ({
        header: `${nombreMaterial(m)} (kg)`,
        width: 15,
        fmt: FMT_KG,
      })),
      { header: 'Puntos ECO', width: 12, fmt: FMT_INT },
      { header: 'Aportes', width: 10, fmt: FMT_INT },
      { header: 'Kg promedio', width: 13, fmt: FMT_KG },
      { header: 'Material principal', width: 18 },
      { header: 'Primer aporte', width: 14 },
      { header: 'Último aporte', width: 14 },
      { header: 'Verificados on-chain', width: 14, fmt: FMT_INT },
    ],
    organizaciones.map((o, i) => [
      i + 1,
      o.nombre,
      o.cuit,
      o.kg,
      o.kg / kgTotal,
      ...nombresMat.map((m) => o.kgPorMaterial[m] ?? 0),
      o.puntos,
      o.aportes,
      o.promedio,
      nombreMaterial(o.materialPrincipal),
      fecha(o.primerAporte),
      fecha(o.ultimoAporte),
      o.verificados,
    ]),
    [
      '',
      'Total',
      '',
      resumen.kg,
      1,
      ...materiales.map((m) => m.kg),
      resumen.puntos,
      resumen.aportes,
      resumen.aportes ? resumen.kg / resumen.aportes : 0,
      '',
      '',
      '',
      aportes.filter((a) => a.verificado).length,
    ],
  );

  // 4. Evolución mensual
  tabla(
    wb.addWorksheet('Evolución mensual'),
    'Evolución mensual del reciclaje',
    filtros,
    [
      { header: 'Mes', width: 14 },
      { header: 'Kg totales', width: 14, fmt: FMT_KG },
      ...nombresMat.map((m) => ({
        header: `${nombreMaterial(m)} (kg)`,
        width: 15,
        fmt: FMT_KG,
      })),
      { header: 'Aportes', width: 10, fmt: FMT_INT },
      { header: 'Organizaciones', width: 15, fmt: FMT_INT },
      { header: 'Puntos ECO', width: 12, fmt: FMT_INT },
    ],
    meses.map((m) => [
      `${m.mes.slice(5, 7)}/${m.mes.slice(0, 4)}`,
      m.total,
      ...nombresMat.map((mat) => m.porMaterial[mat] ?? 0),
      m.aportes,
      m.organizaciones,
      m.puntos,
    ]),
    [
      'Total',
      resumen.kg,
      ...materiales.map((m) => m.kg),
      resumen.aportes,
      resumen.organizaciones,
      resumen.puntos,
    ],
  );

  // 5. Detalle de aportes
  tabla(
    wb.addWorksheet('Detalle de aportes'),
    'Detalle de aportes registrados',
    filtros,
    [
      { header: 'Fecha', width: 12 },
      { header: 'Organización', width: 30 },
      { header: 'CUIT', width: 16 },
      { header: 'Material', width: 16 },
      { header: 'Kg', width: 11, fmt: FMT_KG },
      { header: 'Puntos ECO', width: 12, fmt: FMT_INT },
      { header: 'Verificado on-chain', width: 18 },
    ],
    [...aportes]
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .map((a) => [
        fecha(a.fecha),
        a.organizacion,
        a.cuit,
        nombreMaterial(a.material),
        a.kg,
        a.puntos,
        a.verificado ? '✓ Sí' : 'No',
      ]),
    [
      'Total',
      '',
      '',
      '',
      resumen.kg,
      resumen.puntos,
      `${aportes.filter((a) => a.verificado).length} verificados`,
    ],
  );

  const buffer = await wb.xlsx.writeBuffer();
  descargar(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    nombreArchivo(f, 'xlsx'),
  );
}
