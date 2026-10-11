// Self-check de las métricas del Panel Operativo:
//   node --experimental-strip-types src/features/cooperativa/dashboard/data.check.mjs
import assert from 'node:assert/strict';
import {
  aAportes,
  actividadDiaria,
  calendario,
  comparar,
  entregasDeLaSemana,
  evolucion,
  hoyArt,
  organizaciones,
  resumir,
} from './data.ts';

const e = (fecha, empresaId, material, peso, txHash = '0x1') => ({
  id: fecha + empresaId + material,
  fecha,
  empresaId,
  empresa: empresaId.toUpperCase(),
  material,
  peso,
  tokens: peso * 10,
  txHash,
});

const aportes = aAportes([
  e('2026-09-02T15:00:00.000Z', 'eco', 'PLASTICO', 10),
  e('2026-09-09T15:00:00.000Z', 'top', 'VIDRIO', 20, null),
  // 1 oct 01:30 UTC = 30 sep 22:30 en Argentina: cuenta para septiembre.
  e('2026-10-01T01:30:00.000Z', 'eco', 'CARTON', 100),
  e('2026-10-06T13:00:00.000Z', 'eco', 'PLASTICO', 30),
  e('2026-10-08T13:00:00.000Z', 'esc', 'PLASTICO', 6),
]);
const REF = '2026-10-08'; // jueves

// Hora argentina.
assert.equal(hoyArt(Date.parse('2026-10-11T02:00:00.000Z')), '2026-10-10');
assert.equal(aportes[2].fecha.slice(0, 10), '2026-09-30');

// Resumen: promedio y confirmadas.
const r = resumir(aportes.slice(3));
assert.deepEqual(
  [r.kg, r.entregas, r.organizaciones, r.promedio, r.confirmadas],
  [36, 2, 2, 18, 2],
);
assert.equal(resumir([]).promedio, null);

// Comparación al mismo día: sep 1–8 (10 kg) vs oct 1–8 (36 kg); el del 30/9 queda afuera.
const c = comparar(aportes, REF);
assert.equal(c.anterior.kg, 10);
assert.equal(c.actual.kg, 36);
assert.equal(c.actual.organizaciones, 2);

// Evolución continua.
const ev = evolucion(aportes, 3, REF);
assert.deepEqual(
  ev.map((p) => p.mes),
  ['2026-08', '2026-09', '2026-10'],
);
assert.deepEqual(
  ev.map((p) => p.kg),
  [0, 130, 36],
);

// Actividad diaria: días futuros en null.
const act = actividadDiaria(aportes, REF);
assert.equal(act.length, 31);
assert.equal(act[5].kg, 30);
assert.equal(act[6].kg, 0);
assert.equal(act[8].kg, null);

// Calendario: columnas lunes→domingo, la última contiene ref.
const cal = calendario(aportes, 2, REF);
assert.equal(cal[1][0].fecha, '2026-10-05'); // lunes
assert.equal(cal[1][1].entregas, 1); // martes 6
assert.equal(cal[1][4].futuro, true); // viernes 9
assert.equal(entregasDeLaSemana(aportes, REF), 2);

// Organizaciones: por kg y por última entrega.
assert.equal(organizaciones(aportes, 'kg')[0].id, 'eco');
assert.equal(organizaciones(aportes, 'ultimoAporte')[0].id, 'esc');

console.log('data.check: ok');
