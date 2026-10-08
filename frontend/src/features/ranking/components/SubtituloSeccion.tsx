/** Subtítulo centrado que separa el ranking personal del general. */
export function SubtituloSeccion({
  titulo,
  detalle,
}: {
  titulo: string;
  detalle: string;
}) {
  return (
    <div className="text-center">
      <h2 className="text-xl font-bold tracking-tight text-eco-ink sm:text-2xl">
        {titulo}
      </h2>
      <p className="mt-1 text-sm text-eco-ink2">{detalle}</p>
    </div>
  );
}
