"use client";

import { useState } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Send,
  User,
  MapPin,
  Phone,
  CreditCard,
  Clock,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size} fill="currentColor">
    <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.495-1.318.114-.244.114-.515.114-.773 0-.4-.4-.55-.7-.7-.5-.244-1-.515-1.5-.745v.025zM16.515 30.5c-2.92 0-5.71-.83-8.07-2.4l-5.62 1.79 1.83-5.45A14.45 14.45 0 0 1 2.07 16.06C2.07 8.05 8.55 1.57 16.56 1.57c3.88 0 7.52 1.51 10.26 4.25 2.74 2.74 4.25 6.38 4.25 10.26 0 8.01-6.55 14.5-14.55 14.5zm-.04-26.43c-6.61 0-12 5.39-12 12 0 2.27.64 4.48 1.85 6.39l-1.06 3.18 3.29-1.05c1.85 1.21 4 1.85 6.21 1.85 6.61 0 12-5.39 12-12 0-3.21-1.25-6.22-3.52-8.49-2.27-2.27-5.28-3.52-8.49-3.52v-.36z" />
  </svg>
);

const DEFAULT_TEMPLATE = `☕ NUEVO PEDIDO ☕

👤 Nombre: {nombre}
📍 Dirección: {direccion}
📞 Número de contacto: {telefono}
💳 Método de pago: {pago}

📝 Pedido:
{items}

💰 Total: {total}

🕒 Hora de entrega / recoger: ___________

☕ ¡Gracias por pedir con nosotros!`;

