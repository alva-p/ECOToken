import type { ButtonHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonColor = 'ink' | 'org' | 'coop' | 'muni' | 'danger';

// Tailwind necesita las clases completas en el código fuente (JIT), por eso van
// enumeradas acá en vez de armarlas con template strings.
const VARIANT_CLASSES: Record<ButtonColor, Record<ButtonVariant, string>> = {
  ink: {
    solid: 'bg-eco-ink text-white border-transparent hover:bg-eco-ink/90',
    outline: 'bg-white text-eco-ink border-eco-border-strong hover:bg-eco-bg',
    ghost: 'bg-transparent text-eco-ink border-transparent hover:bg-eco-bg',
  },
  org: {
    solid: 'bg-eco-org text-white border-transparent hover:bg-eco-org/90',
    outline: 'bg-white text-eco-org border-eco-org hover:bg-eco-org-soft',
    ghost:
      'bg-transparent text-eco-org border-transparent hover:bg-eco-org-soft',
  },
  coop: {
    solid: 'bg-eco-coop text-white border-transparent hover:bg-eco-coop/90',
    outline: 'bg-white text-eco-coop border-eco-coop hover:bg-eco-coop-soft',
    ghost:
      'bg-transparent text-eco-coop border-transparent hover:bg-eco-coop-soft',
  },
  muni: {
    solid: 'bg-eco-muni text-white border-transparent hover:bg-eco-muni/90',
    outline: 'bg-white text-eco-muni border-eco-muni hover:bg-eco-muni-soft',
    ghost:
      'bg-transparent text-eco-muni border-transparent hover:bg-eco-muni-soft',
  },
  danger: {
    solid: 'bg-eco-danger text-white border-transparent hover:bg-eco-danger/90',
    outline: 'bg-white text-eco-danger border-eco-danger hover:bg-red-50',
    ghost: 'bg-transparent text-eco-danger border-transparent hover:bg-red-50',
  },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
}

export function Button({
  variant = 'solid',
  color = 'ink',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        'rounded-lg border px-4 py-2.5 text-sm font-semibold tracking-tight transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[color][variant],
        className,
      )}
      {...props}
    />
  );
}
