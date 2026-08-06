/** Concatena clases de Tailwind, descartando valores falsy. */
export function cx(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ');
}
