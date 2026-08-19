export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-eco-ink2">
      <span
        aria-hidden
        className="h-5 w-5 animate-spin rounded-full border-2 border-eco-border border-t-eco-org"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return <div className="py-8 text-center text-sm text-eco-ink2">{label}</div>;
}
