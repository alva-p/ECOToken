import { useId, type InputHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Field({ label, error, id, className, ...props }: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-1.5 block text-xs font-semibold text-eco-ink">
        {label}
      </span>
      <input
        id={inputId}
        className={cx(
          'w-full rounded-lg border px-3.5 py-2.5 text-sm text-eco-ink placeholder:text-eco-ink3 focus:outline-none focus:ring-2 focus:ring-offset-1',
          error
            ? 'border-eco-danger focus:ring-eco-danger/30'
            : 'border-eco-border-strong focus:ring-eco-org/30',
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <span id={errorId} className="mt-1 block text-xs text-eco-danger">
          {error}
        </span>
      )}
    </label>
  );
}
