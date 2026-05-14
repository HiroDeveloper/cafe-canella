"use client";

import { useState, useContext } from "react";
import { MenuItem, ItemPrice } from "@/lib/types";
import { Image as ImageIcon, X, Plus, Minus, ShoppingCart } from "lucide-react";
import { CartContext } from "@/context/CartContext";

interface Props {
  item: MenuItem;
  showImage?: boolean;
}

// ── Inline stepper ──────────────────────────────────────────────────────────
// qty=0 → shows a "+" circle. qty>0 → shows [−] n [+] pill.
function Stepper({
  qty,
  label,
  onAdd,
  onRemove,
}: {
  qty: number;
  label?: string;
  onAdd: (e: React.MouseEvent) => void;
  onRemove: (e: React.MouseEvent) => void;
}) {
  if (qty === 0) {
    return (
      <button
        onClick={onAdd}
        aria-label={label ? `Agregar ${label}` : "Agregar al pedido"}
        className="h-8 w-8 flex items-center justify-center rounded-full border border-latte bg-parchment text-roast hover:bg-espresso hover:text-cream hover:border-espresso active:scale-90 transition-all duration-150 shrink-0 shadow-sm"
      >
        <Plus size={15} strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-0 bg-espresso text-cream rounded-full overflow-hidden shadow-sm shrink-0 transition-all duration-200 animate-in zoom-in-75">
      <button
        onClick={onRemove}
        aria-label="Quitar uno"
        className="h-8 w-8 flex items-center justify-center hover:bg-cream/15 active:scale-90 transition-all"
      >
        <Minus size={12} strokeWidth={2.5} />
      </button>
      <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums select-none leading-none">
        {qty}
      </span>
      <button
        onClick={onAdd}
        aria-label="Agregar uno más"
        className="h-8 w-8 flex items-center justify-center hover:bg-cream/15 active:scale-90 transition-all"
      >
        <Plus size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default function MenuItemCard({ item, showImage = false }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const cart = useContext(CartContext);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace("COP", "")
      .trim();

  const pricesString = item.prices.map((p) => formatPrice(p.price)).join(" / ");
  const labelsString = item.prices
    .filter((p) => p.label !== "Precio")
    .map((p) => p.label)
    .join(" / ");
  const hasImage = showImage && item.image_url;
  const hasCart = !!cart;
  const multipleVariants = item.prices.length > 1;

  const getQty = (priceId: string) =>
    cart?.items.find(
      (i) => i.menuItem.id === item.id && i.selectedPrice.id === priceId
    )?.quantity ?? 0;

  const handleAdd = (e: React.MouseEvent, price: ItemPrice) => {
    e.stopPropagation();
    cart?.addItem(item, price);
  };

  const handleRemove = (e: React.MouseEvent, price: ItemPrice) => {
    e.stopPropagation();
    cart?.updateQty(item.id, price.id, -1);
  };

  return (
    <>
      <li
        onClick={() => hasImage && setModalOpen(true)}
        className={`py-3.5 sm:py-4 first:pt-0 last:pb-0 border-b border-dashed border-latte/60 last:border-0 list-none group ${
          hasImage
            ? "cursor-pointer hover:bg-parchment/30 transition-colors -mx-3 px-3 rounded-lg"
            : ""
        }`}
      >
        {/* ── Single-price layout ── */}
        {!multipleVariants && (
          <div className="flex items-center gap-3">
            {/* Name + description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <h4
                  className={`font-serif text-base sm:text-lg md:text-xl text-espresso font-semibold leading-tight min-w-0 ${
                    hasImage
                      ? "group-hover:text-botanical transition-colors flex items-center gap-1.5"
                      : ""
                  }`}
                  style={{ fontFamily: item.font_family }}
                >
                  {item.name}
                  {hasImage && (
                    <ImageIcon
                      size={13}
                      className="text-latte group-hover:text-botanical transition-colors shrink-0"
                    />
                  )}
                </h4>
                <span className="dot-leader hidden sm:block" aria-hidden="true" />
                <span className="ml-auto sm:ml-0 font-serif text-sm sm:text-base md:text-lg text-espresso font-semibold whitespace-nowrap tabular-nums">
                  {pricesString}
                </span>
              </div>
              {item.description && (
                <p
                  className="mt-1 text-xs sm:text-sm text-muted-foreground italic font-serif leading-snug"
                  style={{ fontFamily: item.font_family_description }}
                >
                  {item.description}
                </p>
              )}
            </div>

            {/* Stepper — right side */}
            {hasCart && (
              <div onClick={(e) => e.stopPropagation()}>
                <Stepper
                  qty={getQty(item.prices[0].id)}
                  onAdd={(e) => handleAdd(e, item.prices[0])}
                  onRemove={(e) => handleRemove(e, item.prices[0])}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Multi-variant layout ── */}
        {multipleVariants && (
          <div>
            <div className="flex items-baseline gap-2">
              <h4
                className={`font-serif text-base sm:text-lg md:text-xl text-espresso font-semibold leading-tight min-w-0 ${
                  hasImage
                    ? "group-hover:text-botanical transition-colors flex items-center gap-1.5"
                    : ""
                }`}
                style={{ fontFamily: item.font_family }}
              >
                {item.name}
                {hasImage && (
                  <ImageIcon
                    size={13}
                    className="text-latte group-hover:text-botanical transition-colors shrink-0"
                  />
                )}
              </h4>
              <span className="dot-leader hidden sm:block" aria-hidden="true" />
              <span className="ml-auto sm:ml-0 font-serif text-sm sm:text-base md:text-lg text-espresso font-semibold whitespace-nowrap tabular-nums">
                {pricesString}
              </span>
            </div>
            {item.description && (
              <p
                className="mt-1 text-xs sm:text-sm text-muted-foreground italic font-serif leading-snug"
                style={{ fontFamily: item.font_family_description }}
              >
                {item.description}
              </p>
            )}

            {/* Variant steppers row */}
            {hasCart && (
              <div
                className="mt-2.5 flex flex-wrap items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {labelsString && (
                  <span className="label-stamp text-roast shrink-0 text-[0.62rem] sm:text-xs mr-1">
                    {labelsString}
                  </span>
                )}
                {item.prices.map((price) => (
                  <div key={price.id} className="flex items-center gap-1.5">
                    {price.label !== "Precio" && (
                      <span className="text-[10px] label-stamp text-muted-foreground">
                        {price.label}
                      </span>
                    )}
                    <Stepper
                      qty={getQty(price.id)}
                      label={price.label}
                      onAdd={(e) => handleAdd(e, price)}
                      onRemove={(e) => handleRemove(e, price)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </li>

      {/* ── Image modal ── */}
      {modalOpen && hasImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-espresso/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative menu-card w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 z-10 p-2 bg-espresso/50 text-cream rounded-full hover:bg-espresso backdrop-blur-md transition-colors"
            >
              <X size={20} />
            </button>
            <div className="aspect-square bg-parchment relative w-full border-b border-latte">
              <img
                src={item.image_url!}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 bg-cream text-center space-y-3">
              <h3
                className="font-serif text-2xl font-bold text-espresso leading-tight"
                style={{ fontFamily: item.font_family }}
              >
                {item.name}
              </h3>
              {item.description && (
                <p
                  className="font-serif italic text-sm text-muted-foreground"
                  style={{ fontFamily: item.font_family_description }}
                >
                  {item.description}
                </p>
              )}
              <div className="pt-1 font-serif text-xl font-bold text-roast tabular-nums">
                {pricesString}
              </div>

              {hasCart && (
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  {item.prices.map((price) => (
                    <div key={price.id} className="flex flex-col items-center gap-1.5">
                      {price.label !== "Precio" && (
                        <span className="text-[10px] label-stamp text-roast">{price.label}</span>
                      )}
                      <Stepper
                        qty={getQty(price.id)}
                        label={price.label}
                        onAdd={(e) => handleAdd(e, price)}
                        onRemove={(e) => handleRemove(e, price)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
