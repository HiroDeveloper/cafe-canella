type Item = {
  nombre: string;
  descripcion?: string;
  precio?: number;
  precio_sencillo?: number;
  precio_doble?: number;
  precio_x1?: number;
  precio_x2?: number;
  precio_agua?: number;
  precio_soda?: number;
  precio_leche?: number;
};

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-CO");

function priceDisplay(item: Item) {
  if (item.precio !== undefined) return fmt(item.precio);
  if (item.precio_sencillo && item.precio_doble)
    return `${fmt(item.precio_sencillo)} / ${fmt(item.precio_doble)}`;
  if (item.precio_x1 && item.precio_x2)
    return `${fmt(item.precio_x1)} / ${fmt(item.precio_x2)}`;
  if (item.precio_agua && item.precio_soda)
    return `${fmt(item.precio_agua)} / ${fmt(item.precio_soda)}`;
  if (item.precio_agua && item.precio_leche)
    return `${fmt(item.precio_agua)} / ${fmt(item.precio_leche)}`;
  return "";
}

function priceSubLabel(item: Item) {
  if (item.precio_sencillo && item.precio_doble) return "sencillo / doble";
  if (item.precio_x1 && item.precio_x2) return "x1 / x2";
  if (item.precio_agua && item.precio_soda) return "agua / soda";
  if (item.precio_agua && item.precio_leche) return "agua / leche";
  return null;
}

export function MenuItem({ item }: { item: Item }) {
  const sub = priceSubLabel(item);
  return (
    <li className="py-3.5 sm:py-4 first:pt-0 last:pb-0 border-b border-dashed border-latte/60 last:border-0">
      <div className="flex items-baseline gap-2">
        <h4 className="font-serif text-base sm:text-lg md:text-xl text-espresso font-semibold leading-tight min-w-0">
          {item.nombre}
        </h4>
        <span className="dot-leader hidden sm:block" aria-hidden />
        <span className="ml-auto sm:ml-0 font-serif text-sm sm:text-base md:text-lg text-espresso font-semibold whitespace-nowrap tabular-nums">
          {priceDisplay(item)}
        </span>
      </div>
      {(item.descripcion || sub) && (
        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          {item.descripcion && (
            <p className="text-xs sm:text-sm text-muted-foreground italic font-serif leading-snug max-w-2xl">
              {item.descripcion}
            </p>
          )}
          {sub && (
            <span className="label-stamp text-roast shrink-0 text-[0.62rem] sm:text-xs">{sub}</span>
          )}
        </div>
      )}
    </li>
  );
}
