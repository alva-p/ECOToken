/**
 * Datos de contacto del equipo y plantilla de solicitud de alta de cooperativa
 * (E3-HU06). Las cooperativas no se registran solas: el administrador las da de
 * alta (E4-HU01). Desde la landing y el login solicitan el alta por mail con
 * esta plantilla predefinida.
 */

/** Correo de contacto del equipo (mismo que usa la landing). */
export const EMAIL_CONTACTO = 'somosecotoken@gmail.com';

const ASUNTO_ALTA_COOPERATIVA =
  'Solicitud de alta como cooperativa validadora — ECOToken';

const CUERPO_ALTA_COOPERATIVA = [
  'Hola equipo de ECOToken,',
  '',
  'Somos una cooperativa de reciclaje y queremos sumarnos como validadoras.',
  'Nuestros datos:',
  '',
  '- Razón social:',
  '- CUIT:',
  '- Localidad:',
  '- Persona de contacto:',
  '- Teléfono:',
  '- Email:',
  '',
  'Quedamos a la espera de los pasos para el alta. ¡Gracias!',
].join('\n');

/**
 * Link `mailto:` para que una cooperativa solicite el alta, con asunto y cuerpo
 * predefinidos. Se usa igual en la landing y en el login.
 */
export function mailtoAltaCooperativa(): string {
  const asunto = encodeURIComponent(ASUNTO_ALTA_COOPERATIVA);
  const cuerpo = encodeURIComponent(CUERPO_ALTA_COOPERATIVA);
  return `mailto:${EMAIL_CONTACTO}?subject=${asunto}&body=${cuerpo}`;
}
