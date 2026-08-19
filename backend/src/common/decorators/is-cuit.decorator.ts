import { registerDecorator, ValidationOptions } from 'class-validator';
import { esCuitValido } from '../helpers/cuit.helper';

/**
 * Decorador de class-validator que valida un CUIT argentino
 * (formato de 11 dígitos + dígito verificador). Ver cuit.helper.ts.
 *
 * Uso: `@IsCuit() cuit: string;`
 */
export function IsCuit(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCuit',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && esCuitValido(value);
        },
        defaultMessage(): string {
          return 'El CUIT no es válido (formato o dígito verificador incorrecto)';
        },
      },
    });
  };
}
