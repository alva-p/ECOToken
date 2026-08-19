import { esCuitValido } from './cuit.helper';

describe('esCuitValido', () => {
  it('acepta un CUIT válido con guiones', () => {
    expect(esCuitValido('20-12345678-6')).toBe(true);
  });

  it('acepta el mismo CUIT válido sin guiones', () => {
    expect(esCuitValido('20123456786')).toBe(true);
  });

  it('rechaza un CUIT con dígito verificador incorrecto', () => {
    expect(esCuitValido('20123456780')).toBe(false);
  });

  it('rechaza longitudes distintas de 11 dígitos', () => {
    expect(esCuitValido('2012345678')).toBe(false);
    expect(esCuitValido('201234567860')).toBe(false);
  });

  it('rechaza valores con caracteres no numéricos o vacíos', () => {
    expect(esCuitValido('20-1234567X-6')).toBe(false);
    expect(esCuitValido('')).toBe(false);
  });
});
