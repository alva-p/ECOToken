// Self-check de las métricas del dashboard (sin framework de tests en el front):
//   node --experimental-strip-types src/features/municipio/dashboard/data.check.mjs
import assert from 'node:assert/strict';
import {
  comparacionMensual,
  filtrarDimensiones,
  porMes,
  porOrganizacion,
  rangoComparacion,
  rangoPreset,
  sinAportesEnPeriodo,
} from './data.ts';

const ap = (id, fecha, org, material, kg) => ({
  id,
  fecha: `${fecha}T12:00:00.000Z`,
  organizacionId: org,
  organizacion: `Org ${org}`,
  cuit: `30-${org}`,
  material,
  kg,
  puntos: kg * 10,
  verificado: id === 'a1',
});
const todos = [
  ap('a1', '2026-07-10', '1', 'PLÁSTICO', 10),
  ap('a2', '2026-09-05', '1', 'PLÁSTICO', 20),
  ap('a3', '2026-09-06', '2', 'VIDRIO', 10),
  ap('a4', '2026-08-01', '1', 'VIDRIO', 15),
  ap('a5', '2026-06-01', '3', 'CARTÓN', 4),
];

// Presets y comparaciones (fin de mes recortado).
assert.deepEqual(rangoPreset('mesAnterior', '2026-03-15'), {
  desde: '2026-02-01',
  hasta: '2026-02-28',
});
assert.deepEqual(rangoPreset('3m', '2026-01-20'), {
  desde: '2025-11-01',
  hasta: '2026-01-20',
});
assert.deepEqual(rangoComparacion('2026-03-31', '2026-03-31', 'mes'), {
  desde: '2026-02-28',
  hasta: '2026-02-28',
});
assert.deepEqual(rangoComparacion('2026-09-01', '2026-09-30', 'periodo'), {
  desde: '2026-08-02',
  hasta: '2026-08-31',
});
assert.deepEqual(rangoComparacion('2026-09-01', '2026-09-30', 'anio'), {
  desde: '2025-09-01',
  hasta: '2025-09-30',
});
assert.equal(rangoComparacion('', '2026-09-30', 'mes'), null);

// Serie mensual continua: agosto aparece aunque solo tenga un aporte; meses vacíos en 0.
const serie = porMes(todos.filter((a) => a.organizacionId === '1'));
assert.deepEqual(
  serie.map((m) => [m.mes, m.total]),
  [
    ['2026-07', 10],
    ['2026-08', 15],
    ['2026-09', 20],
  ],
);
assert.deepEqual(
  porMes([ap('x', '2026-01-01', '1', 'P', 1)], '2025-12-01', '2026-02-01').map(
    (m) => m.total,
  ),
  [0, 1, 0],
);

// Organización: totales, % y material principal.
const [o1] = porOrganizacion(todos);
assert.equal(o1.kg, 45);
assert.equal(o1.materialPrincipal, 'PLÁSTICO');
assert.equal(o1.verificados, 1);
assert.equal(Math.round(o1.pct), 76);

// Búsqueda por nombre o CUIT.
assert.equal(
  filtrarDimensiones(todos, {
    desde: '',
    hasta: '',
    material: '',
    busqueda: '302',
  }).length,
  1,
);
assert.equal(
  filtrarDimensiones(todos, {
    desde: '',
    hasta: '',
    material: 'VIDRIO',
    busqueda: '',
  }).length,
  2,
);

// Mes contra mes: septiembre (30 kg) vs agosto (15 kg).
const comp = comparacionMensual(
  todos.filter((a) => a.fecha >= '2026-09'),
  todos,
);
assert.equal(comp.mes, '2026-09');
assert.equal(comp.actual.kg, 30);
assert.equal(comp.anterior.kg, 15);
const soloJunio = todos.filter((a) => a.id === 'a5');
assert.equal(comparacionMensual(soloJunio, soloJunio), null); // sin mes previo → sin comparación

// Sin aportes en el período: la org 3 aportó en junio pero no desde agosto.
const periodo = todos.filter((a) => a.fecha >= '2026-08');
assert.deepEqual(
  sinAportesEnPeriodo(todos, periodo, '2026-08-01').map((o) => o.id),
  ['3'],
);

console.log('data.check: ok');
