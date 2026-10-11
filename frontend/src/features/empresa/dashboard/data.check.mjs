// Self-check de las métricas del Panel de Impacto Ambiental:
//   node --experimental-strip-types src/features/empresa/dashboard/data.check.mjs
import assert from 'node:assert/strict';
import {
  acumuladoDiario,
  alcanza,
  compararConMesAnterior,
  diasDesde,
  diasParaVencer,
  evolucionMensual,
  materialesPorMes,
  porMaterial,
  porSemana,
  ultimoMesConAportes,
} from './data.ts';

const a = (fecha, material, peso, tokens = peso * 10) => ({
  id: fecha + material,
  fecha: `${fecha}T12:00:00.000Z`,
  material,
  peso,
  tokens,
});
const aportes = [
  a('2026-08-02', 'PLASTICO', 10),
  a('2026-08-09', 'VIDRIO', 20),
  a('2026-08-30', 'CARTON', 100), // después del día 10: no entra en la comparación
  a('2026-09-03', 'PLASTICO', 30),
  a('2026-09-10', 'PLASTICO', 15),
  a('2026-09-11', 'VIDRIO', 5), // futuro respecto de ref
];
const REF = '2026-09-10';

// Comparación al mismo día: 45 kg vs 30 kg (no 130).
const c = compararConMesAnterior(aportes, REF);
assert.equal(c.dia, 10);
assert.equal(c.actual.kg, 45);
assert.equal(c.anterior.kg, 30);
assert.equal(c.kg, 50);
assert.equal(c.aportes, 0);
assert.equal(c.actual.materiales, 1);

// Sin base comparable no hay variación (no "+∞%").
assert.equal(
  compararConMesAnterior([a('2026-09-01', 'VIDRIO', 1)], REF).kg,
  null,
);

// Evolución continua: meses vacíos en 0, termina en el mes de ref.
const ev = evolucionMensual(aportes, 3, REF);
assert.deepEqual(
  ev.map((p) => p.mes),
  ['2026-07', '2026-08', '2026-09'],
);
assert.equal(ev[0].kg, 0);
assert.equal(ev[1].kg, 130);
assert.equal(ev[2].aportes, 3);

// Acumulado: corta en hoy para el mes en curso; agosto completo de referencia.
const acc = acumuladoDiario(aportes, REF);
assert.equal(acc.length, 30);
assert.equal(acc[9].actual, 45);
assert.equal(acc[10].actual, null);
assert.equal(acc[29].anterior, 130);
assert.equal(acumuladoDiario(aportes, '2026-03-05')[29].anterior, null); // feb 2026 tiene 28 días

// Materiales: orden por kg, porcentajes suman 100.
const mats = porMaterial(aportes.filter((x) => x.fecha.startsWith('2026-08')));
assert.deepEqual(
  mats.map((m) => m.material),
  ['CARTON', 'VIDRIO', 'PLASTICO'],
);
assert.equal(Math.round(mats.reduce((s, m) => s + m.pct, 0)), 100);
assert.equal(materialesPorMes(aportes, 2, REF)[0].CARTON, 100);

// Semanas de 7 días: el 30 cae en la semana 5.
const sem = porSemana(aportes, '2026-08');
assert.equal(sem.length, 5);
assert.deepEqual(
  sem.map((s) => s.aportes),
  [1, 1, 0, 0, 1],
);

assert.equal(ultimoMesConAportes(aportes, '2026-10-01'), '2026-09');
assert.equal(ultimoMesConAportes([], REF), null);
assert.equal(diasDesde('2026-09-07T23:00:00.000Z', REF), 3);
assert.equal(diasParaVencer('2026-09-10T00:00:00.000Z', REF), 0); // vence hoy
assert.equal(diasParaVencer(null, REF), null);

// Beneficios: sin cupos no alcanza aunque sobre saldo; sin límite (null) sí.
assert.equal(alcanza({ costoTokens: 100, cuposDisponibles: 0 }, 1000), false);
assert.equal(alcanza({ costoTokens: 100, cuposDisponibles: null }, 100), true);
assert.equal(alcanza({ costoTokens: 101, cuposDisponibles: 3 }, 100), false);

console.log('data.check: ok');
