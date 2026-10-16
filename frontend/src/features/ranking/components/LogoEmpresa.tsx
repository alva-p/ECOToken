import { API_URL } from '@/lib/api';
import { cx } from '@/lib/cx';

/** Logo de la empresa (ruta pública del backend) o, si no subió uno, sus iniciales. */
export function LogoEmpresa({
  nombre,
  logo,
  className,
}: {
  nombre: string;
  logo?: string | null;
  className?: string;
}) {
  const base = cx(
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-eco-border bg-eco-bg',
    className,
  );
  if (logo) {
    return (
      <img
        src={`${API_URL}${logo}`}
        alt=""
        className={cx(base, 'object-cover')}
      />
    );
  }
  const iniciales = nombre
    .split(/\s+/)
    .filter((p) => /^[a-zA-ZÀ-ÿ0-9]/.test(p))
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
  return (
    <span aria-hidden className={cx(base, 'font-semibold text-eco-ink2')}>
      {iniciales}
    </span>
  );
}
