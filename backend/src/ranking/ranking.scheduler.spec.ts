import { mesAnterior } from './ranking.scheduler';

describe('mesAnterior (E7-HU02)', () => {
  it('devuelve el mes calendario anterior dentro del mismo año', () => {
    // Sin sufijo `Z`: se parsea en hora local, igual que dispara el cron —
    // evita que el resultado dependa del huso horario donde corra el test.
    expect(mesAnterior(new Date('2026-03-01T00:00:00'))).toEqual({
      mes: 2,
      anio: 2026,
    });
  });

  it('en enero, devuelve diciembre del año anterior', () => {
    expect(mesAnterior(new Date('2026-01-15T00:00:00'))).toEqual({
      mes: 12,
      anio: 2025,
    });
  });
});
