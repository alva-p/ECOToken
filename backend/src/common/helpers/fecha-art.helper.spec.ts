import {
  inicioDiaArt,
  inicioMesArt,
  limiteDiaArt,
  partesArt,
  rangoMesArt,
} from './fecha-art.helper';

describe('fecha-art (GMT-3)', () => {
  it('31/8 22:09 ART (1/9 01:09 UTC) pertenece a agosto', () => {
    expect(partesArt(new Date('2026-09-01T01:09:59Z'))).toEqual({
      anio: 2026,
      mes: 8,
      dia: 31,
    });
    const { gte, lt } = rangoMesArt(8, 2026);
    const t = new Date('2026-09-01T01:09:59Z');
    expect(t >= gte && t < lt).toBe(true);
  });

  it('el mes empieza a las 00:00 ART (03:00 UTC) y desborda a enero', () => {
    expect(inicioMesArt(2026, 10).toISOString()).toBe(
      '2026-10-01T03:00:00.000Z',
    );
    expect(rangoMesArt(12, 2026).lt.toISOString()).toBe(
      '2027-01-01T03:00:00.000Z',
    );
  });

  it('hoy y "N días atrás" se cuentan desde la medianoche argentina', () => {
    const ahora = new Date('2026-10-11T01:00:00Z'); // 10/10 22:00 ART
    expect(inicioDiaArt(0, ahora).toISOString()).toBe(
      '2026-10-10T03:00:00.000Z',
    );
    expect(inicioDiaArt(7, ahora).toISOString()).toBe(
      '2026-10-03T03:00:00.000Z',
    );
  });

  it('un día suelto como filtro cubre el día argentino completo', () => {
    expect(limiteDiaArt('2026-10-10', 'desde').toISOString()).toBe(
      '2026-10-10T03:00:00.000Z',
    );
    expect(limiteDiaArt('2026-10-10', 'hasta').toISOString()).toBe(
      '2026-10-11T02:59:59.999Z',
    );
    expect(limiteDiaArt('2026-10-10T15:00:00Z', 'hasta').toISOString()).toBe(
      '2026-10-10T15:00:00.000Z',
    );
  });
});
