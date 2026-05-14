"use client";

import { useState, useContext } from "react";
import { MenuItem, ItemPrice } from "@/lib/types";
import { Image as ImageIcon, X, ShoppingCart, Check } from "lucide-react";
import { CartContext } from "@/context/CartContext";

interface Props {
  item: MenuItem;
  showImage?: boolean;
}

// ── Add-to-cart dialog ──────────────────────────────────────────────────────
function AddDialog({
  item,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  onClose: () => void;
  onAdd: (price: ItemPrice) => void;
}) {
  const isSingle = item.prices.length === 1;

  return (
    // light overlay
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-espresso/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="menu-card w-full max-w-sm animate-in slide-in-from-bottom-3 sm:zoom-in-90 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-latte/50 flex items-start gap-3">
          <div className="h-9 w-9 grid place-items-center rounded-full bg-parchment text-roast border border-latte shrink-0">
            <ShoppingCart size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif font-bold text-espresso text-base leading-snug">
              {item.name}
            </p>
            {isSingle && (
              <p className="text-xs text-roast font-semibold mt-0.5 tabular-nums">
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                })
                  .format(item.prices[0].price)
                  .replace("COP", "")
                  .trim()}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-latte hover:text-espresso transition-colors shrink-0 -mt-0.5"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Single price — confirm */}
          {isSingle && (
            <>
              <p className="text-sm font-serif italic text-muted-foreground mb-5 text-center">
                &iquest;A&ntilde;adir este producto al pedido?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-latte text-espresso font-serif text-sm hover:bg-parchment transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => onAdd(item.prices[0])}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-espresso text-cream font-serif font-semibold text-sm hover:bg-roast hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Check size={15} />
                  S&iacute;, agregar
                </button>
              </div>
            </>
          )}

          {/* Multi-variant — pick one */}
          {!isSingle && (
            <>
              <p className="text-sm font-serif italic text-muted-foreground mb-4 text-center">
                &iquest;Qu&eacute; versi&oacute;n quieres a&ntilde;adir?
              </p>
              <div className="flex flex-col gap-2.5">
                {item.prices.map((price) => {
                  const priceFormatted = new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0,
                  })
                    .format(price.price)
                    .replace("COP", "")
                    .trim();

                  return (
                    <button
                      key={price.id}
                      onClick={() => onAdd(price)}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-latte bg-parchment hover:bg-espresso hover:text-cream hover:border-espresso group transition-all duration-150"
                    >
                      <div className="text-left">
                        <span className="block font-serif font-semibold text-base text-espresso group-hover:text-cream transition-colors">
                          {price.label !== "Precio" ? price.label : item.name}
                        </span>
                        <span className="block text-xs text-roast group-hover:text-cream/80 font-semibold tabular-nums transition-colors">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-serif font-bold text-lg text-espresso group-hover:text-cream tabular-nums transition-colors">
                          ${priceFormatted}
                        </span>
                        <div className="h-7 w-7 flex items-center justify-center rounded-full border border-latte bg-cream group-hover:bg-cream/20 group-hover:border-cream/40 transition-all">
                          <ShoppingCart size={13} className="text-roast group-hover:text-cream transition-colors" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={onClose}
                className="w-full mt-3 py-2 text-sm font-serif text-muted-foreground hover:text-espresso transition-colors"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function MenuItemCard({ item, showImage = false }: Props) {
  const [imageOpen, setImageOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
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

  const totalInCart = cart
    ? cart.items
        .filter((i) => i.menuItem.id === item.id)
        .reduce((s, i) => s + i.quantity, 0)
    : 0;

  const handleAdd = (price: ItemPrice) => {
    cart?.addItem(item, price);
    setDialogOpen(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <>
      <li
        onClick={() => hasImage && setImageOpen(true)}
        className={`py-3.5 sm:py-4 first:pt-0 last:pb-0 border-b border-dashed border-latte/60 last:border-0 list-none group ${
          hasImage
            ? "cursor-pointer hover:bg-parchment/30 transition-colors -mx-3 px-3 rounded-lg"
            : ""
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Name + price + description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
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

            <div className="mt-1 flex items-baseline justify-between gap-3">
              {item.description && (
                <p
                  className="text-xs sm:text-sm text-muted-foreground italic font-serif leading-snug max-w-2xl"
                  style={{ fontFamily: item.font_family_description }}
                >
                  {item.description}
                </p>
              )}
              {labelsString && (
                <span className="label-stamp text-roast shrink-0 text-[0.62rem] sm:text-xs">
                  {labelsString}
                </span>
              )}
            </div>
          </div>

          {/* Cart icon button */}
          {hasCart && (
            <div className="shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setDialogOpen(true)}
                aria-label="Agregar al pedido"
                className={`relative h-9 w-9 flex items-center justify-center rounded-full border transition-all duration-200 ${
                  justAdded
                    ? "bg-botanical border-botanical text-cream scale-110"
                    : "bg-parchment border-latte text-roast hover:bg-espresso hover:text-cream hover:border-espresso hover:scale-105 active:scale-95"
                }`}
              >
                <ShoppingCart size={15} />
                {totalInCart > 0 && !justAdded && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-espresso text-cream text-[9px] font-bold leading-none">
                    {totalInCart > 9 ? "9+" : totalInCart}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </li>

      {/* Add dialog */}
      {dialogOpen && hasCart && (
        <AddDialog
          item={item}
          onClose={() => setDialogOpen(false)}
          onAdd={handleAdd}
        />
      )}

      {/* Image modal */}
      {imageOpen && hasImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-espresso/60 backdrop-blur-sm"
            onClick={() => setImageOpen(false)}
          />
          <div className="relative menu-card w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setImageOpen(false)}
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
                <button
                  onClick={() => { setImageOpen(false); setDialogOpen(true); }}
                  className="inline-flex items-center gap-2 mt-2 bg-espresso text-cream px-6 py-2.5 rounded-full font-serif font-semibold text-sm hover:bg-roast transition-all"
                >
                  <ShoppingCart size={15} />
                  Agregar al pedido
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
