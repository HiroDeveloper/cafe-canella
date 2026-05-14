"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartButton() {
  const { totalItems, setIsOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <button
      id="cart-floating-btn"
      onClick={() => setIsOpen(true)}
      aria-label="Ver carrito"
      className="fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-40 flex items-center gap-2.5 h-14 px-4 rounded-full bg-espresso text-cream shadow-warm-lg hover:scale-105 active:scale-95 transition-all animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="relative">
        <ShoppingCart size={24} />
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366] text-white text-[10px] font-bold shadow-sm animate-in zoom-in duration-200">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      </div>
      <span className="font-serif font-semibold text-sm hidden sm:block">Mi Pedido</span>
    </button>
  );
}
