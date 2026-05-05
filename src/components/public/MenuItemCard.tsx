"use client";

import { useState } from "react";
import { MenuItem } from "@/lib/types";
import { Image as ImageIcon, X } from "lucide-react";

interface Props {
  item: MenuItem;
  showImage?: boolean;
}

export default function MenuItemCard({ item, showImage = false }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price).replace("COP", "").trim();
  };

  const pricesString = item.prices.map(p => formatPrice(p.price)).join(" / ");
  const labelsString = item.prices.filter(p => p.label !== "Precio").map(p => p.label).join(" / ");
  const hasImage = showImage && item.image_url;

  return (
    <>
      <li 
        onClick={() => hasImage && setModalOpen(true)}
        className={`py-3.5 sm:py-4 first:pt-0 last:pb-0 border-b border-dashed border-latte/60 last:border-0 list-none group ${
          hasImage ? "cursor-pointer hover:bg-parchment/30 transition-colors -mx-3 px-3 rounded-lg" : ""
        }`}
      >
        <div className="flex items-baseline gap-2">
          <h4 className={`font-serif text-base sm:text-lg md:text-xl text-espresso font-semibold leading-tight min-w-0 ${hasImage ? "group-hover:text-botanical transition-colors flex items-center gap-2" : ""}`}>
            {item.name}
            {hasImage && <ImageIcon size={14} className="text-latte group-hover:text-botanical transition-colors shrink-0" />}
          </h4>
          <span className="dot-leader hidden sm:block" aria-hidden="true"></span>
          <span className="ml-auto sm:ml-0 font-serif text-sm sm:text-base md:text-lg text-espresso font-semibold whitespace-nowrap tabular-nums">
            {pricesString}
          </span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          {item.description && (
            <p className="text-xs sm:text-sm text-muted-foreground italic font-serif leading-snug max-w-2xl">
              {item.description}
            </p>
          )}
          {labelsString && (
            <span className="label-stamp text-roast shrink-0 text-[0.62rem] sm:text-xs">
              {labelsString}
            </span>
          )}
        </div>
      </li>

      {/* Image Modal */}
      {modalOpen && hasImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative menu-card w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 z-10 p-2 bg-espresso/50 text-cream rounded-full hover:bg-espresso backdrop-blur-md transition-colors"
            >
              <X size={20} />
            </button>
            <div className="aspect-square bg-parchment relative w-full border-b border-latte">
              <img src={item.image_url!} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 bg-cream text-center space-y-3">
              <h3 className="font-serif text-2xl font-bold text-espresso leading-tight">{item.name}</h3>
              {item.description && (
                <p className="font-serif italic text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
              <div className="pt-2 font-serif text-xl font-bold text-roast tabular-nums">
                {pricesString}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