export default function CartModal() {
  const { items, removeItem, updateQty, clearCart, totalPrice, isOpen, setIsOpen, whatsappNumber, cartTemplate } = useCart();

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    pago: "Efectivo",
  });

  if (!isOpen) return null;

  const formatCOP = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
      .format(n)
      .replace("COP", "")
      .trim();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    const itemsText = items
      .map((i) => {
        const label = i.selectedPrice.label !== "Precio" ? ` (${i.selectedPrice.label})` : "";
        return `  • ${i.quantity}x ${i.menuItem.name}${label} — $${formatCOP(i.selectedPrice.price * i.quantity)}`;
      })
      .join("\n");

    const template = (cartTemplate || DEFAULT_TEMPLATE)
      .replace("{nombre}", form.nombre)
      .replace("{direccion}", form.direccion)
      .replace("{telefono}", form.telefono)
      .replace("{pago}", form.pago)
      .replace("{items}", itemsText)
      .replace("{total}", `$${formatCOP(totalPrice)}`);

    const encoded = encodeURIComponent(template);
    const number = whatsappNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${number}?text=${encoded}`, "_blank", "noopener,noreferrer");

    clearCart();
    setIsOpen(false);
    setForm({ nombre: "", direccion: "", telefono: "", pago: "Efectivo" });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-espresso/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="menu-card w-full sm:max-w-xl max-h-[95dvh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 sm:m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-latte">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 grid place-items-center rounded-full bg-parchment text-roast border border-latte">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-espresso text-lg leading-tight">Mi Pedido</h2>
              <p className="text-[10px] label-stamp text-roast">{items.length} producto{items.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-parchment rounded-full transition-colors text-espresso/60 hover:text-espresso"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Items list */}
          <div className="px-5 py-4 space-y-3">
            {items.map((item) => {
              const label = item.selectedPrice.label !== "Precio" ? ` · ${item.selectedPrice.label}` : "";
              return (
                <div
                  key={`${item.menuItem.id}-${item.selectedPrice.id}`}
                  className="flex items-center gap-3 bg-parchment/50 rounded-xl px-4 py-3 border border-latte/40"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm font-semibold text-espresso truncate">
                      {item.menuItem.name}
                      <span className="font-normal text-muted-foreground text-xs">{label}</span>
                    </p>
                    <p className="text-xs text-roast font-semibold mt-0.5">
                      ${formatCOP(item.selectedPrice.price)} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQty(item.menuItem.id, item.selectedPrice.id, -1)}
                      className="h-7 w-7 grid place-items-center rounded-full border border-latte bg-cream hover:bg-espresso hover:text-cream transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center font-bold text-sm text-espresso tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.menuItem.id, item.selectedPrice.id, 1)}
                      className="h-7 w-7 grid place-items-center rounded-full border border-latte bg-cream hover:bg-espresso hover:text-cream transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <p className="w-16 text-right font-serif text-sm font-bold text-espresso tabular-nums shrink-0">
                    ${formatCOP(item.selectedPrice.price * item.quantity)}
                  </p>

                  <button
                    onClick={() => removeItem(item.menuItem.id, item.selectedPrice.id)}
                    className="p-1.5 text-latte hover:text-roast transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Total bar */}
          <div className="mx-5 mb-4 px-4 py-3 bg-espresso text-cream rounded-xl flex justify-between items-center">
            <span className="label-stamp text-cream/80 text-[0.65rem]">Total estimado</span>
            <span className="font-serif text-xl font-bold tabular-nums">${formatCOP(totalPrice)}</span>
          </div>

          {/* Order form */}
          <form id="cart-whatsapp-form" onSubmit={handleSend} className="px-5 pb-6 space-y-4 border-t border-latte/40 pt-4">
            <h3 className="label-stamp text-roast text-[0.65rem] flex items-center gap-2">
              <Send size={12} />
              Datos para el pedido
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] label-stamp text-latte flex items-center gap-1">
                  <User size={10} /> Nombre
                </label>
                <input
                  required
                  placeholder="Tu nombre..."
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full bg-parchment border border-latte rounded-xl px-3 py-2.5 text-espresso text-sm placeholder:text-espresso/30 focus:outline-none focus:ring-2 focus:ring-roast/20 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] label-stamp text-latte flex items-center gap-1">
                  <Phone size={10} /> Número de contacto
                </label>
                <input
                  required
                  placeholder="Ej: 310 0000000"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full bg-parchment border border-latte rounded-xl px-3 py-2.5 text-espresso text-sm placeholder:text-espresso/30 focus:outline-none focus:ring-2 focus:ring-roast/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] label-stamp text-latte flex items-center gap-1">
                <MapPin size={10} /> Dirección / Punto de recogida
              </label>
              <input
                required
                placeholder="Tu dirección o escribe 'Recojo en el local'"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className="w-full bg-parchment border border-latte rounded-xl px-3 py-2.5 text-espresso text-sm placeholder:text-espresso/30 focus:outline-none focus:ring-2 focus:ring-roast/20 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] label-stamp text-latte flex items-center gap-1">
                <CreditCard size={10} /> Método de pago
              </label>
              <div className="flex gap-3">
                {["Efectivo", "Transferencia"].map((method) => (
                  <label
                    key={method}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-serif ${
                      form.pago === method
                        ? "bg-espresso text-cream border-espresso"
                        : "bg-parchment border-latte text-espresso hover:border-roast"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pago"
                      value={method}
                      checked={form.pago === method}
                      onChange={() => setForm({ ...form, pago: method })}
                      className="sr-only"
                    />
                    {method === "Efectivo" ? "💵" : "🏦"} {method}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-serif italic bg-parchment/60 rounded-lg p-2.5 border border-latte/30">
              <Clock size={12} className="text-roast shrink-0" />
              El tiempo de entrega / recoger se coordinará directamente por WhatsApp.
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-latte bg-cream flex gap-3">
          <button
            type="button"
            onClick={() => { clearCart(); setIsOpen(false); }}
            className="flex-1 py-3 rounded-xl border border-latte text-espresso font-serif text-sm hover:bg-parchment transition-colors"
          >
            Vaciar
          </button>
          <button
            type="submit"
            form="cart-whatsapp-form"
            className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl bg-[#25D366] text-white font-serif font-bold text-base hover:bg-[#20b558] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
          >
            <WhatsAppIcon size={20} />
            Enviar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}
